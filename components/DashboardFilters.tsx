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
    <div>
      <h3>Dashboard Filters</h3>
      <div>
        <label>Vehicle Type: </label>
        <select
          value={searchParams.get("type") || ""}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Vehicle Status: </label>
        <select
          value={searchParams.get("status") || ""}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Region: </label>
        <select
          value={searchParams.get("region") || ""}
          onChange={(e) => handleChange("region", e.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <button onClick={() => router.push(pathname)}>
        Clear Filters
      </button>
    </div>
  );
}
