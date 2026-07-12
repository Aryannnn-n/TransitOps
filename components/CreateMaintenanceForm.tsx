"use client";

import { useState } from "react";
import { createMaintenanceLog } from "@/lib/actions/maintenance";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

interface VehicleOption {
  id: string;
  registrationNumber: string;
  name: string;
  status: string;
}

interface CreateMaintenanceFormProps {
  vehiclesList: VehicleOption[];
}

export function CreateMaintenanceForm({ vehiclesList }: CreateMaintenanceFormProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  // Filter list to exclude retired vehicles
  const activeVehicles = vehiclesList.filter((v) => v.status !== "retired");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setSuccess(false);

    const payload = {
      vehicleId,
      serviceType,
      cost: parseFloat(cost),
      notes: notes || null,
    };

    try {
      const res = await createMaintenanceLog(payload);
      if (res.error) {
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        setVehicleId("");
        setServiceType("");
        setCost("");
        setNotes("");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log maintenance.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider mb-4">Log Service Record</h3>
      
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-750 flex items-start gap-2.5 font-bold">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2.5 font-bold">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Maintenance log created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Select Vehicle
              </label>
              {activeVehicles.length === 0 ? (
                <div className="text-sm text-red-600 font-bold py-1">* No active vehicles available for maintenance.</div>
              ) : (
                <select 
                  required 
                  value={vehicleId} 
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
                >
                  <option value="">Select a Vehicle</option>
                  {activeVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.vehicleId && (
                <span className="text-sm text-red-700 mt-1 block font-bold">
                  {fieldErrors.vehicleId.join(", ")}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Service Type / Maintenance Type
              </label>
              <input
                type="text"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g. Engine Oil Change"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
              {fieldErrors.serviceType && (
                <span className="text-sm text-red-700 mt-1 block font-bold">
                  {fieldErrors.serviceType.join(", ")}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Cost (INR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
              {fieldErrors.cost && (
                <span className="text-sm text-red-700 mt-1 block font-bold">
                  {fieldErrors.cost.join(", ")}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Diagnostic Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issues or work details..."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors h-24 resize-none"
            />
            {fieldErrors.notes && (
              <span className="text-sm text-red-700 mt-1 block font-bold">
                {fieldErrors.notes.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isLoading || activeVehicles.length === 0}
            className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Scheduling..." : "Log Maintenance"}
          </button>
        </div>
      </form>
    </div>
  );
}
