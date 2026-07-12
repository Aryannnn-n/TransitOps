import { getServerSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { ShieldCheck, User, Mail, UserCheck } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  // Guard: If no session, redirect to login (middleware also does this, but server-side checks are good practice)
  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 p-6 sm:p-10 relative overflow-hidden">
      {/* Background blurs for premium look */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="flex w-full items-center justify-between border-b border-zinc-800 pb-5 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-50">TransitOps</h1>
            <p className="text-xs text-zinc-500">Dashboard Skeleton</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* Main Skeleton Content */}
      <main className="flex-1 w-full flex flex-col gap-6 py-8 z-10">
        {/* User Card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-6 max-w-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Active Session Credentials
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-200">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm text-zinc-400">{user.name}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-zinc-400">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <UserCheck className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Role:</span>
              <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-500/20 capitalize">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </section>

        {/* Operational Flow Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">Fleet Management</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Monitor vehicle availability, maintenance, and driver assignments.
              </p>
            </div>
            <div className="h-2 w-1/3 bg-zinc-800 rounded-full animate-pulse"></div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">Trip Dispatching</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Initiate and complete dispatch lifecycles under database constraint guards.
              </p>
            </div>
            <div className="h-2 w-1/4 bg-zinc-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
