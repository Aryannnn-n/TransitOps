import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vehicles, drivers, trips, fuelLogs } from "@/lib/schema";
import { DashboardFilters } from "@/components/DashboardFilters";

interface PageProps {
  searchParams: Promise<{ type?: string; status?: string; region?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

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

  // 5. Vehicle Status Counts
  const statusCounts = {
    available: filteredVehicles.filter((v) => v.status === "available").length,
    on_trip: filteredVehicles.filter((v) => v.status === "on_trip").length,
    in_shop: filteredVehicles.filter((v) => v.status === "in_shop").length,
    retired: filteredVehicles.filter((v) => v.status === "retired").length,
  };

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
        vehicleReg: v ? v.registrationNumber : "N/A",
        driverName: d ? d.name : "N/A",
      };
    })
    .slice(0, 10); // show top 10

  return (
    <div className="space-y-6">
      
      {/* Top Title/Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Dashboard</h2>
        <p className="text-xs text-zinc-500 font-medium">Real-time status overview of vehicles, drivers, and trips.</p>
      </div>

      {/* Row 1: Filters */}
      <DashboardFilters 
        regions={uniqueRegions} 
        types={uniqueTypes} 
        statuses={uniqueStatuses} 
      />

      {/* Row 2: KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        
        {/* Card 1: Active Vehicles */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Vehicles</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{activeVehicles}</div>
        </div>

        {/* Card 2: Available Vehicles */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Available Vehicles</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{availableVehicles}</div>
        </div>

        {/* Card 3: Vehicles in Maintenance */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">In Maintenance</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{inShopVehicles}</div>
        </div>

        {/* Card 4: Active Trips */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Trips</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{activeTrips}</div>
        </div>

        {/* Card 5: Pending Trips */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pending Trips</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{pendingTrips}</div>
        </div>

        {/* Card 6: Drivers On Duty */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Drivers On Duty</div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{driversOnDuty}</div>
        </div>

        {/* Card 7: Fleet Utilization */}
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Fleet Utilization</div>
            <div className="text-xl font-bold text-zinc-900 mt-1">{fleetUtilization}%</div>
          </div>
          <div className="w-full bg-zinc-100 border border-zinc-200 rounded-full h-1.5 overflow-hidden mt-2">
            <div className="bg-zinc-900 h-full rounded-full" style={{ width: `${fleetUtilization}%` }} />
          </div>
        </div>

      </div>

      {/* Row 3: Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Recent Trips Table */}
        <div className="lg:col-span-2 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recent Trips</h3>
          
          {recentTripsDetailed.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              No recent trips recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                    <th className="px-4 py-3">Trip ID</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {recentTripsDetailed.map((t) => {
                    let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200";
                    if (t.status === "dispatched") statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                    if (t.status === "completed") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    if (t.status === "cancelled") statusBadge = "bg-red-50 text-red-700 border-red-200";

                    return (
                      <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900">#{t.id.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-zinc-900">{t.vehicleReg}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 font-medium">{t.driverName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border capitalize ${statusBadge}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Section: Vehicle Status Panel */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vehicle Status Panel</h3>
          
          <div className="space-y-4 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
              
              let progressColor = "bg-zinc-500";
              if (status === "available") progressColor = "bg-emerald-500";
              if (status === "on_trip") progressColor = "bg-blue-500";
              if (status === "in_shop") progressColor = "bg-amber-500";

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-zinc-700">{status.replace("_", " ")}</span>
                    <span className="text-zinc-900">{count} <span className="text-zinc-400 font-medium">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
                    <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
