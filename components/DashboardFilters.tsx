"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function DashboardFilters({
  regions,
  types,
  statuses,
}: {
  regions: string[];
  types: string[];
  statuses: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function handleChange(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider whitespace-nowrap">Vehicle Type</label>
          <select
            value={searchParams.get("type") || ""}
            onChange={(e) => handleChange("type", e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider whitespace-nowrap">Status</label>
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider whitespace-nowrap">Region</label>
          <select
            value={searchParams.get("region") || ""}
            onChange={(e) => handleChange("region", e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

      </div>

      <button 
        onClick={() => router.push(pathname)}
        className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap self-end sm:self-auto"
      >
        Clear Filters
      </button>
    </div>
  );
}
