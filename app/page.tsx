import { getServerSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { ShieldCheck, User, Mail, UserCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { vehicles, drivers, trips, fuelLogs } from "@/lib/schema";
import { DashboardFilters } from "@/components/DashboardFilters";

interface PageProps {
  searchParams: Promise<{ type?: string; status?: string; region?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const session = await getServerSession();

  // Guard: If no session, redirect to login
  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  const params = await searchParams;
  const typeFilter = params.type;
  const statusFilter = params.status;
  const regionFilter = params.region;

  // 1. Fetch raw data
  const vehiclesList = await db.select().from(vehicles);
  const driversList = await db.select().from(drivers);
  const tripsList = await db.select().from(trips);
  const fuelLogsList = await db.select().from(fuelLogs);

  // 2. Extract Unique Values for Filters
  const uniqueRegions = Array.from(new Set(vehiclesList.map((v) => v.region).filter(Boolean))) as string[];
  const uniqueTypes = Array.from(new Set(vehiclesList.map((v) => v.type).filter(Boolean))) as string[];
  const uniqueStatuses = ["available", "on_trip", "in_shop", "retired"];

  // 3. Apply Filters
  let filteredVehicles = vehiclesList;
  if (typeFilter) {
    filteredVehicles = filteredVehicles.filter((v) => v.type === typeFilter);
  }
  if (statusFilter) {
    filteredVehicles = filteredVehicles.filter((v) => v.status === statusFilter);
  }
  if (regionFilter) {
    filteredVehicles = filteredVehicles.filter((v) => v.region === regionFilter);
  }

  // Filter trips based on filtered vehicles
  const filteredVehicleIds = new Set(filteredVehicles.map((v) => v.id));
  const filteredTrips = tripsList.filter((t) => t.vehicleId ? filteredVehicleIds.has(t.vehicleId) : false);

  // 4. Calculate KPI Cards
  const totalVehicles = filteredVehicles.length;
  const retiredVehicles = filteredVehicles.filter((v) => v.status === "retired").length;
  const activeVehicles = totalVehicles - retiredVehicles; // Active = Total - Retired

  const availableVehicles = filteredVehicles.filter((v) => v.status === "available").length;
  const inShopVehicles = filteredVehicles.filter((v) => v.status === "in_shop").length;

  const activeTrips = filteredTrips.filter((t) => t.status === "dispatched").length;
  const pendingTrips = filteredTrips.filter((t) => t.status === "draft").length;

  // Drivers filtered by status
  const driversOnDuty = driversList.filter(
    (d) => d.status === "available" || d.status === "on_trip"
  ).length;

  // Fleet Utilization % (Active / Total)
  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  // 5. Generate Chart Representations (Progress bars/Text charts)
  // Vehicle Status chart data
  const statusCounts = {
    available: filteredVehicles.filter((v) => v.status === "available").length,
    on_trip: filteredVehicles.filter((v) => v.status === "on_trip").length,
    in_shop: filteredVehicles.filter((v) => v.status === "in_shop").length,
    retired: filteredVehicles.filter((v) => v.status === "retired").length,
  };

  // Monthly Fuel Expense chart data
  const monthlyFuelMap: { [month: string]: number } = {};
  // Only count fuel logs for vehicles matching current filters
  const filteredFuelLogs = fuelLogsList.filter((f) => f.vehicleId ? filteredVehicleIds.has(f.vehicleId) : false);
  filteredFuelLogs.forEach((f) => {
    const month = new Date(f.date).toLocaleString("default", { month: "short", year: "numeric" });
    monthlyFuelMap[month] = (monthlyFuelMap[month] || 0) + Number(f.cost);
  });
  const monthlyFuelExpense = Object.entries(monthlyFuelMap).map(([month, cost]) => ({
    month,
    cost,
  }));

  // 6. Recent Trips (trips joined with vehicle/driver information)
  const recentTripsDetailed = filteredTrips
    .map((trip) => {
      const v = vehiclesList.find((veh) => veh.id === trip.vehicleId);
      const d = driversList.find((drv) => drv.id === trip.driverId);
      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        status: trip.status,
        plannedDistanceKm: trip.plannedDistanceKm,
        vehicleReg: v ? v.registrationNumber : "N/A",
        vehicleName: v ? v.name : "N/A",
        driverName: d ? d.name : "N/A",
        startedAt: trip.startedAt,
      };
    })
    .slice(0, 10); // show top 10

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 p-6 sm:p-10 relative overflow-hidden">
      {/* Background blurs for premium look */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="flex w-full items-center justify-between border-b border-zinc-800 pb-5 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-50">TransitOps</h1>
            <p className="text-xs text-zinc-500">Fleet Operations Management</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col gap-6 py-8 z-10">
        {/* Navigation Links panel */}
        <div>
          <span><strong>Navigation:</strong></span>
          
          {user.role === "fleet_manager" && (
            <>
              {" | "}
              <Link href="/vehicles">Manage Vehicles</Link>
              {" | "}
              <Link href="/maintenance">Workshop & Maintenance</Link>
            </>
          )}

          {user.role === "dispatcher" && (
            <>
              {" | "}
              <Link href="/trips">Manage & Dispatch Trips</Link>
            </>
          )}

          {user.role === "safety_officer" && (
            <>
              {" | "}
              <Link href="/drivers">Manage Drivers</Link>
            </>
          )}

          {user.role === "financial_analyst" && (
            <>
              {" | "}
              <Link href="/expenses">Fuel & Expenses</Link>
              {" | "}
              <Link href="/settings">Settings</Link>
              {" | "}
              <Link href="/analytics"><strong>Analytics Hub (P2)</strong></Link>
            </>
          )}
        </div>

        {/* Dashboard Filters (Dynamic) */}
        <DashboardFilters 
          regions={uniqueRegions} 
          types={uniqueTypes} 
          statuses={uniqueStatuses} 
        />

        {/* Real-time KPI Cards */}
        <div>
          <h3>Operational KPIs</h3>
          <table border={1} cellPadding={10}>
            <tbody>
              <tr>
                <td>
                  <strong>Active Vehicles</strong><br />
                  {activeVehicles}
                </td>
                <td>
                  <strong>Available Vehicles</strong><br />
                  {availableVehicles}
                </td>
                <td>
                  <strong>Vehicles In Shop</strong><br />
                  {inShopVehicles}
                </td>
                <td>
                  <strong>Active Trips</strong><br />
                  {activeTrips}
                </td>
                <td>
                  <strong>Pending Trips</strong><br />
                  {pendingTrips}
                </td>
                <td>
                  <strong>Drivers On Duty</strong><br />
                  {driversOnDuty}
                </td>
                <td>
                  <strong>Fleet Utilization %</strong><br />
                  {fleetUtilization}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dashboard Charts */}
        <div>
          <h3>Visual Chart Metrics</h3>
          <div>
            <h4>Vehicle Status Distribution</h4>
            <ul>
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
                const bar = "=".repeat(Math.round(pct / 10)) + " ".repeat(10 - Math.round(pct / 10));
                return (
                  <li key={status}>
                    <strong>{status.replace("_", " ")}:</strong> {count} vehicles <code>[{bar}] {pct}%</code>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4>Fleet Utilization Rate</h4>
            <p>
              <strong>Active vs Total:</strong> {activeVehicles} / {totalVehicles} active vehicles
            </p>
            <code>
              [{"=".repeat(Math.round(fleetUtilization / 10)) + " ".repeat(10 - Math.round(fleetUtilization / 10))}] {fleetUtilization}%
            </code>
          </div>

          <div>
            <h4>Monthly Fuel Expenses</h4>
            {monthlyFuelExpense.length === 0 ? (
              <p>No fuel expenses logged yet.</p>
            ) : (
              <ul>
                {monthlyFuelExpense.map((m) => {
                  const maxCost = Math.max(...monthlyFuelExpense.map((item) => item.cost)) || 1;
                  const pct = Math.round((m.cost / maxCost) * 100);
                  const bar = "=".repeat(Math.round(pct / 10)) + " ".repeat(10 - Math.round(pct / 10));
                  return (
                    <li key={m.month}>
                      <strong>{m.month}:</strong> INR {m.cost.toLocaleString()} <code>[{bar}] {pct}%</code>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Trips Table */}
        <div>
          <h3>Recent Trips (Top 10)</h3>
          {recentTripsDetailed.length === 0 ? (
            <p>No trips registered.</p>
          ) : (
            <table border={1} cellPadding={5}>
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Distance</th>
                  <th>Started At</th>
                </tr>
              </thead>
              <tbody>
                {recentTripsDetailed.map((t) => (
                  <tr key={t.id}>
                    <td>#{t.id.slice(0, 8)}</td>
                    <td>From: {t.source} To: {t.destination}</td>
                    <td>{t.vehicleReg} ({t.vehicleName})</td>
                    <td>{t.driverName}</td>
                    <td>{t.status}</td>
                    <td>{t.plannedDistanceKm} km</td>
                    <td>{t.startedAt ? new Date(t.startedAt).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-6 max-w-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Active Session Credentials
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-200">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm text-zinc-400">{user.name}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-zinc-400">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <UserCheck className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Role:</span>
              <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20 capitalize">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
