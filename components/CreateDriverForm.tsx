"use client";

import { createDriver } from "@/lib/actions/drivers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert, Plus, X } from "lucide-react";

export function CreateDriverForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!isOpen) {
    return (
      <div className="flex justify-start">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Driver</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 uppercase tracking-wider">Register New Driver</h3>
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
          <span>Driver registered successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Driver Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
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
              License Number (Unique)
            </label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. DL-12345678901"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.licenseNumber && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.licenseNumber.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              License Category
            </label>
            <input
              type="text"
              required
              value={licenseCategory}
              onChange={(e) => setLicenseCategory(e.target.value)}
              placeholder="e.g. Heavy Commercial"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.licenseCategory && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.licenseCategory.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              License Expiry Date
            </label>
            <input
              type="date"
              required
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.licenseExpiry && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.licenseExpiry.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +919876543210"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.phone && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.phone.join(", ")}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Safety Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={safetyScore}
              onChange={(e) => setSafetyScore(e.target.value)}
              placeholder="100"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
            />
            {fieldErrors.safetyScore && (
              <span className="text-xs text-red-700 font-bold mt-1 block font-semibold">
                {fieldErrors.safetyScore.join(", ")}
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
            {isLoading ? "Registering..." : "Register Driver"}
          </button>
        </div>
      </form>
    </div>
  );
}
