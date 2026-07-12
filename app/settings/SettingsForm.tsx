"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    setIsLoading(false);
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
    <div>
      <h3>Organizational Settings</h3>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Depot Name: </label>
          <input
            type="text"
            value={depotName}
            disabled={!isFinancialAnalyst}
            onChange={(e) => setDepotName(e.target.value)}
          />
        </div>

        <div>
          <label>Currency: </label>
          <input
            type="text"
            value={currency}
            disabled={!isFinancialAnalyst}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div>
          <label>Distance Unit: </label>
          <input
            type="text"
            value={distanceUnit}
            disabled={!isFinancialAnalyst}
            onChange={(e) => setDistanceUnit(e.target.value)}
          />
        </div>

        <div>
          <label>Rate per KM ({currency}): </label>
          <input
            type="number"
            step="0.01"
            value={ratePerKm}
            disabled={!isFinancialAnalyst}
            onChange={(e) => setRatePerKm(e.target.value)}
          />
        </div>

        <div>
          <label>Average Speed (KMPH): </label>
          <input
            type="number"
            step="0.1"
            value={avgSpeedKmph}
            disabled={!isFinancialAnalyst}
            onChange={(e) => setAvgSpeedKmph(e.target.value)}
          />
        </div>

        {isFinancialAnalyst ? (
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        ) : (
          <p><em>* Only Financial Analysts can edit organizational settings.</em></p>
        )}
      </form>

      <hr />

      <h3>Role Permissions Reference Table (Static)</h3>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Role</th>
            <th>Nav / Write Scope Permissions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Fleet Manager</strong></td>
            <td>Fleet, Maintenance</td>
          </tr>
          <tr>
            <td><strong>Dispatcher</strong></td>
            <td>Dashboard, Trips</td>
          </tr>
          <tr>
            <td><strong>Safety Officer</strong></td>
            <td>Drivers (including license/compliance)</td>
          </tr>
          <tr>
            <td><strong>Financial Analyst</strong></td>
            <td>Fuel & Expenses, Analytics, Settings (rate-per-km)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
