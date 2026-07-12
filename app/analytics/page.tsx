import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { vehicles, trips, fuelLogs, maintenanceLogs, settings } from "@/lib/schema";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Fetch raw data
  const vehiclesList = await db.select().from(vehicles);
  const tripsList = await db.select().from(trips);
  const fuelLogsList = await db.select().from(fuelLogs);
  const maintenanceLogsList = await db.select().from(maintenanceLogs);
  const orgSettings = await db.query.settings.findFirst();

  const ratePerKm = orgSettings ? Number(orgSettings.ratePerKm) : 15.0; // default 15 if missing

  // 2. Perform Calculations
  // Total Vehicles & Active Vehicles
  const totalVehiclesCount = vehiclesList.length;
  const retiredVehiclesCount = vehiclesList.filter((v) => v.status === "retired").length;
  const activeVehiclesCount = totalVehiclesCount - retiredVehiclesCount;

  // Fleet Utilization % (Active / Total)
  const fleetUtilizationPct =
    totalVehiclesCount > 0 ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) : 0;

  // Group calculations by vehicle
  const vehicleStats = vehiclesList.map((vehicle) => {
    // Completed trips for this vehicle
    const vehicleTrips = tripsList.filter(
      (t) => t.vehicleId === vehicle.id && t.status === "completed"
    );
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + Number(t.plannedDistanceKm), 0);

    // Fuel Logs for this vehicle
    const vehicleFuelLogs = fuelLogsList.filter((f) => f.vehicleId === vehicle.id);
    const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.liters), 0);
    const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);

    // Maintenance Logs for this vehicle
    const vehicleMaintenanceLogs = maintenanceLogsList.filter((m) => m.vehicleId === vehicle.id);
    const totalMaintenanceCost = vehicleMaintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);

    // Operational Cost = Fuel + Maintenance only
    const operationalCost = totalFuelCost + totalMaintenanceCost;

    // Fuel Efficiency = Distance / Fuel (km/l)
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : "0.00";

    // Revenue = Σ(planned distance × rate-per-km) for Completed trips
    const revenue = totalDistance * ratePerKm;

    // ROI = (Revenue − Operational Cost) / Acquisition Cost
    const acquisitionCost = Number(vehicle.acquisitionCost) || 1;
    const roi = ((revenue - operationalCost) / acquisitionCost).toFixed(4);
    const roiPercent = (Number(roi) * 100).toFixed(2) + "%";

    return {
      id: vehicle.id,
      name: vehicle.name,
      registrationNumber: vehicle.registrationNumber,
      status: vehicle.status,
      type: vehicle.type,
      acquisitionCost: vehicle.acquisitionCost,
      totalDistance,
      totalFuelLiters,
      totalFuelCost,
      totalMaintenanceCost,
      operationalCost,
      fuelEfficiency,
      revenue,
      roi,
      roiPercent,
    };
  });

  // Fleet Totals
  const totalFuelLiters = fuelLogsList.reduce((sum, f) => sum + Number(f.liters), 0);
  const totalFuelCost = fuelLogsList.reduce((sum, f) => sum + Number(f.cost), 0);
  const totalMaintenanceCost = maintenanceLogsList.reduce((sum, m) => sum + Number(m.cost), 0);
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  const totalDistanceAll = vehicleStats.reduce((sum, v) => sum + v.totalDistance, 0);
  const averageFuelEfficiency =
    totalFuelLiters > 0 ? (totalDistanceAll / totalFuelLiters).toFixed(2) : "0.00";

  const totalRevenue = vehicleStats.reduce((sum, v) => sum + v.revenue, 0);
  const totalAcquisitionCost = vehiclesList
    .filter((v) => v.status !== "retired")
    .reduce((sum, v) => sum + Number(v.acquisitionCost), 0) || 1;
  const overallROI = (((totalRevenue - totalOperationalCost) / totalAcquisitionCost) * 100).toFixed(2) + "%";

  // Monthly Expenses (Fuel + Maintenance)
  const monthlyExpensesMap: { [month: string]: { fuel: number; maintenance: number; total: number } } = {};
  
  fuelLogsList.forEach((f) => {
    const month = new Date(f.date).toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthlyExpensesMap[month]) monthlyExpensesMap[month] = { fuel: 0, maintenance: 0, total: 0 };
    monthlyExpensesMap[month].fuel += Number(f.cost);
    monthlyExpensesMap[month].total += Number(f.cost);
  });

  maintenanceLogsList.forEach((m) => {
    const openedDate = m.openedAt ? new Date(m.openedAt) : new Date();
    const month = openedDate.toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthlyExpensesMap[month]) monthlyExpensesMap[month] = { fuel: 0, maintenance: 0, total: 0 };
    monthlyExpensesMap[month].maintenance += Number(m.cost);
    monthlyExpensesMap[month].total += Number(m.cost);
  });

  const monthlyExpenses = Object.entries(monthlyExpensesMap).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Top Cost Vehicles
  const topCostVehicles = [...vehicleStats]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 5);

  // Prepare CSV Data
  const csvHeaders = [
    "registrationNumber",
    "name",
    "type",
    "status",
    "acquisitionCost",
    "totalDistance",
    "totalFuelLiters",
    "totalFuelCost",
    "totalMaintenanceCost",
    "operationalCost",
    "fuelEfficiency",
    "revenue",
    "roiPercent",
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumbs / Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-700 font-bold">
              <Link href="/" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-900">Analytics Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">Analytics Hub</h1>
          </div>

          <div>
            <ExportCSVButton 
              data={vehicleStats} 
              filename="vehicle_analytics.csv" 
              headers={csvHeaders} 
            />
          </div>
        </header>

        {/* Analytics KPI Cards */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Fleet Performance Indicators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
              <div className="text-sm font-bold text-zinc-650 uppercase tracking-wider">Average Fuel Efficiency</div>
              <div className="text-2xl font-bold text-zinc-900 font-display">{averageFuelEfficiency} <span className="text-sm font-semibold text-zinc-700">km/L</span></div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
              <div className="text-sm font-bold text-zinc-650 uppercase tracking-wider">Fleet Utilization</div>
              <div className="text-2xl font-bold text-emerald-700 font-display">{fleetUtilizationPct}%</div>
              <div className="text-[11px] text-zinc-800 font-bold">{activeVehiclesCount} of {totalVehiclesCount} active assets</div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
              <div className="text-sm font-bold text-zinc-650 uppercase tracking-wider">Total Operational Cost</div>
              <div className="text-2xl font-bold text-zinc-900 font-display">{orgSettings?.currency || "INR"} {totalOperationalCost.toLocaleString()}</div>
              <div className="text-[11px] text-zinc-800 font-bold">Fuel: {totalFuelCost.toLocaleString()} | Maint: {totalMaintenanceCost.toLocaleString()}</div>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm space-y-1">
              <div className="text-sm font-bold text-orange-800 uppercase tracking-wider">Fleet Overall ROI</div>
              <div className="text-2xl font-bold text-orange-600 font-display">{overallROI}</div>
              <div className="text-[11px] text-orange-850 font-bold">Calculated over acquisition cost</div>
            </div>

          </div>
        </section>

        {/* Cost Analysis Breakdown Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Top Cost Vehicles */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Top 5 Highest-Expense Vehicles</h3>
            <div className="space-y-4">
              {topCostVehicles.map((v) => {
                const maxCost = topCostVehicles[0]?.operationalCost || 1;
                const pct = Math.round((v.operationalCost / maxCost) * 100);
                return (
                  <div key={v.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-zinc-900">{v.name} <span className="font-mono text-zinc-800 font-bold">({v.registrationNumber})</span></span>
                      <span className="text-zinc-900">{orgSettings?.currency || "INR"} {v.operationalCost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Operational Expense Breakdown */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Monthly Cost Trends</h3>
            {monthlyExpenses.length === 0 ? (
              <div className="text-center py-10 text-sm text-zinc-700 font-bold">No monthly costs tracked yet.</div>
            ) : (
              <div className="space-y-4">
                {monthlyExpenses.map((m) => {
                  const maxCost = Math.max(...monthlyExpenses.map((item) => item.total)) || 1;
                  const pct = Math.round((m.total / maxCost) * 100);
                  return (
                    <div key={m.month} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-zinc-900">{m.month}</span>
                        <span className="text-zinc-900">{orgSettings?.currency || "INR"} {m.total.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-zinc-800 font-bold flex gap-2">
                        <span>Fuel: {orgSettings?.currency || "INR"} {m.fuel.toLocaleString()}</span>
                        <span>•</span>
                        <span>Maint: {orgSettings?.currency || "INR"} {m.maintenance.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200 mt-1">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </section>

        {/* Master Fleet Table */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Vehicle Fleet Analysis Details</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-sm font-bold text-zinc-800 bg-zinc-50 uppercase tracking-wider">
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Vehicle Name</th>
                  <th className="px-6 py-4 text-right">Distance</th>
                  <th className="px-6 py-4 text-right">Fuel Liters</th>
                  <th className="px-6 py-4 text-right">Efficiency</th>
                  <th className="px-6 py-4 text-right">Fuel Cost</th>
                  <th className="px-6 py-4 text-right">Maint Cost</th>
                  <th className="px-6 py-4 text-right">Oper Cost</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                  <th className="px-6 py-4 text-right">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {vehicleStats.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors text-zinc-900 font-semibold">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-950">{v.registrationNumber}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{v.name}</td>
                    <td className="px-6 py-4 text-right text-zinc-900 font-bold">{v.totalDistance.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-right text-zinc-900 font-bold">{v.totalFuelLiters.toLocaleString()} L</td>
                    <td className="px-6 py-4 text-right font-mono font-bold">{v.fuelEfficiency} km/L</td>
                    <td className="px-6 py-4 text-right text-zinc-900 font-bold">INR {v.totalFuelCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-zinc-900 font-bold">INR {v.totalMaintenanceCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-zinc-950 font-bold">INR {v.operationalCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-emerald-800 font-bold">INR {v.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-black">{v.roiPercent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
