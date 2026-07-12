import { db } from "@/lib/db";
import { drivers } from "@/lib/schema";
import { CreateDriverForm } from "@/components/CreateDriverForm";
import { DriverStatusToggle } from "@/components/DriverStatusToggle";
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
  const isAllowedToEdit = userRole === "fleet_manager" || userRole === "safety_officer";

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Driver Registry</h2>
          <p className="text-xs text-zinc-700 font-medium">Manage driver rosters, licensing, and safety profile scores.</p>
        </div>
        <div className="text-xs text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Drivers</span>
        </div>
      </div>

      {/* Role protected Form: Only Fleet Managers and Safety Officers can register drivers */}
      {userRole === "fleet_manager" || userRole === "safety_officer" ? (
        <CreateDriverForm />
      ) : (
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-medium">
          <em>* Driver registration and safety roster settings are restricted to Fleet Managers or Safety Officers.</em>
        </div>
      )}

      {/* Roster & Search Filters */}
      <div className="space-y-4">
        
        {/* Search & Filter form */}
        <form method="GET" action="/drivers" className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border border-zinc-200 bg-zinc-50 items-end">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Search Name / License
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search driver name or license number..."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select 
                name="status" 
                defaultValue={statusFilter}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="off_duty">Off Duty</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button 
              type="submit"
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-1.5 text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Reset Filter Text Link */}
        {(search || statusFilter) && (
          <div className="text-right">
            <Link 
              href="/drivers" 
              className="text-xs text-zinc-800 font-bold hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        )}

        {/* Drivers List Table */}
        {driverList.length === 0 ? (
          <div className="text-center py-10 border border-zinc-200 rounded-lg bg-zinc-50 text-xs text-zinc-700 font-semibold">
            No drivers found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                  <th className="px-6 py-3.5">Driver Name</th>
                  <th className="px-6 py-3.5">License Details</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5">License Status</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5 text-center">Safety Score</th>
                  <th className="px-6 py-3.5 text-center">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {driverList.map((d) => {
                  const licStatus = getLicenseStatus(d.licenseExpiry);
                  
                  // License Status Text color
                  let licColorClass = "text-emerald-700 font-semibold";
                  if (licStatus.color === "orange") licColorClass = "text-amber-700 font-semibold";
                  if (licStatus.color === "red") licColorClass = "text-red-700 font-bold";

                  return (
                    <tr key={d.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-zinc-900">{d.name}</td>
                      <td className="px-6 py-3.5 font-mono text-zinc-900 font-medium">{d.licenseNumber}</td>
                      <td className="px-6 py-3.5 capitalize text-zinc-900 font-semibold">{d.licenseCategory}</td>
                      <td className="px-6 py-3.5 text-zinc-900 font-semibold">{d.licenseExpiry}</td>
                      <td className={`px-6 py-3.5 ${licColorClass}`}>{licStatus.text}</td>
                      <td className="px-6 py-3.5 text-zinc-900 font-semibold">{d.phone}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          d.safetyScore >= 85 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : d.safetyScore >= 70 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-red-50 text-red-800 border-red-200"
                        }`}>
                          {d.safetyScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <DriverStatusToggle 
                          driverId={d.id} 
                          currentStatus={d.status as any} 
                          isAllowed={isAllowedToEdit} 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Warning text at the bottom */}
        <p className="text-[10px] text-zinc-700 font-semibold leading-relaxed">
          * Warning: Drivers with expired licenses or suspended status will be automatically filtered out of the dispatch pool by the platform rules.
        </p>

      </div>
    </div>
  );
}
