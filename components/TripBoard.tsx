"use client";

import { useState, useEffect } from "react";
import { createTripDraft, dispatchTrip, completeTrip, cancelTrip } from "@/lib/actions/trips";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ShieldCheck, Search, X } from "lucide-react";

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
    capacityKg: string;
  } | null;
  driver: {
    name: string;
  } | null;
}

interface VehicleOption {
  id: string;
  registrationNumber: string;
  name: string;
  capacityKg: string;
}

interface DriverOption {
  id: string;
  name: string;
  safetyScore: number;
}

interface TripBoardProps {
  tripsList: TripItem[];
  userRole: string | undefined;
  availableVehicles: VehicleOption[];
  availableDrivers: DriverOption[];
}

export function TripBoard({ tripsList, userRole, availableVehicles, availableDrivers }: TripBoardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const canWrite = userRole === "dispatcher" || userRole === "fleet_manager";

  // Create Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoWeightKg, setCargoWeightKg] = useState("");
  const [plannedDistanceKm, setPlannedDistanceKm] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formSuccess, setFormSuccess] = useState(false);

  // Modal forms for Complete and Cancel actions
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"complete" | "cancel" | null>(null);
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actionError, setActionError] = useState("");

  // Capacity Warning
  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);
  const vehicleCapacity = selectedVehicle ? parseFloat(selectedVehicle.capacityKg) : 0;
  const isOverCapacity = selectedVehicle && cargoWeightKg && parseFloat(cargoWeightKg) > vehicleCapacity;

  function clearCreateForm() {
    setSource("");
    setDestination("");
    setCargoWeightKg("");
    setPlannedDistanceKm("");
    setVehicleId("");
    setDriverId("");
    setFormError("");
    setFieldErrors({});
    setFormSuccess(false);
  }

  async function handleCreateSubmit(e: React.FormEvent, dispatchNow = false) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setFormSuccess(false);
    setIsLoading(true);

    if (isOverCapacity) {
      setFormError("Cannot proceed: Cargo weight exceeds vehicle maximum capacity.");
      setIsLoading(false);
      return;
    }

    const payload = {
      source,
      destination,
      cargoWeightKg: parseFloat(cargoWeightKg),
      plannedDistanceKm: parseFloat(plannedDistanceKm),
      vehicleId,
      driverId,
    };

    try {
      const res = await createTripDraft(payload);
      if (res.error) {
        setFormError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setFormSuccess(true);
        clearCreateForm();
        router.refresh();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create shipment draft.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDispatch(tripId: string) {
    if (!confirm("Are you sure you want to dispatch this shipment?")) return;
    setIsLoading(true);
    setActionError("");

    try {
      const res = await dispatchTrip(tripId);
      if (res.error) {
        setActionError(res.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to dispatch trip.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompleteSubmit(e: React.FormEvent, tripId: string) {
    e.preventDefault();
    setIsLoading(true);
    setActionError("");

    const payload = {
      tripId,
      finalOdometerKm: parseFloat(finalOdometer),
      fuelConsumedLiters: parseFloat(fuelConsumed),
    };

    try {
      const res = await completeTrip(payload);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActiveTripId(null);
        setActionType(null);
        setFinalOdometer("");
        setFuelConsumed("");
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to complete trip.");
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
    setActionError("");

    try {
      const res = await cancelTrip(tripId, cancelReason);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActiveTripId(null);
        setActionType(null);
        setCancelReason("");
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel trip.");
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered live board list
  const filteredTrips = tripsList.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.tripNumber.toString().includes(query) ||
      t.source.toLowerCase().includes(query) ||
      t.destination.toLowerCase().includes(query) ||
      (t.vehicle?.registrationNumber || "").toLowerCase().includes(query) ||
      (t.driver?.name || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 text-zinc-900">
      
      {/* Search Input bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-800">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Trip #, Route, Vehicle or Driver..."
          className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
        />
      </div>

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-750 flex items-start gap-2.5 font-bold">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Action Modals */}
      {activeTripId && actionType === "complete" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-md max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">
              Complete Shipment (Trip #{tripsList.find((t) => t.id === activeTripId)?.tripNumber})
            </h4>
            <button onClick={() => { setActiveTripId(null); setActionType(null); }} className="p-1 hover:bg-zinc-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={(e) => handleCompleteSubmit(e, activeTripId)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Final Odometer Reading (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  placeholder="e.g. 50500"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Fuel Consumed (Liters)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTripId(null);
                  setActionType(null);
                }}
                className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-750 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Submitting..." : "Complete Shipment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTripId && actionType === "cancel" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-md max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">
              Cancel Shipment (Trip #{tripsList.find((t) => t.id === activeTripId)?.tripNumber})
            </h4>
            <button onClick={() => { setActiveTripId(null); setActionType(null); }} className="p-1 hover:bg-zinc-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={(e) => handleCancelSubmit(e, activeTripId)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Reason for Cancellation
              </label>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTripId(null);
                  setActionType(null);
                }}
                className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-750 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="rounded-md bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Submitting..." : "Confirm Cancellation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: CREATE TRIP FORM (Only dispatcher / fleet manager) */}
        {canWrite && (
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">Create Trip</h3>
              
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-750 flex items-start gap-2.5 font-bold">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2.5 font-bold">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Shipment draft saved!</span>
                </div>
              )}

              {/* Exceeded Capacity Warning Box */}
              {isOverCapacity && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1 font-semibold">
                  <div>Vehicle Capacity: {vehicleCapacity} kg</div>
                  <div>Cargo Weight: {cargoWeightKg} kg</div>
                  <div className="text-red-700 font-bold flex items-center gap-1">
                    <X className="h-3 w-3 shrink-0" />
                    <span>Capacity exceeded by {parseFloat(cargoWeightKg) - vehicleCapacity} kg — dispatch blocked</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">SOURCE</label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Gandhinagar Depot"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                  {fieldErrors.source && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.source.join(", ")}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">DESTINATION</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Ahmedabad Hub"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                  {fieldErrors.destination && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.destination.join(", ")}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">VEHICLE (AVAILABLE ONLY)</label>
                  {availableVehicles.length === 0 ? (
                    <div className="text-xs text-red-600 font-bold py-1">* No vehicles available for dispatch.</div>
                  ) : (
                    <select
                      required
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
                    >
                      <option value="">Select a Vehicle</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.registrationNumber} ({parseFloat(v.capacityKg)} kg capacity)
                        </option>
                      ))}
                    </select>
                  )}
                  {fieldErrors.vehicleId && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.vehicleId.join(", ")}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">DRIVER (AVAILABLE ONLY)</label>
                  {availableDrivers.length === 0 ? (
                    <div className="text-xs text-red-600 font-bold py-1">* No drivers available for dispatch.</div>
                  ) : (
                    <select
                      required
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
                    >
                      <option value="">Select a Driver</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Safety: {d.safetyScore}/100)
                        </option>
                      ))}
                    </select>
                  )}
                  {fieldErrors.driverId && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.driverId.join(", ")}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">CARGO WEIGHT (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cargoWeightKg}
                    onChange={(e) => setCargoWeightKg(e.target.value)}
                    placeholder="e.g. 700"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                  {fieldErrors.cargoWeightKg && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.cargoWeightKg.join(", ")}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">PLANNED DISTANCE (KM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={plannedDistanceKm}
                    onChange={(e) => setPlannedDistanceKm(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                  {fieldErrors.plannedDistanceKm && <span className="text-[10px] text-red-700 mt-1 block font-bold">{fieldErrors.plannedDistanceKm.join(", ")}</span>}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={clearCreateForm}
                    className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-750 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isOverCapacity || availableVehicles.length === 0 || availableDrivers.length === 0}
                    className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Draft
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Right column: LIVE BOARD */}
        <div className={canWrite ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
          
          {/* Trip Lifecycle Stepper */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-3">Trip Lifecycle</div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 px-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
                <span>Draft</span>
              </div>
              <div className="h-[1px] flex-1 bg-zinc-200 mx-3"></div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Dispatched</span>
              </div>
              <div className="h-[1px] flex-1 bg-zinc-200 mx-3"></div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Completed</span>
              </div>
              <div className="h-[1px] flex-1 bg-zinc-200 mx-3"></div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Live Board</h3>
            <span className="text-xs text-zinc-700 font-bold">{filteredTrips.length} Shipments</span>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 border border-zinc-200 rounded-lg bg-white text-xs text-zinc-750 font-bold">
              No shipments found matching the parameters.
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredTrips.map((t) => {
                let badgeStyle = "bg-zinc-100 text-zinc-800 border-zinc-200";
                if (t.status === "dispatched") badgeStyle = "bg-blue-50 text-blue-800 border-blue-200";
                if (t.status === "completed") badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
                if (t.status === "cancelled") badgeStyle = "bg-red-50 text-red-800 border-red-200";

                const assignedInfo = t.vehicle && t.driver
                  ? `${t.vehicle.registrationNumber} / ${t.driver.name}`
                  : t.vehicle
                  ? `${t.vehicle.registrationNumber} / Unassigned`
                  : "Unassigned";

                return (
                  <div key={t.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300 transition-all space-y-2">
                    
                    {/* Line 1 */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-900 font-mono">Trip #{t.tripNumber}</span>
                      <span className="text-zinc-700 font-semibold">{assignedInfo}</span>
                    </div>

                    {/* Line 2 */}
                    <div className="text-sm font-bold text-zinc-900">
                      {t.source} &rarr; {t.destination}
                    </div>

                    {/* Line 3 */}
                    <div className="flex justify-between items-center pt-1 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border capitalize ${badgeStyle}`}>
                          {t.status}
                        </span>
                        
                        {/* Inline Actions inside Card */}
                        {canWrite && t.status === "draft" && (
                          <button
                            onClick={() => handleDispatch(t.id)}
                            className="rounded bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Dispatch
                          </button>
                        )}
                        {canWrite && t.status === "dispatched" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setActiveTripId(t.id);
                                setActionType("complete");
                                setFinalOdometer(t.vehicle?.odometerKm || "");
                              }}
                              className="rounded bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => {
                                setActiveTripId(t.id);
                                setActionType("cancel");
                              }}
                              className="rounded border border-red-200 bg-red-50 text-red-700 px-2 py-0.5 text-[10px] font-bold hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-zinc-700 font-medium">
                        {t.status === "completed" ? (
                          <span>Odo: {t.finalOdometerKm} km | {t.fuelConsumedLiters} L</span>
                        ) : t.status === "cancelled" ? (
                          <span className="text-red-700 font-bold block max-w-[200px] truncate" title={t.cancellationReason || ""}>
                            Reason: {t.cancellationReason}
                          </span>
                        ) : (
                          <span>{t.plannedDistanceKm} km &bull; INR {parseFloat(t.revenue).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[10px] text-zinc-700 font-semibold">
            * On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle & Driver Available
          </p>

        </div>

      </div>
    </div>
  );
}
