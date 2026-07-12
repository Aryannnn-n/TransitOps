"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Wrench, 
  Coins, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  LogOut,
  Navigation
} from "lucide-react";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) return null;
  const user = session.user;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vehicles", label: "Fleet", icon: Truck },
    { href: "/drivers", label: "Drivers", icon: Users },
    { href: "/trips", label: "Trips", icon: Navigation },
    { href: "/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/expenses", label: "Fuel & Expenses", icon: Coins },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between p-5 shrink-0 z-20">
      <div className="space-y-6">
        
        {/* Logo/Brand header */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 font-display">TransitOps</h1>
            <p className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Fleet Logi-SaaS</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check if active: exact match or start match (except for dashboard '/')
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-md transition-all duration-150 ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile / session block */}
      <div className="border-t border-zinc-200 pt-4 space-y-3">
        <div className="px-2 space-y-1">
          <div className="text-sm font-bold text-zinc-900 truncate">{user.name}</div>
          <div className="text-sm text-zinc-600 truncate mb-1.5 font-medium">{user.email}</div>
          <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-1 text-sm font-bold text-zinc-800 border border-zinc-200 capitalize">
            {user.role.replace("_", " ")}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
