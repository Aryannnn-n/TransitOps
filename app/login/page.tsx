"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Bus,
  Radio,
  BarChart3,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("fleet_manager");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password || !role) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Quick fill handler for testing
  const handleQuickFill = (selectedRole: string) => {
    const roleEmails: Record<string, string> = {
      fleet_manager: "manager@transitops.com",
      dispatcher: "dispatcher@transitops.com",
      safety_officer: "safety@transitops.com",
      financial_analyst: "finance@transitops.com",
    };
    setEmail(roleEmails[selectedRole] || "");
    setPassword("Password123");
    setRole(selectedRole);
  };

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
              <ShieldCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display">TransitOps</h1>
              <p className="text-sm text-zinc-400 font-medium mt-0.5">Smart Transport Operations Platform</p>
            </div>
          </div>

          {/* Center: Main content, given real visual weight */}
          <div className="relative space-y-5 max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-200">
              <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span>Dedicated Operational Views</span>
            </div>

            <h2 className="text-2xl font-bold leading-snug tracking-tight font-display">
              One platform for<br />your entire fleet.
            </h2>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/10">
                  <Bus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Fleet Manager</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Oversee vehicles, routes, and utilization</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/10">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Dispatcher</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Coordinate live operations in real time</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/10">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Safety Officer</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Monitor compliance and incident reports</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/10">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Financial Analyst</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Track costs, budgets, and forecasts</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Bottom Left: Copyright */}
          <div className="relative text-sm text-zinc-500 font-medium">
            &copy; TransitOps
          </div>
        </section>

        {/* Right Section - Form */}
        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto bg-white">

          <div className="w-full max-w-sm">

            {/* Back Button */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors mb-4 group w-fit">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to home</span>
            </Link>

            {/* Header */}
            <div className="flex flex-col mb-4">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Sign in to your account</h2>
              <p className="text-sm text-zinc-600 mt-1 font-medium">Enter your credentials to access the platform</p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-700">Email Address</label>
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

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-9 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-700">Role</label>
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

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-zinc-600 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-200 bg-white text-orange-600 focus:ring-0 focus:outline-none"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-zinc-950 hover:bg-zinc-900 text-white py-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm border border-zinc-900/10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-3 text-center text-sm text-zinc-600 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                Sign Up
              </Link>
            </div>

            {/* Quick Fill Dev Buttons */}
            <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                Test Credentials
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("fleet_manager")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-orange-50/30 hover:border-orange-200 hover:text-orange-700 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Fleet Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("dispatcher")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-orange-50/30 hover:border-orange-200 hover:text-orange-700 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Dispatcher
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("safety_officer")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-orange-50/30 hover:border-orange-200 hover:text-orange-700 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Safety Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("financial_analyst")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-orange-50/30 hover:border-orange-200 hover:text-orange-700 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Financial Analyst
                </button>
              </div>
            </div>

            {/* Informational Text */}
            <p className="text-[10px] text-zinc-400 mt-3 text-center leading-relaxed font-medium">
              Note: Your selected role must match the database role to authenticate.
            </p>

          </div>

        </section>

      </div>
    </div>
  );
}