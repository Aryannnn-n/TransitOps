"use server";

import { db } from "@/lib/db";
import { maintenanceLogs, vehicles } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle selection"),
  serviceType: z.string().min(1, "Service type is required"),
  cost: z.number().nonnegative("Cost must be non-negative"),
  notes: z.string().optional().nullable(),
});

export async function createMaintenanceLog(data: any) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Fleet Managers can manage maintenance logs.");
  }

  // 2. Validate Payload
  const parsed = createMaintenanceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
  }

  const { vehicleId, serviceType, cost, notes } = parsed.data;

  // 3. Fetch Vehicle details
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, vehicleId),
  });
  if (!dbVehicle) {
    return { error: "Vehicle not found." };
  }

  if (dbVehicle.status === "retired") {
    return { error: "Cannot put a retired vehicle in maintenance." };
  }

  if (dbVehicle.status === "on_trip") {
    return { error: "Cannot put a vehicle in maintenance while it is on a trip." };
  }

  // 4. Check if there's already an open log
  const existingOpenLog = await db.query.maintenanceLogs.findFirst({
    where: and(
      eq(maintenanceLogs.vehicleId, vehicleId),
      eq(maintenanceLogs.status, "open")
    ),
  });
  if (existingOpenLog) {
    return { error: "This vehicle already has an open maintenance log." };
  }

  // 5. Execute transaction: insert maintenance record & flip vehicle status to in_shop
  try {
    await db.transaction(async (tx) => {
      await tx.insert(maintenanceLogs).values({
        vehicleId,
        serviceType,
        cost: cost.toFixed(2),
        notes: notes || null,
        status: "open",
        openedAt: new Date(),
      });

      await tx
        .update(vehicles)
        .set({ status: "in_shop" })
        .where(eq(vehicles.id, vehicleId));
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create maintenance log." };
  }
}

export async function closeMaintenanceLog(logId: string) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Fleet Managers can manage maintenance logs.");
  }

  // 2. Fetch Log details
  const log = await db.query.maintenanceLogs.findFirst({
    where: eq(maintenanceLogs.id, logId),
  });
  if (!log) {
    return { error: "Maintenance log not found." };
  }

  if (log.status !== "open") {
    return { error: "This maintenance log is already closed." };
  }

  // 3. Fetch Vehicle details
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, log.vehicleId),
  });

  // 4. Execute transaction to close log & release vehicle
  try {
    await db.transaction(async (tx) => {
      // Close log
      await tx
        .update(maintenanceLogs)
        .set({
          status: "completed",
          closedAt: new Date(),
        })
        .where(eq(maintenanceLogs.id, logId));

      // Revert vehicle to available unless it is retired
      if (dbVehicle && dbVehicle.status !== "retired") {
        await tx
          .update(vehicles)
          .set({ status: "available" })
          .where(eq(vehicles.id, log.vehicleId));
      }
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to close maintenance log." };
  }
}
