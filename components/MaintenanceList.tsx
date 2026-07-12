"use client";

import { useState } from "react";
import { closeMaintenanceLog } from "@/lib/actions/maintenance";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

interface MaintenanceItem {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: string;
  notes: string | null;
  status: string;
  openedAt: Date;
  closedAt: Date | null;
  vehicleReg: string | null;
  vehicleName: string | null;
}

interface MaintenanceListProps {
  logsList: MaintenanceItem[];
  userRole: string | undefined;
}

export function MaintenanceList({ logsList, userRole }: MaintenanceListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isManager = userRole === "fleet_manager";

  async function handleCloseLog(logId: string) {
    if (!confirm("Are you sure you want to close this maintenance log and mark the vehicle as available?")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await closeMaintenanceLog(logId);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to close log.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
              <th className="px-6 py-3.5">Vehicle</th>
              <th className="px-6 py-3.5">Service Type</th>
              <th className="px-6 py-3.5 text-right">Cost</th>
              <th className="px-6 py-3.5">Diagnostic Notes</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5">Opened At</th>
              <th className="px-6 py-3.5">Closed At</th>
              <th className="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {logsList.map((log) => {
              const openDate = new Date(log.openedAt).toLocaleString();
              const closeDate = log.closedAt ? new Date(log.closedAt).toLocaleString() : "—";

              // Status badge style
              let statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
              if (log.status === "closed") {
                statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
              }

              return (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    {log.vehicleReg ? (
                      <div>
                        <div className="font-mono font-bold text-zinc-900">{log.vehicleReg}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold">{log.vehicleName}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-400">Unknown Vehicle</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-900 font-semibold">{log.serviceType}</td>
                  <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(log.cost).toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-zinc-700 font-medium max-w-xs truncate" title={log.notes || undefined}>
                    {log.notes || "—"}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border capitalize ${statusBadge}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-700 font-medium text-xs" suppressHydrationWarning>{openDate}</td>
                  <td className="px-6 py-3.5 text-zinc-700 font-medium text-xs" suppressHydrationWarning>{closeDate}</td>
                  <td className="px-6 py-3.5 text-center">
                    {log.status === "open" && isManager ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleCloseLog(log.id)}
                        className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-1 text-xs hover:bg-red-100 transition-colors font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        Close Ticket
                      </button>
                    ) : log.status === "open" ? (
                      <span className="text-zinc-400 font-medium">View Only</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
