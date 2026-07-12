import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate payload with Zod
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    // 2. Check if email already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(userTable.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 3. Call better-auth api to sign up the user
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role, // Passed as additionalField
      },
      headers: await headers(),
      asResponse: true,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
