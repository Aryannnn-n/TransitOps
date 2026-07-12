import { db } from "@/lib/db";
import { drivers } from "@/lib/schema";
import { CreateDriverForm } from "@/components/CreateDriverForm";
import { eq, like, and, or } from "drizzle-orm";
import Link from "next/link";
import { getServerSession } from "@/lib/session";

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}) {
  const session = await getServerSession();
  const userRole = session?.user?.role;

  const params = await searchParams;
  const search = params.search || "";
  const statusFilter = params.status || "";

  // 1. Build Filter Conditions
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(drivers.name, `%${search}%`),
        like(drivers.licenseNumber, `%${search}%`)
      )
    );
  }
  if (statusFilter) {
    conditions.push(eq(drivers.status, statusFilter as any));
  }

  // 2. Query DB
  const query = db.select().from(drivers);
  if (conditions.length > 0) {
    query.where(and(...conditions));
  }
  query.orderBy(drivers.createdAt);

  const driverList = await query;

  // Helper to determine license status
  const getLicenseStatus = (expiryDateStr: string) => {
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    // Normalize times
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      return { text: "EXPIRED", color: "red" };
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);

    if (expiryDate <= thirtyDaysFromNow) {
      return { text: "EXPIRING SOON", color: "orange" };
    }

    return { text: "Active", color: "green" };
  };

  return (
    <div>
      <header>
        <Link href="/">Back to Dashboard</Link>
        <h1>Driver Management</h1>
      </header>

      {/* Role protected Form: Only Fleet Managers can register drivers */}
      {userRole === "fleet_manager" ? (
        <CreateDriverForm />
      ) : (
        <p><em>* Driver registration is locked to Fleet Managers only.</em></p>
      )}

      <hr />

      <h2>All Registered Drivers</h2>

      {/* Search & Filter form */}
      <form method="GET" action="/drivers">
        <div>
          <label>Search Name/License:</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search name or license number"
          />
        </div>

        <div>
          <label>Filter by Status:</label>
          <select name="status" defaultValue={statusFilter}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <button type="submit">Apply Filters</button>
        <Link href="/drivers">Reset Filters</Link>
      </form>

      <hr />

      {/* Drivers List Table */}
      {driverList.length === 0 ? (
        <p>No drivers found matching filters.</p>
      ) : (
        <table border={1}>
          <thead>
            <tr>
              <th>Name</th>
              <th>License Number</th>
              <th>License Category</th>
              <th>License Expiry</th>
              <th>License Status</th>
              <th>Phone</th>
              <th>Safety Score</th>
              <th>Duty Status</th>
            </tr>
          </thead>
          <tbody>
            {driverList.map((d) => {
              const licStatus = getLicenseStatus(d.licenseExpiry);
              return (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.licenseCategory}</td>
                  <td>{d.licenseExpiry}</td>
                  <td style={{ color: licStatus.color, fontWeight: "bold" }}>
                    {licStatus.text}
                  </td>
                  <td>{d.phone}</td>
                  <td>{d.safetyScore}/100</td>
                  <td style={{ textTransform: "capitalize" }}>{d.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
