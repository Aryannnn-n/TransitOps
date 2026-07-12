"use client";

import { authClient } from "@/lib/auth-client";
import { Search, UserCheck } from "lucide-react";

export function Navbar() {
  const { data: session } = authClient.useSession();

  if (!session) return null;
  const user = session.user;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0">
      
      {/* Left: Search Bar */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search vehicles, shipments, logs..."
          className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
        />
      </div>

      {/* Right: Role & Profile Avatar */}
      <div className="flex items-center gap-3">
        
        {/* Role display */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold">
          <UserCheck className="h-3.5 w-3.5 text-zinc-500" />
          <span className="capitalize">{user.role.replace("_", " ")}</span>
        </div>

        {/* Profile Avatar */}
        <div className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-sm select-none">
          {initials || "U"}
        </div>

      </div>

    </header>
  );
}
