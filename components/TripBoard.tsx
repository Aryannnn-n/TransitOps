"use client";

import { useState } from "react";
import { dispatchTrip, completeTrip, cancelTrip } from "@/lib/actions/trips";
import { useRouter } from "next/navigation";

interface TripItem {
  id: string;
  tripNumber: number;
  source: string;
  destination: string;
  cargoWeightKg: string;
  plannedDistanceKm: string;
  revenue: string;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  finalOdometerKm: string | null;
  fuelConsumedLiters: string | null;
  cancellationReason: string | null;
  vehicle: {
    registrationNumber: string;
    name: string;
    odometerKm: string;
  } | null;
  driver: {
    name: string;
  } | null;
}

interface TripBoardProps {
  tripsList: TripItem[];
  userRole: string | undefined;
}

export function TripBoard({ tripsList, userRole }: TripBoardProps) {
  const router = useRouter();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"complete" | "cancel" | null>(null);

  // Complete form state
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  // Cancel form state
  const [cancelReason, setCancelReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canWrite = userRole === "dispatcher" || userRole === "fleet_manager";

  async function handleDispatch(tripId: string) {
    if (!confirm("Are you sure you want to dispatch this shipment?")) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await dispatchTrip(tripId);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to dispatch trip.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompleteSubmit(e: React.FormEvent, tripId: string) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = {
      tripId,
      finalOdometerKm: parseFloat(finalOdometer),
      fuelConsumedLiters: parseFloat(fuelConsumed),
    };

    try {
      const res = await completeTrip(payload);
      if (res.error) {
        setError(res.error);
      } else {
        // Reset states
        setActiveTripId(null);
        setActionType(null);
        setFinalOdometer("");
        setFuelConsumed("");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete trip.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelSubmit(e: React.FormEvent, tripId: string) {
    e.preventDefault();
    if (!confirm("Are you sure you want to cancel this shipment? This action is permanent.")) {
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await cancelTrip(tripId, cancelReason);
      if (res.error) {
        setError(res.error);
      } else {
        // Reset states
        setActiveTripId(null);
        setActionType(null);
        setCancelReason("");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel trip.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {error && <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>}

      {activeTripId && actionType === "complete" && (
        <div style={{ border: "1px solid black", padding: "10px", margin: "10px 0" }}>
          <h4>Complete Shipment (Trip #{tripsList.find((t) => t.id === activeTripId)?.tripNumber})</h4>
          <form onSubmit={(e) => handleCompleteSubmit(e, activeTripId)}>
            <div>
              <label>Final Odometer Reading (km):</label>
              <input
                type="number"
                step="0.01"
                required
                value={finalOdometer}
                onChange={(e) => setFinalOdometer(e.target.value)}
                placeholder="e.g. 50500"
              />
            </div>
            <div>
              <label>Fuel Consumed (Liters):</label>
              <input
                type="number"
                step="0.01"
                required
                value={fuelConsumed}
                onChange={(e) => setFuelConsumed(e.target.value)}
                placeholder="e.g. 45"
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Complete Shipment"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTripId(null);
                setActionType(null);
              }}
            >
              Cancel Form
            </button>
          </form>
        </div>
      )}

      {activeTripId && actionType === "cancel" && (
        <div style={{ border: "1px solid black", padding: "10px", margin: "10px 0" }}>
          <h4>Cancel Shipment (Trip #{tripsList.find((t) => t.id === activeTripId)?.tripNumber})</h4>
          <form onSubmit={(e) => handleCancelSubmit(e, activeTripId)}>
            <div>
              <label>Reason for Cancellation:</label>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason"
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Confirm Cancellation"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTripId(null);
                setActionType(null);
              }}
            >
              Cancel Form
            </button>
          </form>
        </div>
      )}

      <table border={1}>
        <thead>
          <tr>
            <th>Trip #</th>
            <th>Route</th>
            <th>Cargo (kg)</th>
            <th>Distance (km)</th>
            <th>Revenue</th>
            <th>Status</th>
            <th>Vehicle Assigned</th>
            <th>Driver Assigned</th>
            <th>Dates</th>
            <th>Final Readings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tripsList.map((t) => {
            const hasStarted = t.startedAt ? new Date(t.startedAt).toLocaleString() : "N/A";
            const hasEnded = t.completedAt ? new Date(t.completedAt).toLocaleString() : "N/A";
            
            return (
              <tr key={t.id}>
                <td>{t.tripNumber}</td>
                <td>
                  <strong>From:</strong> {t.source} <br />
                  <strong>To:</strong> {t.destination}
                </td>
                <td>{parseFloat(t.cargoWeightKg).toLocaleString()} kg</td>
                <td>{parseFloat(t.plannedDistanceKm).toLocaleString()} km</td>
                <td>{parseFloat(t.revenue).toLocaleString()}</td>
                <td style={{ textTransform: "capitalize", fontWeight: "bold" }}>{t.status}</td>
                <td>
                  {t.vehicle ? (
                    <>
                      {t.vehicle.registrationNumber} <br />
                      <small>({t.vehicle.name})</small>
                    </>
                  ) : (
                    "Unassigned"
                  )}
                </td>
                <td>{t.driver ? t.driver.name : "Unassigned"}</td>
                <td>
                  <small>
                    <strong>Started:</strong> {hasStarted} <br />
                    <strong>Ended:</strong> {hasEnded}
                  </small>
                </td>
                <td>
                  {t.status === "completed" && (
                    <small>
                      <strong>Odo:</strong> {t.finalOdometerKm} km <br />
                      <strong>Fuel:</strong> {t.fuelConsumedLiters} L
                    </small>
                  )}
                  {t.status === "cancelled" && (
                    <small style={{ color: "red" }}>
                      <strong>Cancelled:</strong> {t.cancellationReason}
                    </small>
                  )}
                  {t.status !== "completed" && t.status !== "cancelled" && "—"}
                </td>
                <td>
                  {canWrite && t.status === "draft" && (
                    <button type="button" onClick={() => handleDispatch(t.id)}>
                      Dispatch
                    </button>
                  )}

                  {canWrite && t.status === "dispatched" && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTripId(t.id);
                          setActionType("complete");
                          setFinalOdometer(t.vehicle?.odometerKm || "");
                        }}
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTripId(t.id);
                          setActionType("cancel");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {t.status === "completed" && "Completed"}
                  {t.status === "cancelled" && "Cancelled"}
                  {!canWrite && (t.status === "draft" || t.status === "dispatched") && (
                    <small>No Write Access</small>
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
