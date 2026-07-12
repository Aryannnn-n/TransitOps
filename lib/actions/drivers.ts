"use server";

import { db } from "@/lib/db";
import { drivers } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid license expiry date",
  }),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  safetyScore: z
    .number()
    .min(0, "Safety score must be at least 0")
    .max(100, "Safety score cannot exceed 100"),
});

export async function createDriver(data: any) {
  // 1. Authenticate and check role permissions
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  // Fleet Managers and Safety Officers are allowed to manage drivers
  const allowed = session.user.role === "fleet_manager" || session.user.role === "safety_officer";
  if (!allowed) {
    throw new Error("Forbidden: Only Fleet Managers or Safety Officers can register drivers.");
  }

  // 2. Validate payload
  const parsed = createDriverSchema.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    return { error: "Validation failed", fields: errorMap };
  }

  const { licenseNumber } = parsed.data;

  // 3. Server-validate license number uniqueness
  const existing = await db.query.drivers.findFirst({
    where: eq(drivers.licenseNumber, licenseNumber),
  });
  if (existing) {
    return {
      error: "A driver with this license number is already registered.",
      fields: { licenseNumber: ["Must be unique"] },
    };
  }

  try {
    await db.insert(drivers).values({
      ...parsed.data,
      status: "available",
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create driver" };
  }
}

export async function updateDriverStatus(driverId: string, status: "available" | "off_duty" | "suspended" | "on_trip") {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const allowed = session.user.role === "fleet_manager" || session.user.role === "safety_officer";
  if (!allowed) {
    return { error: "Forbidden: Only Fleet Managers or Safety Officers can update driver status." };
  }

  try {
    await db.update(drivers).set({ status }).where(eq(drivers.id, driverId));
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update driver status" };
  }
}
