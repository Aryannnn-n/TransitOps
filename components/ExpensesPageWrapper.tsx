"use client";

import { useState } from "react";
import { CreateFuelLogForm } from "@/components/CreateFuelLogForm";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";
import { Loader2, Plus, X } from "lucide-react";

interface FuelItem {
  id: string;
  liters: string;
  cost: string;
  date: string;
  vehicleReg: string | null;
  tripNumber: number | null;
}

interface ExpenseItem {
  id: string;
  type: string;
  amount: string;
  date: string;
  vehicleReg: string | null;
  tripNumber: number | null;
}

interface TotalsInfo {
  totalFuelCost: number;
  totalMaintenanceCost: number;
  operationalCost: number;
  totalGeneralExpenses: number;
}

interface VehicleOption {
  id: string;
  registrationNumber: string;
  name: string;
}

interface TripOption {
  id: string;
  tripNumber: number;
  source: string;
  destination: string;
}

interface ExpensesPageWrapperProps {
  fuelList: FuelItem[];
  expensesList: ExpenseItem[];
  vehiclesList: VehicleOption[];
  tripsList: TripOption[];
  totals: TotalsInfo;
  isAnalyst: boolean;
}

export function ExpensesPageWrapper({
  fuelList,
  expensesList,
  vehiclesList,
  tripsList,
  totals,
  isAnalyst,
}: ExpensesPageWrapperProps) {
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <div className="space-y-8 text-zinc-900">
      
      {/* Top right Buttons (Only shown if user is analyst) */}
      <div className="flex justify-end gap-3">
        {isAnalyst ? (
          <>
            <button
              onClick={() => {
                setShowFuelForm(!showFuelForm);
                setShowExpenseForm(false);
              }}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {showFuelForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{showFuelForm ? "Close Form" : "Log Fuel"}</span>
            </button>
            <button
              onClick={() => {
                setShowExpenseForm(!showExpenseForm);
                setShowFuelForm(false);
              }}
              className="rounded-md bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {showExpenseForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{showExpenseForm ? "Close Form" : "Add Expense"}</span>
            </button>
          </>
        ) : (
          <div className="text-sm text-zinc-700 font-semibold bg-zinc-150 px-3 py-1.5 rounded border border-zinc-200">
            * Fuel log entries and trip expense records are restricted to Financial Analysts.
          </div>
        )}
      </div>

      {/* Collapsible Forms */}
      {showFuelForm && isAnalyst && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm max-w-2xl relative">
          <button 
            onClick={() => setShowFuelForm(false)} 
            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
          <CreateFuelLogForm vehiclesList={vehiclesList} tripsList={tripsList} />
        </div>
      )}

      {showExpenseForm && isAnalyst && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm max-w-2xl relative">
          <button 
            onClick={() => setShowExpenseForm(false)} 
            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
          <CreateExpenseForm vehiclesList={vehiclesList} tripsList={tripsList} />
        </div>
      )}

      {/* Stacked Tables */}
      <div className="space-y-8">
        
        {/* Table 1: FUEL LOGS */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Fuel Logs</h3>
          {fuelList.length === 0 ? (
            <div className="text-center py-8 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-700 font-semibold">
              No fuel purchase logs found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                    <th className="px-6 py-3.5">Vehicle Reg</th>
                    <th className="px-6 py-3.5">Trip</th>
                    <th className="px-6 py-3.5 text-right">Quantity (Liters)</th>
                    <th className="px-6 py-3.5 text-right">Cost</th>
                    <th className="px-6 py-3.5">Filling Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {fuelList.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-zinc-900">{f.vehicleReg || "—"}</td>
                      <td className="px-6 py-3.5 font-bold text-zinc-900">
                        {f.tripNumber ? `Trip #${f.tripNumber}` : <span className="text-zinc-400 font-semibold">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">{parseFloat(f.liters).toLocaleString()} L</td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(f.cost).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-zinc-900 font-bold">{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2: OTHER EXPENSES */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Other Expenses (Toll / Misc)</h3>
          {expensesList.length === 0 ? (
            <div className="text-center py-8 border border-zinc-200 rounded-lg bg-zinc-50 text-sm text-zinc-700 font-semibold">
              No trip expenses recorded.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                    <th className="px-6 py-3.5">Vehicle Reg</th>
                    <th className="px-6 py-3.5">Trip</th>
                    <th className="px-6 py-3.5">Expense Type</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5">Logged Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {expensesList.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-zinc-900">{e.vehicleReg || "—"}</td>
                      <td className="px-6 py-3.5 font-bold text-zinc-900">
                        {e.tripNumber ? `Trip #${e.tripNumber}` : <span className="text-zinc-400 font-semibold">—</span>}
                      </td>
                      <td className="px-6 py-3.5 capitalize">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          e.type === "toll" ? "bg-cyan-50 text-cyan-800 border-cyan-200" : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}>
                          {e.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(e.amount).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-zinc-900 font-bold">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Cost Aggregations (Total Operational Cost) */}
      <div className="pt-6 border-t border-zinc-200 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Fuel cost</div>
            <div className="text-xl font-bold text-zinc-900">INR {totals.totalFuelCost.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
            <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Maintenance cost</div>
            <div className="text-xl font-bold text-zinc-900">INR {totals.totalMaintenanceCost.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-zinc-900 bg-white p-5 shadow-sm space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-zinc-900"></div>
            <div className="pl-2 space-y-1">
              <div className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Total Operational Cost (Auto)</div>
              <div className="text-xl font-bold text-zinc-900 font-display">INR {totals.operationalCost.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-700 font-semibold">* Calculation: Fuel + Maintenance ONLY</div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-700 font-semibold leading-relaxed">
          * Operational Cost Formula rule: <strong>Fuel Logs + Maintenance Logs</strong> only. Other general trip expenses (Toll/Misc) are logged separately and never factored into operational cost.
        </p>

      </div>

    </div>
  );
}
