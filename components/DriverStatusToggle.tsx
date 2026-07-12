"use client";

import { useState } from "react";
import { updateDriverStatus } from "@/lib/actions/drivers";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DriverStatusToggleProps {
  driverId: string;
  currentStatus: "available" | "on_trip" | "off_duty" | "suspended";
  isAllowed: boolean;
}

export function DriverStatusToggle({ driverId, currentStatus, isAllowed }: DriverStatusToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStatusChange(newStatus: typeof currentStatus) {
    if (!isAllowed || newStatus === currentStatus) return;

    setIsLoading(true);
    try {
      const res = await updateDriverStatus(driverId, newStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update driver status");
    } finally {
      setIsLoading(false);
    }
  }

  // If not allowed to change it, or driver is currently On Trip (since On Trip is managed by trip dispatch/completion transactions)
  // we render a read-only badge.
  if (!isAllowed || currentStatus === "on_trip") {
    let badgeStyle = "bg-zinc-100 text-zinc-800 border-zinc-200";
    if (currentStatus === "available") badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (currentStatus === "on_trip") badgeStyle = "bg-blue-50 text-blue-800 border-blue-200";
    if (currentStatus === "suspended") badgeStyle = "bg-red-50 text-red-800 border-red-200";

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border capitalize ${badgeStyle}`}>
        {currentStatus.replace("_", " ")}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {isLoading && <Loader2 className="h-3 w-3 animate-spin text-zinc-900" />}
      <select
        value={status}
        disabled={isLoading}
        onChange={(e) => handleStatusChange(e.target.value as any)}
        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
      >
        <option value="available">Available</option>
        <option value="off_duty">Off Duty</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
  );
}
