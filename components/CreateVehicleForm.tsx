"use client";

import { createVehicle } from "@/lib/actions/vehicles";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert, Plus, X } from "lucide-react";

export function CreateVehicleForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("truck");
  const [capacityKg, setCapacityKg] = useState("");
  const [odometerKm, setOdometerKm] = useState("0");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [region, setRegion] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setSuccess(false);

    const payload = {
      registrationNumber,
      name,
      type,
      capacityKg: parseFloat(capacityKg),
      odometerKm: parseFloat(odometerKm),
      acquisitionCost: parseFloat(acquisitionCost),
      region: region || null,
    };

    try {
      const res = await createVehicle(payload);
      if (res.error) {
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        // Clear fields
        setRegistrationNumber("");
        setName("");
        setType("truck");
        setCapacityKg("");
        setOdometerKm("0");
        setAcquisitionCost("");
        setRegion("");
        // Keep open to show success state, but refresh router
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex justify-start">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">Register New Vehicle</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setError("");
            setSuccess(false);
          }}
          className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 p-1.5 text-zinc-700 transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Vehicle registered successfully!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. MH12AB1234"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.registrationNumber && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.registrationNumber.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Vehicle Name/Model
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tata Prima"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.name && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.name.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Vehicle Type
            </label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
            >
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bike">Bike</option>
              <option value="mini_truck">Mini Truck</option>
              <option value="pickup">Pickup</option>
              <option value="other">Other</option>
            </select>
            {fieldErrors.type && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.type.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Cargo Capacity (kg)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={capacityKg}
              onChange={(e) => setCapacityKg(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.capacityKg && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.capacityKg.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Odometer Reading (km)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.odometerKm && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.odometerKm.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Acquisition Cost (INR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
              placeholder="e.g. 3500000"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.acquisitionCost && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.acquisitionCost.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Depot Region (Optional)
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. West"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.region && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.region.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError("");
              setSuccess(false);
            }}
            className="rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Registering..." : "Register Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
