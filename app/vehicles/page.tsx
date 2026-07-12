import { db } from "@/lib/db";
import { vehicles } from "@/lib/schema";
import { CreateVehicleForm } from "@/components/CreateVehicleForm";
import { eq, like, and, or, sql } from "drizzle-orm";
import Link from "next/link";
import { getServerSession } from "@/lib/session";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    region?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const session = await getServerSession();
  const userRole = session?.user?.role;

  const params = await searchParams;
  const search = params.search || "";
  const typeFilter = params.type || "";
  const statusFilter = params.status || "";
  const regionFilter = params.region || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  // 1. Build DB filter conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(vehicles.registrationNumber, `%${search}%`),
        like(vehicles.name, `%${search}%`)
      )
    );
  }
  if (typeFilter) {
    conditions.push(eq(vehicles.type, typeFilter as any));
  }
  if (statusFilter) {
    conditions.push(eq(vehicles.status, statusFilter as any));
  }
  if (regionFilter) {
    conditions.push(like(vehicles.region, `%${regionFilter}%`));
  }

  // 2. Execute Query
  const query = db.select().from(vehicles);
  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  // Handle order by dynamically
  const allowedSortFields = ["registrationNumber", "capacityKg", "odometerKm", "acquisitionCost", "createdAt"];
  const sortColumn = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  // Map camelCase fields to snake_case column names for raw SQL sorting
  const dbColumnMapping: Record<string, string> = {
    registrationNumber: "registration_number",
    capacityKg: "capacity_kg",
    odometerKm: "odometer_km",
    acquisitionCost: "acquisition_cost",
    createdAt: "created_at",
  };

  const dbColName = dbColumnMapping[sortColumn] || "created_at";

  if (sortOrder === "asc") {
    query.orderBy(sql`${sql.identifier(dbColName)} ASC`);
  } else {
    query.orderBy(sql`${sql.identifier(dbColName)} DESC`);
  }

  const vehicleList = await query;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Vehicle Registry</h2>
          <p className="text-sm text-zinc-700 font-medium">Manage and audit fleet assets and vehicle configurations.</p>
        </div>
        <div className="text-sm text-zinc-700 font-semibold">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Vehicles</span>
        </div>
      </div>

      {/* Role protected Form: Only Fleet Managers can register vehicles */}
      {userRole === "fleet_manager" ? (
        <CreateVehicleForm />
      ) : (
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 font-semibold">
          <em>* Vehicle registration and management is restricted to Fleet Managers only.</em>
        </div>
      )}

      {/* Controls Row */}
      <div className="space-y-4">
        
        {/* Search, Filter, Sort Controls Form */}
        <form method="GET" action="/vehicles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-lg border border-zinc-200 bg-zinc-50">
          
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Search Reg / Name
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="e.g. MH12..."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Vehicle Type
            </label>
            <select 
              name="type" 
              defaultValue={typeFilter}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
            >
              <option value="">All Types</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bike">Bike</option>
              <option value="mini_truck">Mini Truck</option>
              <option value="pickup">Pickup</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Status
            </label>
            <select 
              name="status" 
              defaultValue={statusFilter}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="in_shop">In Shop</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Region
            </label>
            <input
              type="text"
              name="region"
              defaultValue={regionFilter}
              placeholder="e.g. West"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Sort By
              </label>
              <select 
                name="sortBy" 
                defaultValue={sortBy}
                className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
              >
                <option value="createdAt">Date</option>
                <option value="registrationNumber">Reg No</option>
                <option value="capacityKg">Capacity</option>
                <option value="odometerKm">Odometer</option>
                <option value="acquisitionCost">Cost</option>
              </select>
            </div>
            <button 
              type="submit"
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 text-sm font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>

        </form>

        {/* Reset Filter Text Link */}
        {(search || typeFilter || statusFilter || regionFilter) && (
          <div className="text-right">
            <Link 
              href="/vehicles" 
              className="text-sm text-zinc-850 font-bold hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        )}

        {/* Vehicle List Table */}
        {vehicleList.length === 0 ? (
          <div className="text-center py-10 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-800 font-semibold">
            No vehicles found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-800 font-bold uppercase tracking-wider bg-zinc-50/50">
                  <th className="px-6 py-3.5">Registration</th>
                  <th className="px-6 py-3.5">Model/Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Capacity</th>
                  <th className="px-6 py-3.5 text-right">Odometer</th>
                  <th className="px-6 py-3.5 text-right">Cost</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {vehicleList.map((v) => {
                  let statusBadge = "bg-zinc-100 text-zinc-800 border-zinc-200";
                  if (v.status === "available") statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (v.status === "on_trip") statusBadge = "bg-blue-50 text-blue-800 border-blue-200";
                  if (v.status === "in_shop") statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
                  if (v.status === "retired") statusBadge = "bg-red-50 text-red-800 border-red-200";

                  return (
                    <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-semibold text-zinc-900">{v.registrationNumber}</td>
                      <td className="px-6 py-3.5 text-zinc-900 font-bold">{v.name}</td>
                      <td className="px-6 py-3.5 capitalize text-zinc-900 font-semibold">{v.type.replace("_", " ")}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">{parseFloat(v.capacityKg).toLocaleString()} kg</td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">{parseFloat(v.odometerKm).toLocaleString()} km</td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(v.acquisitionCost).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border capitalize ${statusBadge}`}>
                          {v.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-900 font-semibold">{v.region || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
