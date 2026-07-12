"use server";

import { db } from "@/lib/db";
import { trips, vehicles, drivers, settings, fuelLogs } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createTripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  cargoWeightKg: z.number().nonnegative("Cargo weight must be non-negative"),
  plannedDistanceKm: z.number().nonnegative("Planned distance must be non-negative"),
  vehicleId: z.string().uuid("Invalid vehicle selection"),
  driverId: z.string().uuid("Invalid driver selection"),
});

export async function createTripDraft(data: any) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "dispatcher" && session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Dispatchers and Fleet Managers can create trips.");
  }

  // 2. Validate Payload
  const parsed = createTripSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
  }

  const { source, destination, cargoWeightKg, plannedDistanceKm, vehicleId, driverId } = parsed.data;

  // 3. Retrieve vehicle & driver details
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, vehicleId),
  });
  if (!dbVehicle) {
    return { error: "Selected vehicle does not exist.", fields: { vehicleId: ["Vehicle not found"] } };
  }

  const dbDriver = await db.query.drivers.findFirst({
    where: eq(drivers.id, driverId),
  });
  if (!dbDriver) {
    return { error: "Selected driver does not exist.", fields: { driverId: ["Driver not found"] } };
  }

  // 4. Enforce Cargo Weight check
  const vehicleCapacity = parseFloat(dbVehicle.capacityKg);
  if (cargoWeightKg > vehicleCapacity) {
    return {
      error: `Cargo weight (${cargoWeightKg} kg) exceeds vehicle maximum capacity (${vehicleCapacity} kg).`,
      fields: { cargoWeightKg: ["Exceeds vehicle capacity"] },
    };
  }

  // 5. Enforce Dispatch Pool filters
  if (dbVehicle.status === "retired" || dbVehicle.status === "in_shop") {
    return {
      error: `Selected vehicle is currently in '${dbVehicle.status}' status and is not in the dispatch pool.`,
      fields: { vehicleId: ["Vehicle not available for dispatch"] },
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const driverExpiry = new Date(dbDriver.licenseExpiry);
  driverExpiry.setHours(0, 0, 0, 0);

  if (dbDriver.status === "suspended") {
    return {
      error: "Selected driver is suspended.",
      fields: { driverId: ["Driver is suspended"] },
    };
  }

  if (driverExpiry < today) {
    return {
      error: "Selected driver has an expired license.",
      fields: { driverId: ["Driver license is expired"] },
    };
  }

  // 6. Calculate revenue using dynamic Settings ratePerKm
  const setting = await db.query.settings.findFirst();
  const rate = setting ? parseFloat(setting.ratePerKm) : 15.00;
  const calculatedRevenue = (plannedDistanceKm * rate).toFixed(2);

  try {
    await db.insert(trips).values({
      source,
      destination,
      cargoWeightKg: cargoWeightKg.toString(),
      plannedDistanceKm: plannedDistanceKm.toString(),
      revenue: calculatedRevenue,
      vehicleId,
      driverId,
      status: "draft",
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create trip draft." };
  }
}

export async function dispatchTrip(tripId: string) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "dispatcher" && session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Dispatchers and Fleet Managers can dispatch trips.");
  }

  // 2. Fetch Trip Details
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });
  if (!trip) {
    return { error: "Trip not found." };
  }

  if (trip.status !== "draft") {
    return { error: "Only draft trips can be dispatched." };
  }

  if (!trip.vehicleId || !trip.driverId) {
    return { error: "Both vehicle and driver must be assigned to dispatch a trip." };
  }

  // 3. Fetch Vehicle & Driver
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, trip.vehicleId),
  });
  const dbDriver = await db.query.drivers.findFirst({
    where: eq(drivers.id, trip.driverId),
  });

  if (!dbVehicle || !dbDriver) {
    return { error: "Assigned vehicle or driver not found." };
  }

  // 4. Verify Double booking and status
  if (dbVehicle.status === "on_trip") {
    return { error: "Assigned vehicle is already on a trip." };
  }
  if (dbVehicle.status === "retired" || dbVehicle.status === "in_shop") {
    return { error: `Vehicle is not available (Status: ${dbVehicle.status}).` };
  }

  if (dbDriver.status === "on_trip") {
    return { error: "Assigned driver is already on a trip." };
  }
  if (dbDriver.status === "suspended" || dbDriver.status === "off_duty") {
    return { error: `Driver is not available (Status: ${dbDriver.status}).` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const driverExpiry = new Date(dbDriver.licenseExpiry);
  driverExpiry.setHours(0, 0, 0, 0);
  if (driverExpiry < today) {
    return { error: "Driver license is expired." };
  }

  // 5. Execute transaction to update status
  try {
    await db.transaction(async (tx) => {
      // Set trip status to dispatched
      await tx
        .update(trips)
        .set({ status: "dispatched", startedAt: new Date() })
        .where(eq(trips.id, tripId));

      // Flip vehicle status to on_trip
      await tx
        .update(vehicles)
        .set({ status: "on_trip" })
        .where(eq(vehicles.id, trip.vehicleId!));

      // Flip driver status to on_trip
      await tx
        .update(drivers)
        .set({ status: "on_trip" })
        .where(eq(drivers.id, trip.driverId!));
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to dispatch trip." };
  }
}

const completeTripSchema = z.object({
  tripId: z.string().uuid(),
  finalOdometerKm: z.number().positive("Final odometer must be positive"),
  fuelConsumedLiters: z.number().nonnegative("Fuel consumed must be non-negative"),
});

export async function completeTrip(data: any) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "dispatcher" && session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Dispatchers and Fleet Managers can complete trips.");
  }

  // 2. Validate Payload
  const parsed = completeTripSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
  }

  const { tripId, finalOdometerKm, fuelConsumedLiters } = parsed.data;

  // 3. Fetch Trip & Vehicle Details
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });
  if (!trip) {
    return { error: "Trip not found." };
  }

  if (trip.status !== "dispatched") {
    return { error: "Only dispatched trips can be completed." };
  }

  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, trip.vehicleId!),
  });
  if (!dbVehicle) {
    return { error: "Vehicle not found." };
  }

  // 4. Verify Odometer reading
  const currentOdometer = parseFloat(dbVehicle.odometerKm);
  if (finalOdometerKm < currentOdometer) {
    return {
      error: `Final odometer (${finalOdometerKm} km) cannot be less than vehicle's current odometer (${currentOdometer} km).`,
      fields: { finalOdometerKm: ["Less than current odometer"] },
    };
  }

  // 5. Execute transaction to update status
  try {
    await db.transaction(async (tx) => {
      // Set trip status to completed
      await tx
        .update(trips)
        .set({
          status: "completed",
          completedAt: new Date(),
          finalOdometerKm: finalOdometerKm.toString(),
          fuelConsumedLiters: fuelConsumedLiters.toString(),
        })
        .where(eq(trips.id, tripId));

      // Flip vehicle status to available and update odometer
      await tx
        .update(vehicles)
        .set({ status: "available", odometerKm: finalOdometerKm.toString() })
        .where(eq(vehicles.id, trip.vehicleId!));

      // Flip driver status to available
      await tx
        .update(drivers)
        .set({ status: "available" })
        .where(eq(drivers.id, trip.driverId!));

      // Auto-insert a fuel log entry if fuel was consumed
      if (fuelConsumedLiters > 0) {
        // Find or estimate cost or let it default to 0 for now (can be edited/added later)
        // Fuel log table fields: id, vehicleId, tripId, liters, cost, date, createdAt, updatedAt
        await tx.insert(fuelLogs).values({
          vehicleId: trip.vehicleId!,
          tripId: trip.id,
          liters: fuelConsumedLiters.toString(),
          cost: "0.00", // Will be updated via fuel log details
          date: new Date().toISOString().split("T")[0],
        });
      }
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to complete trip." };
  }
}

export async function cancelTrip(tripId: string, cancellationReason: string) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "dispatcher" && session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Dispatchers and Fleet Managers can cancel trips.");
  }

  if (!cancellationReason || cancellationReason.trim() === "") {
    return { error: "Cancellation reason is required." };
  }

  // 2. Fetch Trip details
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });
  if (!trip) {
    return { error: "Trip not found." };
  }

  if (trip.status !== "dispatched" && trip.status !== "draft") {
    return { error: "Only draft or dispatched trips can be cancelled." };
  }

  const wasDispatched = trip.status === "dispatched";

  // 3. Execute transaction to update status
  try {
    await db.transaction(async (tx) => {
      // Cancel the trip
      await tx
        .update(trips)
        .set({ status: "cancelled", cancellationReason })
        .where(eq(trips.id, tripId));

      // If trip was dispatched, we must revert the vehicle and driver back to available
      if (wasDispatched && trip.vehicleId && trip.driverId) {
        await tx
          .update(vehicles)
          .set({ status: "available" })
          .where(eq(vehicles.id, trip.vehicleId));

        await tx
          .update(drivers)
          .set({ status: "available" })
          .where(eq(drivers.id, trip.driverId));
      }
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to cancel trip." };
  }
}
