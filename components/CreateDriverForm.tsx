"use client";

import { createDriver } from "@/lib/actions/drivers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateDriverForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [phone, setPhone] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");

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
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      phone,
      safetyScore: parseInt(safetyScore),
    };

    try {
      const res = await createDriver(payload);
      if (res.error) {
        setError(res.error);
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      } else {
        setSuccess(true);
        // Clear fields
        setName("");
        setLicenseNumber("");
        setLicenseCategory("");
        setLicenseExpiry("");
        setPhone("");
        setSafetyScore("100");
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
      <h3>Register New Driver</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Driver registered successfully!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Driver Full Name:</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
          />
          {fieldErrors.name && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.name.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>License Number (Unique):</label>
          <input
            type="text"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. DL-12345678901"
          />
          {fieldErrors.licenseNumber && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.licenseNumber.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>License Category:</label>
          <input
            type="text"
            required
            value={licenseCategory}
            onChange={(e) => setLicenseCategory(e.target.value)}
            placeholder="e.g. Heavy Commercial"
          />
          {fieldErrors.licenseCategory && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.licenseCategory.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>License Expiry Date:</label>
          <input
            type="date"
            required
            value={licenseExpiry}
            onChange={(e) => setLicenseExpiry(e.target.value)}
          />
          {fieldErrors.licenseExpiry && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.licenseExpiry.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Phone Number:</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +919876543210"
          />
          {fieldErrors.phone && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.phone.join(", ")}
            </span>
          )}
        </div>

        <div>
          <label>Safety Score (0-100):</label>
          <input
            type="number"
            min="0"
            max="100"
            required
            value={safetyScore}
            onChange={(e) => setSafetyScore(e.target.value)}
            placeholder="100"
          />
          {fieldErrors.safetyScore && (
            <span style={{ color: "red", display: "block" }}>
              {fieldErrors.safetyScore.join(", ")}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register Driver"}
        </button>
      </form>
    </div>
  );
}
