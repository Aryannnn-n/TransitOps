import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Find user in the database
    const user = await db.query.user.findFirst({
      where: eq(userTable.email, email),
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 2. Check if user is locked out
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json({ 
        error: `Account is locked. Try again in ${minutesLeft} minutes.` 
      }, { status: 403 });
    }

    // 3. Verify selected role matches stored permissions
    if (user.role !== role) {
      return NextResponse.json({ error: "Selected role does not match stored permissions" }, { status: 401 });
    }

    // 4. Try signing in using better-auth api
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: true,
    });

    if (!response.ok) {
      // Authentication failed (e.g. wrong password)
      const newAttempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: newAttempts };

      if (newAttempts >= 5) {
        // Lock for 15 minutes
        updates.lockedUntil = new Date(Date.now() + 15 * 60000);
      }

      await db.update(userTable)
        .set(updates)
        .where(eq(userTable.id, user.id));

      if (newAttempts >= 5) {
        return NextResponse.json({ 
          error: "Too many failed attempts. Account locked for 15 minutes." 
        }, { status: 403 });
      }

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // If successful, reset failed attempts
    await db.update(userTable)
      .set({ failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(userTable.id, user.id));

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
