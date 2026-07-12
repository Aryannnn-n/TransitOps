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
      <div className="flex items-center justify-center p-6 min-h-[50vh]">
        <div className="max-w-md w-full rounded-lg border border-zinc-200 bg-white p-6 text-center space-y-4 shadow-sm">
          <div className="text-red-700 text-sm font-bold">Access Forbidden</div>
          <p className="text-xs text-zinc-650 font-medium">
            Only Dispatchers and Fleet Managers can plan and create new shipment trips.
          </p>
          <div className="pt-2">
            <Link 
              href="/"
              className="inline-flex rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Plan New Shipment</h2>
          <p className="text-xs text-zinc-650 font-medium">Select an available vehicle and driver to configure a new delivery trip.</p>
        </div>
        <div className="text-xs text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href="/trips" className="hover:text-zinc-900 font-semibold underline">Trips</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Plan</span>
        </div>
      </div>

      <CreateTripForm
        vehiclesList={availableVehicles}
        driversList={availableDrivers}
      />

    </div>
  );
}
