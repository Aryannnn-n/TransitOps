import { db } from "@/lib/db";
import { maintenanceLogs, vehicles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { CreateMaintenanceForm } from "@/components/CreateMaintenanceForm";
import { MaintenanceList } from "@/components/MaintenanceList";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MaintenancePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Fetch maintenance logs with vehicle details
  const rows = await db
    .select({
      id: maintenanceLogs.id,
      vehicleId: maintenanceLogs.vehicleId,
      serviceType: maintenanceLogs.serviceType,
      cost: maintenanceLogs.cost,
      notes: maintenanceLogs.notes,
      status: maintenanceLogs.status,
      openedAt: maintenanceLogs.openedAt,
      closedAt: maintenanceLogs.closedAt,
      vehicleReg: vehicles.registrationNumber,
      vehicleName: vehicles.name,
    })
    .from(maintenanceLogs)
    .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
    .orderBy(maintenanceLogs.status, maintenanceLogs.openedAt);

  // 2. Fetch all vehicles for the form select list
  const vehiclesList = await db
    .select({
      id: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      name: vehicles.name,
      status: vehicles.status,
    })
    .from(vehicles);

  const isManager = session.user.role === "fleet_manager";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Maintenance & Workshop</h2>
          <p className="text-xs text-zinc-700 font-medium">Log service events, track repair costs, and transition vehicles to/from the shop.</p>
        </div>
        <div className="text-xs text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Maintenance</span>
        </div>
      </div>

      {/* Form at the top */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Log Service Record</div>
        {isManager ? (
          <CreateMaintenanceForm vehiclesList={vehiclesList} />
        ) : (
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 font-bold">
            <em>* Creating and scheduling maintenance tickets is restricted to Fleet Managers.</em>
          </div>
        )}
      </div>

      {/* List at the bottom */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Service Log</div>
        {rows.length === 0 ? (
          <div className="text-center py-10 border border-zinc-200 rounded-lg bg-zinc-50 text-xs text-zinc-800 font-bold">
            No maintenance logs or active shop tickets found.
          </div>
        ) : (
          <MaintenanceList logsList={rows} userRole={session.user.role} />
        )}
      </div>

      {/* Bottom Status Flow Info */}
      <p className="text-[10px] text-zinc-700 font-semibold leading-relaxed pt-4 border-t border-zinc-200">
        * Status Flow: Creating maintenance record automatically moves vehicle to <strong>In Shop</strong> status (same transaction). 
        Closing maintenance logs prompts a confirmation to set the vehicle back to <strong>Available</strong> unless Retired.
      </p>

    </div>
  );
}
