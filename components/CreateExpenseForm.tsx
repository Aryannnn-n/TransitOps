"use client";

import { useState } from "react";
import { createExpense } from "@/lib/actions/expenses";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

interface VehicleOption {
  id: string;
  registrationNumber: string;
  name: string;
}

interface TripOption {
  id: string;
  tripNumber: number;
  source: string;
  destination: string;
}

interface CreateExpenseFormProps {
  vehiclesList: VehicleOption[];
  tripsList: TripOption[];
}

export function CreateExpenseForm({ vehiclesList, tripsList }: CreateExpenseFormProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [type, setType] = useState("toll");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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
      vehicleId,
      tripId: tripId || null,
      type,
      amount: parseFloat(amount),
      date,
    };

    try {
      const res = await createExpense(payload);
      if (res.error) {
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        setVehicleId("");
        setTripId("");
        setType("toll");
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log expense.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider mb-4">Log Trip Expense (Toll / Other)</h3>
      
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Expense saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Select Vehicle
          </label>
          <select 
            required 
            value={vehicleId} 
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          >
            <option value="">Select a Vehicle</option>
            {vehiclesList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name}
              </option>
            ))}
          </select>
          {fieldErrors.vehicleId && (
            <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
              {fieldErrors.vehicleId.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Select Trip (Optional)
          </label>
          <select 
            value={tripId} 
            onChange={(e) => setTripId(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          >
            <option value="">No Associated Trip</option>
            {tripsList.map((t) => (
              <option key={t.id} value={t.id}>
                Trip #{t.tripNumber} ({t.source} to {t.destination})
              </option>
            ))}
          </select>
          {fieldErrors.tripId && (
            <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
              {fieldErrors.tripId.join(", ")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Expense Category
            </label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
            >
              <option value="toll">Toll</option>
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
              Amount (INR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 250"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.amount && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.amount.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Expense Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
          />
          {fieldErrors.date && (
            <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
              {fieldErrors.date.join(", ")}
            </span>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isLoading || vehiclesList.length === 0}
            className="w-full sm:w-auto rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Log Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
