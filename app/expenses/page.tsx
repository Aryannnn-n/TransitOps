import { db } from "@/lib/db";
import { fuelLogs, expenses, maintenanceLogs, vehicles, trips } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { ExpensesPageWrapper } from "@/components/ExpensesPageWrapper";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Database Aggregations for Totals
  const fuelSumRow = await db
    .select({ sum: sql<string>`sum(${fuelLogs.cost})` })
    .from(fuelLogs);
  const totalFuelCost = parseFloat(fuelSumRow[0]?.sum || "0");

  const maintenanceSumRow = await db
    .select({ sum: sql<string>`sum(${maintenanceLogs.cost})` })
    .from(maintenanceLogs);
  const totalMaintenanceCost = parseFloat(maintenanceSumRow[0]?.sum || "0");

  const expenseSumRow = await db
    .select({ sum: sql<string>`sum(${expenses.amount})` })
    .from(expenses);
  const totalGeneralExpenses = parseFloat(expenseSumRow[0]?.sum || "0");

  const operationalCost = totalFuelCost + totalMaintenanceCost;

  // 2. Fetch Fuel logs list
  const fuelList = await db
    .select({
      id: fuelLogs.id,
      liters: fuelLogs.liters,
      cost: fuelLogs.cost,
      date: fuelLogs.date,
      vehicleReg: vehicles.registrationNumber,
      tripNumber: trips.tripNumber,
    })
    .from(fuelLogs)
    .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
    .leftJoin(trips, eq(fuelLogs.tripId, trips.id))
    .orderBy(fuelLogs.date);

  // 3. Fetch Expenses list
  const expensesList = await db
    .select({
      id: expenses.id,
      type: expenses.type,
      amount: expenses.amount,
      date: expenses.date,
      vehicleReg: vehicles.registrationNumber,
      tripNumber: trips.tripNumber,
    })
    .from(expenses)
    .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
    .leftJoin(trips, eq(expenses.tripId, trips.id))
    .orderBy(expenses.date);

  // 4. Fetch select options
  const vehiclesList = await db
    .select({
      id: vehicles.id,
      registrationNumber: vehicles.registrationNumber,
      name: vehicles.name,
    })
    .from(vehicles);

  const tripsList = await db
    .select({
      id: trips.id,
      tripNumber: trips.tripNumber,
      source: trips.source,
      destination: trips.destination,
    })
    .from(trips);

  const isAnalyst = session.user.role === "financial_analyst";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-display">Fuel & Expense Operations</h2>
          <p className="text-sm text-zinc-700 font-medium">Log fuel fillings and general operational expenses to audit total cost of ownership.</p>
        </div>
        <div className="text-sm text-zinc-700 font-medium">
          <Link href="/" className="hover:text-zinc-900 font-semibold underline">Dashboard</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="font-semibold text-zinc-900">Expenses</span>
        </div>
      </div>

      {/* Main Expenses Page Wrapper */}
      <ExpensesPageWrapper 
        fuelList={fuelList}
        expensesList={expensesList}
        vehiclesList={vehiclesList}
        tripsList={tripsList}
        totals={{
          totalFuelCost,
          totalMaintenanceCost,
          operationalCost,
          totalGeneralExpenses,
        }}
        isAnalyst={isAnalyst}
      />

    </div>
  );
}
