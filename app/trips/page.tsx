import { db } from "@/lib/db";
import { trips, vehicles, drivers } from "@/lib/schema";
import { eq } from "drizzle-orm";
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
        }
      : null,
    driver: r.driverName
      ? {
          name: r.driverName,
        }
      : null,
  }));

  const canWrite =
    session.user.role === "dispatcher" || session.user.role === "fleet_manager";

  return (
    <div>
      <header>
        <Link href="/">Back to Dashboard</Link>
        <h1>Shipment & Dispatch Board</h1>
      </header>

      <hr />

      {canWrite && (
        <div>
          <Link href="/trips/new">
            <button type="button">Plan New Shipment (+)</button>
          </Link>
        </div>
      )}

      <hr />

      <TripBoard tripsList={tripsList} userRole={session.user.role} />
    </div>
  );
}
