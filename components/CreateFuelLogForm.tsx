"use client";

import { useState } from "react";
import { createFuelLog } from "@/lib/actions/expenses";
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

interface CreateFuelLogFormProps {
  vehiclesList: VehicleOption[];
  tripsList: TripOption[];
}

export function CreateFuelLogForm({ vehiclesList, tripsList }: CreateFuelLogFormProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
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
      liters: parseFloat(liters),
      cost: parseFloat(cost),
      date,
    };

    try {
      const res = await createFuelLog(payload);
      if (res.error) {
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        setVehicleId("");
        setTripId("");
        setLiters("");
        setCost("");
        setDate(new Date().toISOString().split("T")[0]);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log fuel transaction.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h3>Log Fuel Purchase</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Fuel log saved successfully!</p>}

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
          <label>Fuel Quantity (Liters):</label>
          <input
            type="number"
            step="0.01"
            required
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            placeholder="e.g. 50"
          />
          {fieldErrors.liters && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.liters.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Total Cost (INR):</label>
          <input
            type="number"
            step="0.01"
            required
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 5000"
          />
          {fieldErrors.cost && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.cost.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Transaction Date:</label>
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
          {isLoading ? "Saving..." : "Log Fuel Purchase"}
        </button>
      </form>
    </div>
  );
}
