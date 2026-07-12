import { db } from "@/lib/db";
import { vehicles, drivers } from "@/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { CreateTripForm } from "@/components/CreateTripForm";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NewTripPage() {
  const session = await getServerSession();
  
  // Guard: Must be logged in and have Dispatcher or Fleet Manager role
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "dispatcher" && role !== "fleet_manager") {
    return (
      <div>
        <p>Access Forbidden: Only Dispatchers and Fleet Managers can create new trips.</p>
        <Link href="/">Back to Dashboard</Link>
      </div>
    );
  }

  // 1. Fetch available vehicles
  const availableVehicles = await db
    .select({
      id: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      name: vehicles.name,
      capacityKg: vehicles.capacityKg,
    })
    .from(vehicles)
    .where(eq(vehicles.status, "available"));

  // 2. Fetch available drivers whose license has not expired
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

  return (
    <div>
      <header>
        <Link href="/trips">Back to Trip Board</Link>
        <h1>Plan New Shipment</h1>
      </header>

      <hr />

      <CreateTripForm
        vehiclesList={availableVehicles}
        driversList={availableDrivers}
      />
    </div>
  );
}
