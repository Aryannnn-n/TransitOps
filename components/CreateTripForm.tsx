"use client";

import { useState, useEffect } from "react";
import { createTripDraft } from "@/lib/actions/trips";
import { useRouter } from "next/navigation";

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
    <div>
      <h3>Create Trip (Save Draft)</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Trip draft saved successfully!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Source Location:</label>
          <input
            type="text"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Mumbai Depot"
          />
          {fieldErrors.source && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.source.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Destination Location:</label>
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Pune Hub"
          />
          {fieldErrors.destination && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.destination.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Cargo Weight (kg):</label>
          <input
            type="number"
            step="0.01"
            required
            value={cargoWeightKg}
            onChange={(e) => setCargoWeightKg(e.target.value)}
            placeholder="e.g. 5000"
          />
          {capacityWarning && (
            <span style={{ color: "red", display: "block", fontWeight: "bold" }}>
              {capacityWarning}
            </span>
          )}
          {fieldErrors.cargoWeightKg && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.cargoWeightKg.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Planned Distance (km):</label>
          <input
            type="number"
            step="0.01"
            required
            value={plannedDistanceKm}
            onChange={(e) => setPlannedDistanceKm(e.target.value)}
            placeholder="e.g. 150"
          />
          {fieldErrors.plannedDistanceKm && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.plannedDistanceKm.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Assign Vehicle (Available Only):</label>
          {vehiclesList.length === 0 ? (
            <p style={{ color: "red" }}>No vehicles available in the dispatch pool.</p>
          ) : (
            <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Select a Vehicle</option>
              {vehiclesList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} - {v.name} (Max: {parseFloat(v.capacityKg)} kg)
                </option>
              ))}
            </select>
          )}
          {fieldErrors.vehicleId && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.vehicleId.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Assign Driver (Available Only):</label>
          {driversList.length === 0 ? (
            <p style={{ color: "red" }}>No drivers available in the dispatch pool.</p>
          ) : (
            <select required value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">Select a Driver</option>
              {driversList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Safety Score: {d.safetyScore}/100)
                </option>
              ))}
            </select>
          )}
          {fieldErrors.driverId && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.driverId.join(", ")}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading || vehiclesList.length === 0 || driversList.length === 0}>
          {isLoading ? "Saving..." : "Save Draft"}
        </button>
      </form>
    </div>
  );
}
