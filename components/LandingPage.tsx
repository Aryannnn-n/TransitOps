"use client";

import Link from "next/link";
import { 
  Truck, 
  UserCheck, 
  BarChart3, 
  Wrench, 
  Fuel, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  CheckCircle2,
  TrendingUp,
  MapPin
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-zinc-950 tracking-tight">TransitOps</span>
              <span className="ml-1.5 text-xs font-semibold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">v1.2</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-zinc-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50/80 mb-6 text-sm font-semibold text-zinc-800 shadow-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span>The Odoo Hackathon 2026 Fleet Champion</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Logistics &amp; Fleet Operations, <br/>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Orchestrated in Real-Time.</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            TransitOps is a unified logistics platform that connects vehicles, driver credentials, live trip dispatches, maintenance lifecycles, and financial analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto rounded-md bg-zinc-950 hover:bg-zinc-900 text-white px-6 py-3 text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 px-6 py-3 text-base font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Access Platform</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="max-w-6xl mx-auto px-6 mt-16 lg:mt-20">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs font-semibold text-zinc-400">TransitOps Dashboard Control Room</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Active Vehicles", val: "14", color: "text-zinc-900" },
                { label: "Available Drivers", val: "9", color: "text-zinc-900" },
                { label: "Trips In Transit", val: "5", color: "text-orange-600" },
                { label: "Operational Cost", val: "₹1,42,850", color: "text-zinc-900" }
              ].map((c, i) => (
                <div key={i} className="border border-zinc-150 rounded-lg p-3.5 bg-zinc-50/50">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{c.label}</div>
                  <div className={`text-xl font-extrabold ${c.color} mt-1`}>{c.val}</div>
                </div>
              ))}
            </div>
            
            <div className="border border-zinc-150 rounded-lg overflow-hidden bg-zinc-50/20">
              <div className="bg-zinc-100/50 px-4 py-2 border-b border-zinc-150 text-xs font-bold text-zinc-600 flex justify-between items-center">
                <span>ACTIVE DISPATCH LIFECYCLE MONITOR</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full font-bold">LIVE FEED</span>
              </div>
              <div className="p-3.5 space-y-2.5">
                {[
                  { id: "TRP-1004", route: "Mumbai Depot → Pune Hub", weight: "12,500 kg", driver: "Rajesh Kumar", status: "In Transit" },
                  { id: "TRP-1003", route: "Delhi Terminal → Noida Hub", weight: "8,200 kg", driver: "Amit Sharma", status: "Draft" }
                ].map((t, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg shadow-sm text-sm gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-900">{t.id}</span>
                      <span className="text-zinc-500 font-medium">|</span>
                      <span className="font-semibold text-zinc-700 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {t.route}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
                      <span>Cargo: {t.weight}</span>
                      <span>Driver: {t.driver}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                        t.status === "In Transit" 
                          ? "bg-orange-50 border-orange-200 text-orange-700" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="border-y border-zinc-100 bg-zinc-50/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "99.9%", label: "System Uptime" },
              { num: "₹0.00", label: "Hidden Cost Variance" },
              { num: "4 Roles", label: "Tailored Interfaces" },
              { num: "100%", label: "Server-side Security" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950">{stat.num}</div>
                <div className="text-sm font-semibold text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              One Unified Interface. Four Strategic Roles.
            </h2>
            <p className="mt-4 text-zinc-650 text-base leading-relaxed">
              TransitOps splits security and workflows based on strict system roles, ensuring each team member focuses on their exact core operational scope.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="h-6 w-6 text-zinc-900" />,
                title: "Fleet Management",
                role: "Fleet Manager",
                desc: "Register trucks, tracking cargo caps, odometer readings, and asset acquisition costs."
              },
              {
                icon: <Layers className="h-6 w-6 text-zinc-900" />,
                title: "Dispatch Lifecycle",
                role: "Dispatcher",
                desc: "Build trip drafts, automatically filter available drivers/vehicles, and execute dispatches."
              },
              {
                icon: <UserCheck className="h-6 w-6 text-zinc-900" />,
                title: "Driver Compliance",
                role: "Safety Officer",
                desc: "Monitor license expiration dates, duty statuses, safety logs, and driver phone details."
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-zinc-900" />,
                title: "Expenses & ROI",
                role: "Financial Analyst",
                desc: "Record fuel purchases, track tolls, audit operational cost metrics, and adjust settings."
              }
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-zinc-50 flex items-center justify-center mb-5 group-hover:bg-zinc-100 transition-colors">
                  {f.icon}
                </div>
                <div className="inline-block text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded mb-2.5">
                  {f.role}
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Matrix Table */}
      <section className="bg-zinc-50/50 py-20 lg:py-24 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Role Permission Matrix</h2>
            <p className="mt-3 text-zinc-600 text-sm">
              TransitOps enforces authorization rules on the server side using the user session.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Feature Module</th>
                    <th className="px-6 py-4">Fleet Manager</th>
                    <th className="px-6 py-4">Dispatcher</th>
                    <th className="px-6 py-4">Safety Officer</th>
                    <th className="px-6 py-4">Financial Analyst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {[
                    { module: "Register Vehicles", fm: "Write", dp: "Read Only", so: "Read Only", fa: "Read Only" },
                    { module: "Manage Drivers", fm: "Read Only", dp: "Read Only", so: "Write", fa: "Read Only" },
                    { module: "Dispatch Operations", fm: "Read Only", dp: "Write", so: "Read Only", fa: "Read Only" },
                    { module: "Service & Repairs", fm: "Write", dp: "Read Only", so: "Read Only", fa: "Read Only" },
                    { module: "Fuel & Expenses", fm: "Read Only", dp: "Read Only", so: "Read Only", fa: "Write" },
                    { module: "ROI & Analytics", fm: "Read Only", dp: "Read Only", so: "Read Only", fa: "Write" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-zinc-900">{row.module}</td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${row.fm === "Write" ? "bg-orange-50 text-orange-700 border border-orange-100" : "text-zinc-500"}`}>{row.fm}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${row.dp === "Write" ? "bg-orange-50 text-orange-700 border border-orange-100" : "text-zinc-500"}`}>{row.dp}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${row.so === "Write" ? "bg-orange-50 text-orange-700 border border-orange-100" : "text-zinc-500"}`}>{row.so}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${row.fa === "Write" ? "bg-orange-50 text-orange-700 border border-orange-100" : "text-zinc-500"}`}>{row.fa}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Dispatch Lifecycle Flow Chart */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight mb-4">The Dispatch Lifecycle</h2>
          <p className="text-zinc-600 text-sm max-w-xl mx-auto mb-12">
            Every dispatch lifecycle updates database states inside a single robust database transaction, eliminating partial writes and state rot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4 text-left sm:text-center">
            {[
              { step: "1", title: "Create Draft", desc: "Enter route, cargo weight & details" },
              { step: "2", title: "Validate Pool", desc: "Assign available truck & driver" },
              { step: "3", title: "Dispatch Active", desc: "Vehicle & driver status flipped to On Trip" },
              { step: "4", title: "Log Execution", desc: "Add fuel purchases and expenses" },
              { step: "5", title: "Close & Settle", desc: "Revert asset status back to Available" }
            ].map((s, i) => (
              <div key={i} className="flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 relative">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-sm relative z-10 border-4 border-white">
                    {s.step}
                  </div>
                  {i < 4 && (
                    <div className="hidden sm:block absolute top-5 left-[50%] right-[-50%] h-[2px] bg-zinc-200 -z-0" />
                  )}
                </div>
                <div className="mt-0 sm:mt-4">
                  <h4 className="font-bold text-zinc-900 text-sm">{s.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section className="bg-zinc-950 text-white py-16 lg:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to optimize your transport network?</h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create an account or sign in to start logistics operations immediately. Tailor your views and build a clean, trackable transport workflow today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto rounded-md bg-white hover:bg-zinc-100 text-zinc-950 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto rounded-md border border-zinc-700 bg-transparent hover:bg-zinc-900 text-white px-6 py-3 text-sm font-bold transition-colors cursor-pointer"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-100 bg-white py-8 text-center text-xs font-semibold text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>&copy; 2026 TransitOps Platform. Built for Odoo Hackathon 2026.</div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-zinc-650 transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-zinc-650 transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-zinc-650 transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
