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
    <div>
      <div>
        <Link href="/">Back to Dashboard</Link>
      </div>

      <h1>Analytics Hub</h1>

      {/* Analytics KPI Cards */}
      <div>
        <h3>Key Performance Indicators</h3>
        <ul>
          <li>
            <strong>Average Fuel Efficiency:</strong> {averageFuelEfficiency} km/l
          </li>
          <li>
            <strong>Fleet Utilization %:</strong> {fleetUtilizationPct}% (Active: {activeVehiclesCount} / Total: {totalVehiclesCount})
          </li>
          <li>
            <strong>Total Operational Cost:</strong> {orgSettings?.currency || "INR"} {totalOperationalCost.toLocaleString()} (Fuel: {totalFuelCost.toLocaleString()} | Maintenance: {totalMaintenanceCost.toLocaleString()})
          </li>
          <li>
            <strong>Fleet Overall ROI:</strong> {overallROI}
          </li>
        </ul>
      </div>

      <hr />

      {/* CSV Export */}
      <div>
        <h3>Export Vehicle Statistics</h3>
        <ExportCSVButton 
          data={vehicleStats} 
          filename="vehicle_analytics.csv" 
          headers={csvHeaders} 
        />
      </div>

      <hr />

      {/* Analytics Lists / Visual Progress Representation */}
      <div>
        <h3>Top Cost Vehicles (Fuel + Maintenance)</h3>
        {topCostVehicles.map((v) => {
          const maxCost = topCostVehicles[0]?.operationalCost || 1;
          const pct = Math.round((v.operationalCost / maxCost) * 100);
          const bar = "=".repeat(Math.round(pct / 10)) + " ".repeat(10 - Math.round(pct / 10));
          return (
            <div key={v.id}>
              <p>
                <strong>{v.name} ({v.registrationNumber}):</strong> {orgSettings?.currency || "INR"} {v.operationalCost.toLocaleString()}<br />
                <code>[{bar}] {pct}% of max</code>
              </p>
            </div>
          );
        })}
      </div>

      <hr />

      <div>
        <h3>Monthly Operational Expense Breakdown</h3>
        {monthlyExpenses.map((m) => {
          return (
            <div key={m.month}>
              <p>
                <strong>{m.month}:</strong> Total: {orgSettings?.currency || "INR"} {m.total.toLocaleString()} 
                (Fuel: {m.fuel.toLocaleString()} | Maintenance: {m.maintenance.toLocaleString()})
              </p>
            </div>
          );
        })}
      </div>

      <hr />

      <div>
        <h3>Vehicle Fleet Details</h3>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Reg Number</th>
              <th>Vehicle Name</th>
              <th>Distance (km)</th>
              <th>Fuel Liters</th>
              <th>Efficiency (km/l)</th>
              <th>Fuel Cost</th>
              <th>Maint Cost</th>
              <th>Oper Cost</th>
              <th>Revenue</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {vehicleStats.map((v) => (
              <tr key={v.id}>
                <td>{v.registrationNumber}</td>
                <td>{v.name}</td>
                <td>{v.totalDistance}</td>
                <td>{v.totalFuelLiters}</td>
                <td>{v.fuelEfficiency}</td>
                <td>{v.totalFuelCost}</td>
                <td>{v.totalMaintenanceCost}</td>
                <td>{v.operationalCost}</td>
                <td>{v.revenue}</td>
                <td>{v.roiPercent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
