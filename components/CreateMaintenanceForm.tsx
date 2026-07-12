"use client";

import { useState } from "react";
import { createMaintenanceLog } from "@/lib/actions/maintenance";
import { useRouter } from "next/navigation";

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
    <div>
      <h3>Schedule Vehicle Maintenance</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Maintenance log created successfully!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Vehicle:</label>
          <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Select a Vehicle</option>
            {activeVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} - {v.name} (Current Status: {v.status})
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
          <label>Service Type / Maintenance Type:</label>
          <input
            type="text"
            required
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="e.g. Engine Oil Change, Brake Pad Replacement"
          />
          {fieldErrors.serviceType && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.serviceType.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Estimated Cost (INR):</label>
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
          <label>Diagnostic Notes / Instructions:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the issues or work details..."
          />
          {fieldErrors.notes && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.notes.join(", ")}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading || activeVehicles.length === 0}>
          {isLoading ? "Scheduling..." : "Put In Shop & Open Log"}
        </button>
      </form>
    </div>
  );
}
