"use client";

import { useState } from "react";
import { closeMaintenanceLog } from "@/lib/actions/maintenance";
import { useRouter } from "next/navigation";

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
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to close log.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <table border={1}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service Type</th>
            <th>Cost</th>
            <th>Notes</th>
            <th>Status</th>
            <th>Opened At</th>
            <th>Closed At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsList.map((log) => {
            const openDate = new Date(log.openedAt).toLocaleString();
            const closeDate = log.closedAt ? new Date(log.closedAt).toLocaleString() : "N/A";

            return (
              <tr key={log.id}>
                <td>
                  {log.vehicleReg ? (
                    <>
                      {log.vehicleReg} <br />
                      <small>({log.vehicleName})</small>
                    </>
                  ) : (
                    "Unknown Vehicle"
                  )}
                </td>
                <td>{log.serviceType}</td>
                <td>{parseFloat(log.cost).toLocaleString()}</td>
                <td>{log.notes || "—"}</td>
                <td style={{ textTransform: "capitalize", fontWeight: "bold" }}>{log.status}</td>
                <td>{openDate}</td>
                <td>{closeDate}</td>
                <td>
                  {log.status === "open" && isManager ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleCloseLog(log.id)}
                    >
                      Close Ticket
                    </button>
                  ) : log.status === "open" ? (
                    <small>No Permission</small>
                  ) : (
                    "Completed"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
