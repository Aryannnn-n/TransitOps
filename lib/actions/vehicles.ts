"use server";

import { db } from "@/lib/db";
import { vehicles } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["truck", "van", "bike", "mini_truck", "pickup", "other"]),
  capacityKg: z.number().positive("Capacity must be positive"),
  odometerKm: z.number().nonnegative("Odometer reading cannot be negative"),
  acquisitionCost: z.number().nonnegative("Acquisition cost cannot be negative"),
  region: z.string().nullable().optional(),
});

export async function createVehicle(data: any) {
  // 1. Authenticate and check role permissions
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "fleet_manager") {
    throw new Error("Forbidden: Only Fleet Managers can register vehicles.");
  }

  // 2. Validate payload
  const parsed = createVehicleSchema.safeParse(data);
  if (!parsed.success) {
    const errorMap = parsed.error.flatten().fieldErrors;
    return { error: "Validation failed", fields: errorMap };
  }

  const { registrationNumber } = parsed.data;

  // 3. Server-validate registration number uniqueness
  const existing = await db.query.vehicles.findFirst({
    where: eq(vehicles.registrationNumber, registrationNumber),
  });
  if (existing) {
    return {
      error: "A vehicle with this registration number is already registered.",
      fields: { registrationNumber: ["Must be unique"] },
    };
  }

  try {
    await db.insert(vehicles).values({
      ...parsed.data,
      capacityKg: parsed.data.capacityKg.toString(),
      odometerKm: parsed.data.odometerKm.toString(),
      acquisitionCost: parsed.data.acquisitionCost.toString(),
      status: "available",
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create vehicle" };
  }
}
