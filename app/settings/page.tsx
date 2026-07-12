import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const config = await db.query.settings.findFirst();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Settings & Profile</h2>
          <p className="text-xs text-zinc-655 mt-0.5 font-medium">Manage operational pricing parameters and view your system roles.</p>
        </div>
        <div className="text-xs text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Settings</span>
        </div>
      </div>

      {/* User Profile Card */}
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">User Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Full Name</div>
            <div className="text-zinc-900 font-bold">{session.user.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</div>
            <div className="text-zinc-900 font-bold">{session.user.email}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assigned Role</div>
            <div className="text-zinc-900 font-bold capitalize">{session.user.role.replace("_", " ")}</div>
          </div>
        </div>
      </section>

      <div className="border-t border-zinc-200 pt-6">
        <SettingsForm 
          initialSettings={config || null} 
          userRole={session.user.role} 
        />
      </div>

    </div>
  );
}
