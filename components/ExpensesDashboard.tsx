"use client";

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

interface ExpensesDashboardProps {
  fuelList: FuelItem[];
  expensesList: ExpenseItem[];
  totals: TotalsInfo;
}

export function ExpensesDashboard({ fuelList, expensesList, totals }: ExpensesDashboardProps) {
  return (
    <div className="space-y-8">
      
      {/* Financial Summary */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Financial Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Fuel */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Fuel Cost</div>
            <div className="text-2xl font-bold text-zinc-900">INR {totals.totalFuelCost.toLocaleString()}</div>
          </div>

          {/* Card 2: Total Maintenance */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Maintenance Cost</div>
            <div className="text-2xl font-bold text-zinc-900">INR {totals.totalMaintenanceCost.toLocaleString()}</div>
          </div>

          {/* Card 3: Operational Cost */}
          <div className="rounded-lg border border-zinc-900 bg-white p-5 shadow-sm space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-zinc-900"></div>
            <div className="pl-1 space-y-1">
              <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Operational Cost</div>
              <div className="text-2xl font-bold text-zinc-900 font-display">INR {totals.operationalCost.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 leading-tight font-medium">* Fuel + Maintenance only</div>
            </div>
          </div>

          {/* Card 4: General Expenses */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">General Expenses</div>
            <div className="text-2xl font-bold text-zinc-900">INR {totals.totalGeneralExpenses.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 leading-tight font-medium">Tolls & other trip costs</div>
          </div>

        </div>
        
        <p className="text-[10px] text-zinc-500 font-medium">
          * Note: Operational Cost strictly sums Fuel + Maintenance and excludes general expenses (Toll/Other) to prevent double-counting.
        </p>
      </section>

      {/* Side-by-side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Fuel Purchase Log */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Fuel Purchase Log</h3>
          {fuelList.length === 0 ? (
            <div className="text-center py-10 border border-zinc-200 rounded-lg bg-zinc-50 text-xs text-zinc-700 font-semibold">
              No fuel purchases logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Trip #</th>
                    <th className="px-6 py-3.5 text-right">Quantity</th>
                    <th className="px-6 py-3.5 text-right">Cost</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {fuelList.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-zinc-900">{f.vehicleReg || "—"}</td>
                      <td className="px-6 py-3.5 font-semibold text-zinc-900">
                        {f.tripNumber ? `Trip #${f.tripNumber}` : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-right text-zinc-750 font-semibold">{parseFloat(f.liters).toLocaleString()} L</td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(f.cost).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-zinc-700 font-medium">{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Trip Expenses (Tolls & Other)</h3>
          {expensesList.length === 0 ? (
            <div className="text-center py-10 border border-zinc-200 rounded-lg bg-zinc-50 text-xs text-zinc-700 font-semibold">
              No trip expenses logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-50/50">
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Trip #</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {expensesList.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-zinc-900">{e.vehicleReg || "—"}</td>
                      <td className="px-6 py-3.5 font-semibold text-zinc-900">
                        {e.tripNumber ? `Trip #${e.tripNumber}` : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-6 py-3.5 capitalize">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          e.type === "toll" ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          {e.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-zinc-900 font-bold">INR {parseFloat(e.amount).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-zinc-700 font-medium">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
