"use client";

import { createVehicle } from "@/lib/actions/vehicles";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateVehicleForm() {
  const router = useRouter();
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
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h3>Register New Vehicle</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Vehicle registered successfully!</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Registration Number (Unique):</label>
          <input
            type="text"
            required
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="e.g. MH12AB1234"
          />
          {fieldErrors.registrationNumber && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.registrationNumber.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Vehicle Name/Model:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tata Prima"
          />
          {fieldErrors.name && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.name.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Vehicle Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="bike">Bike</option>
            <option value="mini_truck">Mini Truck</option>
            <option value="pickup">Pickup</option>
            <option value="other">Other</option>
          </select>
          {fieldErrors.type && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.type.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Cargo Capacity (kg):</label>
          <input
            type="number"
            step="0.01"
            required
            value={capacityKg}
            onChange={(e) => setCapacityKg(e.target.value)}
            placeholder="e.g. 15000"
          />
          {fieldErrors.capacityKg && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.capacityKg.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Odometer Reading (km):</label>
          <input
            type="number"
            step="0.01"
            required
            value={odometerKm}
            onChange={(e) => setOdometerKm(e.target.value)}
            placeholder="e.g. 50000"
          />
          {fieldErrors.odometerKm && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.odometerKm.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Acquisition Cost:</label>
          <input
            type="number"
            step="0.01"
            required
            value={acquisitionCost}
            onChange={(e) => setAcquisitionCost(e.target.value)}
            placeholder="e.g. 3500000"
          />
          {fieldErrors.acquisitionCost && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.acquisitionCost.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Depot Region (Optional):</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. West"
          />
          {fieldErrors.region && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.region.join(", ")}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register Vehicle"}
        </button>
      </form>
    </div>
  );
}
