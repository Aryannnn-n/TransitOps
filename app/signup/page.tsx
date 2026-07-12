"use client";

import { authClient } from "@/lib/auth-client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("dispatcher");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword || !role) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 font-sans flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden">
      <div className="w-full max-w-6xl max-h-full grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 bg-white">

        {/* Left Section */}
        <section className="relative hidden md:flex flex-col justify-between p-7 lg:p-9 bg-zinc-950 text-white overflow-hidden">

          {/* Decorative background, echoing homepage's dot grid + orange glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#f97316 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          {/* Top: Logo and title */}
          <div className="relative space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-zinc-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display">TransitOps</h1>
              <p className="text-sm text-zinc-400 font-medium mt-0.5">Smart Transport Operations Platform</p>
            </div>
          </div>

          {/* Center: headline + compact role chips, homepage-style */}
          <div className="relative space-y-5 max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-200">
              <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span>4 tailored role interfaces</span>
            </div>

            <h2 className="text-2xl font-bold leading-snug tracking-tight font-display">
              Built for your role,<br />from day one.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              One account, one login &mdash; the platform adapts its views and permissions to the role you're assigned.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"].map((r) => (
                <span
                  key={r}
                  className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-zinc-200 px-2.5 py-1 rounded-full border border-white/10"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Left: Copyright */}
          <div className="relative text-sm text-zinc-500 font-medium">
            &copy; TransitOps
          </div>
        </section>

        {/* Right Section - Form */}
        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto bg-white">

          <div className="w-full max-w-sm">

            {/* Header */}
            <div className="flex flex-col mb-4">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Create an account</h2>
              <p className="text-sm text-zinc-600 mt-1 font-medium">Join TransitOps fleet dispatcher platform</p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>Registration successful! Redirecting...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-600">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-600">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-600">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="safety_officer">Safety Officer</option>
                  <option value="financial_analyst">Financial Analyst</option>
                </select>
              </div>

              {/* Password + Confirm Password, side by side to save vertical space */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-zinc-600">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-8 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-zinc-600">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-8 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-zinc-950 hover:bg-zinc-900 text-white py-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm border border-zinc-900/10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign Up <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-3 text-center text-sm text-zinc-600 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                Sign In
              </Link>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}