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
    <div>
      <div>
        <Link href="/">Back to Dashboard</Link>
      </div>

      <h1>Settings & Profile</h1>

      <div>
        <h2>User Profile</h2>
        <p><strong>Name:</strong> {session.user.name}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Role (Display Only):</strong> {session.user.role.replace("_", " ")}</p>
      </div>

      <hr />

      <SettingsForm 
        initialSettings={config || null} 
        userRole={session.user.role} 
      />
    </div>
  );
}
