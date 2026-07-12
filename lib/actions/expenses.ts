"use server";

import { db } from "@/lib/db";
import { fuelLogs, expenses, vehicles, trips } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle selection"),
  tripId: z.string().uuid().nullable().optional(),
  liters: z.number().positive("Liters must be positive"),
  cost: z.number().nonnegative("Cost must be non-negative"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function createFuelLog(data: any) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "financial_analyst") {
    throw new Error("Forbidden: Only Financial Analysts can log fuel transactions.");
  }

  // 2. Validate Payload
  const parsed = createFuelLogSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
  }

  const { vehicleId, tripId, liters, cost, date } = parsed.data;

  // 3. Verify vehicle and trip exist
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, vehicleId),
  });
  if (!dbVehicle) {
    return { error: "Selected vehicle not found." };
  }

  if (tripId) {
    const dbTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });
    if (!dbTrip) {
      return { error: "Selected trip not found." };
    }
  }

  try {
    await db.insert(fuelLogs).values({
      vehicleId,
      tripId: tripId || null,
      liters: liters.toString(),
      cost: cost.toFixed(2),
      date,
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create fuel log." };
  }
}

const createExpenseSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle selection"),
  tripId: z.string().uuid().nullable().optional(),
  type: z.enum(["toll", "other"]),
  amount: z.number().nonnegative("Amount must be non-negative"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function createExpense(data: any) {
  // 1. Authenticate & Authorize
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "financial_analyst") {
    throw new Error("Forbidden: Only Financial Analysts can log general expenses.");
  }

  // 2. Validate Payload
  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", fields: parsed.error.flatten().fieldErrors };
  }

  const { vehicleId, tripId, type, amount, date } = parsed.data;

  // 3. Verify vehicle and trip exist
  const dbVehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, vehicleId),
  });
  if (!dbVehicle) {
    return { error: "Selected vehicle not found." };
  }

  if (tripId) {
    const dbTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });
    if (!dbTrip) {
      return { error: "Selected trip not found." };
    }
  }

  try {
    await db.insert(expenses).values({
      vehicleId,
      tripId: tripId || null,
      type,
      amount: amount.toFixed(2),
      date,
    });
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to create expense." };
  }
}
