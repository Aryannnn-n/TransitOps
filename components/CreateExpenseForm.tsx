"use client";

import { useState } from "react";
import { createExpense } from "@/lib/actions/expenses";
import { useRouter } from "next/navigation";

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
    <div>
      <h3>Log Trip Expense (Toll / Other only)</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Expense saved successfully!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Vehicle:</label>
          <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Select a Vehicle</option>
            {vehiclesList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} - {v.name}
              </option>
            ))}
          </select>
          {fieldErrors.vehicleId && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.vehicleId.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Select Trip (Optional):</label>
          <select value={tripId} onChange={(e) => setTripId(e.target.value)}>
            <option value="">No Associated Trip</option>
            {tripsList.map((t) => (
              <option key={t.id} value={t.id}>
                Trip #{t.tripNumber} ({t.source} to {t.destination})
              </option>
            ))}
          </select>
          {fieldErrors.tripId && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.tripId.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Expense Category:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="toll">Toll</option>
            <option value="other">Other</option>
          </select>
          {fieldErrors.type && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.type.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Amount (INR):</label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250"
          />
          {fieldErrors.amount && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.amount.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Expense Date:</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {fieldErrors.date && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.date.join(", ")}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading || vehiclesList.length === 0}>
          {isLoading ? "Saving..." : "Log Expense"}
        </button>
      </form>
    </div>
  );
}
