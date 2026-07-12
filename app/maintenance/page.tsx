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
    <div>
      <header>
        <Link href="/">Back to Dashboard</Link>
        <h1>Maintenance & Workshop Logs</h1>
      </header>

      <hr />

      {isManager ? (
        <CreateMaintenanceForm vehiclesList={vehiclesList} />
      ) : (
        <p><em>* Creating/scheduling maintenance is locked to Fleet Managers only.</em></p>
      )}

      <hr />

      <h2>Workshop History & Open Tickets</h2>
      {rows.length === 0 ? (
        <p>No maintenance logs found.</p>
      ) : (
        <MaintenanceList logsList={rows} userRole={session.user.role} />
      )}
    </div>
  );
}
