import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/schema";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const settingsUpdateSchema = z.object({
  depotName: z.string().min(1, "Depot name is required"),
  currency: z.string().min(1, "Currency is required"),
  distanceUnit: z.string().min(1, "Distance unit is required"),
  ratePerKm: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Rate per km must be a non-negative number",
  }),
  avgSpeedKmph: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Average speed must be a non-negative number",
  }),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await db.query.settings.findFirst();
    return NextResponse.json(config || null);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate session
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Enforce RBAC (Financial Analyst only)
    if (session.user.role !== "financial_analyst") {
      return NextResponse.json({ error: "Forbidden: Financial Analyst only" }, { status: 403 });
    }

    const body = await req.json();

    // 3. Validate with Zod
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { depotName, currency, distanceUnit, ratePerKm, avgSpeedKmph } = parsed.data;

    // 4. Update or insert the singleton record
    const config = await db.query.settings.findFirst();
    if (config) {
      await db
        .update(settingsTable)
        .set({
          depotName,
          currency,
          distanceUnit,
          ratePerKm,
          avgSpeedKmph,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, config.id));
    } else {
      await db.insert(settingsTable).values({
        depotName,
        currency,
        distanceUnit,
        ratePerKm,
        avgSpeedKmph,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
