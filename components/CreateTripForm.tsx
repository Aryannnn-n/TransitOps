"use client";

import { useState, useEffect } from "react";
import { createTripDraft } from "@/lib/actions/trips";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

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

interface CreateTripFormProps {
  vehiclesList: VehicleOption[];
  driversList: DriverOption[];
}

export function CreateTripForm({ vehiclesList, driversList }: CreateTripFormProps) {
  const router = useRouter();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoWeightKg, setCargoWeightKg] = useState("");
  const [plannedDistanceKm, setPlannedDistanceKm] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  // Inline capacity warning
  const [capacityWarning, setCapacityWarning] = useState("");

  const selectedVehicle = vehiclesList.find((v) => v.id === vehicleId);
  const vehicleCapacity = selectedVehicle ? parseFloat(selectedVehicle.capacityKg) : 0;

  useEffect(() => {
    if (selectedVehicle && cargoWeightKg) {
      const weight = parseFloat(cargoWeightKg);
      if (weight > vehicleCapacity) {
        setCapacityWarning(
          `Warning: Cargo weight (${weight} kg) exceeds vehicle capacity (${vehicleCapacity} kg).`
        );
      } else {
        setCapacityWarning("");
      }
    } else {
      setCapacityWarning("");
    }
  }, [cargoWeightKg, vehicleId, selectedVehicle, vehicleCapacity]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setSuccess(false);

    if (parseFloat(cargoWeightKg) > vehicleCapacity) {
      setError("Cannot submit: Cargo weight exceeds vehicle capacity.");
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
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        setSource("");
        setDestination("");
        setCargoWeightKg("");
        setPlannedDistanceKm("");
        setVehicleId("");
        setDriverId("");
        router.push("/trips");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create trip.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider mb-4">Create Trip (Save Draft)</h3>
      
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Trip draft saved successfully!</span>
        </div>
      )}
      {capacityWarning && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2.5 font-semibold">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
          <span>{capacityWarning}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Source Location
            </label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Mumbai Depot"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.source && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.source.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Destination Location
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pune Hub"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.destination && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.destination.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Cargo Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={cargoWeightKg}
              onChange={(e) => setCargoWeightKg(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.cargoWeightKg && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.cargoWeightKg.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Planned Distance (km)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={plannedDistanceKm}
              onChange={(e) => setPlannedDistanceKm(e.target.value)}
              placeholder="e.g. 150"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.plannedDistanceKm && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.plannedDistanceKm.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Assign Vehicle (Available Only)
            </label>
            {vehiclesList.length === 0 ? (
              <div className="text-sm text-red-600 font-semibold py-2">No vehicles available in dispatch pool.</div>
            ) : (
              <select 
                required 
                value={vehicleId} 
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
              >
                <option value="">Select a Vehicle</option>
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.name} (Max: {parseFloat(v.capacityKg)} kg)
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.vehicleId && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.vehicleId.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Assign Driver (Available Only)
            </label>
            {driversList.length === 0 ? (
              <div className="text-sm text-red-600 font-semibold py-2">No drivers available in dispatch pool.</div>
            ) : (
              <select 
                required 
                value={driverId} 
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
              >
                <option value="">Select a Driver</option>
                {driversList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Safety Score: {d.safetyScore}/100)
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.driverId && (
              <span className="text-sm text-red-650 mt-1 block">
                {fieldErrors.driverId.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isLoading || vehiclesList.length === 0 || driversList.length === 0}
            className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
