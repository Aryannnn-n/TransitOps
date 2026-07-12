"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

interface Settings {
  id?: string;
  depotName: string;
  currency: string;
  distanceUnit: string;
  ratePerKm: string;
  avgSpeedKmph: string;
}

export function SettingsForm({
  initialSettings,
  userRole,
}: {
  initialSettings: Settings | null;
  userRole: string;
}) {
  const router = useRouter();
  const isFinancialAnalyst = userRole === "financial_analyst";

  const [depotName, setDepotName] = useState(initialSettings?.depotName || "Main Depot");
  const [currency, setCurrency] = useState(initialSettings?.currency || "INR");
  const [distanceUnit, setDistanceUnit] = useState(initialSettings?.distanceUnit || "km");
  const [ratePerKm, setRatePerKm] = useState(initialSettings?.ratePerKm || "0");
  const [avgSpeedKmph, setAvgSpeedKmph] = useState(initialSettings?.avgSpeedKmph || "40");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFinancialAnalyst) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depotName,
          currency,
          distanceUnit,
          ratePerKm,
          avgSpeedKmph,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSuccess("Settings updated successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-zinc-900">
      
      {/* Left Column: Settings Form Card */}
      <section className="lg:col-span-7 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">Organizational Settings</h3>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-750 flex items-start gap-2.5 font-bold">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2.5 font-bold">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                Depot Name
              </label>
              <input
                type="text"
                value={depotName}
                disabled={!isFinancialAnalyst}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                Currency
              </label>
              <input
                type="text"
                value={currency}
                disabled={!isFinancialAnalyst}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                Distance Unit
              </label>
              <input
                type="text"
                value={distanceUnit}
                disabled={!isFinancialAnalyst}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                Rate per KM ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={ratePerKm}
                disabled={!isFinancialAnalyst}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
                Average Speed (KMPH)
              </label>
              <input
                type="number"
                step="0.1"
                value={avgSpeedKmph}
                disabled={!isFinancialAnalyst}
                onChange={(e) => setAvgSpeedKmph(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100">
            {isFinancialAnalyst ? (
              <button 
                type="submit" 
                disabled={isLoading}
                className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Settings"}
              </button>
            ) : (
              <span className="text-xs text-zinc-700 font-semibold italic">
                * Note: Only Financial Analysts can edit organizational settings.
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Right Column: Permissions Table Section (Static) */}
      <section className="lg:col-span-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4 h-fit">
        <h3 className="text-sm font-bold tracking-tight text-zinc-950 uppercase tracking-wider">Role Permissions Matrix</h3>
        
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-800 font-bold uppercase tracking-wider bg-zinc-50/50">
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Access Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-bold text-zinc-900">Fleet Manager</td>
                <td className="px-4 py-3 text-zinc-800 font-semibold leading-relaxed">Add Vehicles, Manage Statuses, Schedule Maintenance, Close Shop Tickets</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-bold text-zinc-900">Dispatcher</td>
                <td className="px-4 py-3 text-zinc-800 font-semibold leading-relaxed">Plan Shipments (Save Drafts), Dispatch Shipments, Complete/Cancel Trips</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-bold text-zinc-900">Safety Officer</td>
                <td className="px-4 py-3 text-zinc-800 font-semibold leading-relaxed">Add Drivers, Manage Licensing/Expirations, Driver Safety Scores</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-bold text-zinc-900">Financial Analyst</td>
                <td className="px-4 py-3 text-zinc-800 font-semibold leading-relaxed">Log Fuel Purchases, Log Trip Expenses (Tolls/Other), View Financial Dashboards, Modify Settings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
