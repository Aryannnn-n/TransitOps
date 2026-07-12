"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ShieldAlert, 
  ArrowRight, 
  Loader2,
  ShieldCheck
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
    <div className="flex min-h-screen w-full bg-white text-zinc-900 font-sans">
      
      {/* Left Section */}
      <section className="hidden md:flex md:w-1/2 bg-zinc-50 border-r border-zinc-200 p-10 flex-col justify-between">
        
        {/* Top: Logo and title */}
        <div className="space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 font-display">TransitOps</h1>
            <p className="text-sm text-zinc-700 font-medium">Smart Transport Operations Platform</p>
          </div>
        </div>

        {/* Center: Main User Roles */}
        <div className="space-y-4 max-w-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Our Main User Roles</h2>
          <ul className="space-y-2 text-sm text-zinc-700 font-medium list-disc pl-4">
            <li>Fleet Manager</li>
            <li>Dispatcher</li>
            <li>Safety Officer</li>
            <li>Financial Analyst</li>
          </ul>
        </div>

        {/* Bottom Left: Copyright */}
        <div className="text-sm text-zinc-500 font-medium">
          &copy; TransitOps
        </div>
      </section>

      {/* Right Section - Completely Centered Form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        
        <div className="w-full max-w-sm">
          
          <div className="w-full rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">Sign in to your account</h2>
              <p className="text-sm text-zinc-650 mt-1 font-medium">Enter your credentials to access the platform</p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
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
                    className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
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
                    className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-9 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
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
                    className="h-4 w-4 rounded border-zinc-200 bg-white text-zinc-900 focus:ring-0 focus:outline-none"
                  />
                  <span>Remember me</span>
                </label>
                {/* <Link href="#" className="text-sm text-zinc-700 hover:text-zinc-900 font-semibold underline">
                  Forgot Password?
                </Link> */}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-zinc-900 hover:bg-zinc-800 text-white py-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            <div className="mt-4 text-center text-sm text-zinc-600 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-zinc-900 font-bold hover:underline">
                Sign Up
              </Link>
            </div>

            {/* Quick Fill Dev Buttons */}
            <div className="mt-6 pt-6 border-t border-zinc-200 space-y-2.5">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                Test Credentials
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("fleet_manager")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Fleet Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("dispatcher")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Dispatcher
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("safety_officer")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Safety Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("financial_analyst")}
                  className="px-2 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold text-zinc-800 transition-colors cursor-pointer text-center"
                >
                  Financial Analyst
                </button>
              </div>
            </div>

            {/* Informational Text */}
            <p className="text-[10px] text-zinc-400 mt-4 text-center leading-relaxed font-medium">
              Note: Your selected role must match the database role to authenticate.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}
