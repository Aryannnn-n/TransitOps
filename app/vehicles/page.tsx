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
    <div>
      <header>
        <Link href="/">Back to Dashboard</Link>
        <h1>Vehicle Registry</h1>
      </header>

      {/* Role protected Form: Only Fleet Managers can register vehicles */}
      {userRole === "fleet_manager" ? (
        <CreateVehicleForm />
      ) : (
        <p><em>* Vehicle registration is locked to Fleet Managers only.</em></p>
      )}

      <hr />

      <h2>All Fleet Vehicles</h2>

      {/* Search, Filter, Sort Controls Form */}
      <form method="GET" action="/vehicles">
        <div>
          <label>Search model/reg-no:</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search model or registration number"
          />
        </div>

        <div>
          <label>Filter by Type:</label>
          <select name="type" defaultValue={typeFilter}>
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
          <label>Filter by Status:</label>
          <select name="status" defaultValue={statusFilter}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div>
          <label>Filter by Region:</label>
          <input
            type="text"
            name="region"
            defaultValue={regionFilter}
            placeholder="e.g. West"
          />
        </div>

        <div>
          <label>Sort By:</label>
          <select name="sortBy" defaultValue={sortBy}>
            <option value="createdAt">Date Registered</option>
            <option value="registrationNumber">Registration Number</option>
            <option value="capacityKg">Cargo Capacity</option>
            <option value="odometerKm">Odometer Reading</option>
            <option value="acquisitionCost">Acquisition Cost</option>
          </select>
          <select name="sortOrder" defaultValue={sortOrder}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <button type="submit">Apply Filters & Sort</button>
        <Link href="/vehicles">Reset Filters</Link>
      </form>

      <hr />

      {/* Vehicle List Table */}
      {vehicleList.length === 0 ? (
        <p>No vehicles found matching filters.</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>Registration Number</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity (kg)</th>
              <th>Odometer (km)</th>
              <th>Cost (INR)</th>
              <th>Status</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {vehicleList.map((v) => (
              <tr key={v.id}>
                <td>{v.registrationNumber}</td>
                <td>{v.name}</td>
                <td style={{ textTransform: "capitalize" }}>{v.type}</td>
                <td>{parseFloat(v.capacityKg).toLocaleString()} kg</td>
                <td>{parseFloat(v.odometerKm).toLocaleString()} km</td>
                <td>{parseFloat(v.acquisitionCost).toLocaleString()}</td>
                <td style={{ textTransform: "capitalize" }}>{v.status}</td>
                <td>{v.region || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
