import { db } from "@/lib/db";
import { trips, vehicles, drivers } from "@/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { TripBoard } from "@/components/TripBoard";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TripsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Fetch all trips by joining vehicles and drivers
  const rows = await db
    .select({
      id: trips.id,
      tripNumber: trips.tripNumber,
      source: trips.source,
      destination: trips.destination,
      cargoWeightKg: trips.cargoWeightKg,
      plannedDistanceKm: trips.plannedDistanceKm,
      revenue: trips.revenue,
      status: trips.status,
      startedAt: trips.startedAt,
      completedAt: trips.completedAt,
      finalOdometerKm: trips.finalOdometerKm,
      fuelConsumedLiters: trips.fuelConsumedLiters,
      cancellationReason: trips.cancellationReason,
      vehicleReg: vehicles.registrationNumber,
      vehicleName: vehicles.name,
      vehicleOdometer: vehicles.odometerKm,
      vehicleCapacity: vehicles.capacityKg,
      driverName: drivers.name,
    })
    .from(trips)
    .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .leftJoin(drivers, eq(trips.driverId, drivers.id))
    .orderBy(trips.tripNumber);

  // 2. Map flat rows into structured objects for TripBoard
  const tripsList = rows.map((r) => ({
    id: r.id,
    tripNumber: r.tripNumber,
    source: r.source,
    destination: r.destination,
    cargoWeightKg: r.cargoWeightKg,
    plannedDistanceKm: r.plannedDistanceKm,
    revenue: r.revenue,
    status: r.status,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
    finalOdometerKm: r.finalOdometerKm,
    fuelConsumedLiters: r.fuelConsumedLiters,
    cancellationReason: r.cancellationReason,
    vehicle: r.vehicleReg
      ? {
          registrationNumber: r.vehicleReg,
          name: r.vehicleName!,
          odometerKm: r.vehicleOdometer!,
          capacityKg: r.vehicleCapacity!,
        }
      : null,
    driver: r.driverName
      ? {
          name: r.driverName,
        }
      : null,
  }));

  // 3. Fetch available vehicles
  const availableVehicles = await db
    .select({
      id: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      name: vehicles.name,
      capacityKg: vehicles.capacityKg,
    })
    .from(vehicles)
    .where(eq(vehicles.status, "available"));

  // 4. Fetch available drivers whose license has not expired
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const availableDrivers = await db
    .select({
      id: drivers.id,
      name: drivers.name,
      safetyScore: drivers.safetyScore,
    })
    .from(drivers)
    .where(
      and(
        eq(drivers.status, "available"),
        gte(drivers.licenseExpiry, todayStr)
      )
    );

  const canWrite =
    session.user.role === "dispatcher" || session.user.role === "fleet_manager";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Shipments & Dispatch Board</h2>
          <p className="text-sm text-zinc-700 font-medium">Plan, dispatch, track, and close commercial shipping trips.</p>
        </div>
        <div className="text-sm text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Trips</span>
        </div>
      </div>

      <div className="space-y-4">
        <TripBoard 
          tripsList={tripsList} 
          userRole={session.user.role} 
          availableVehicles={availableVehicles}
          availableDrivers={availableDrivers}
        />
      </div>

    </div>
  );
}
