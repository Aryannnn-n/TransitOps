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
    <div>
      {/* Real query aggregated totals */}
      <section style={{ border: "1px solid black", padding: "10px", margin: "10px 0" }}>
        <h3>Financial Summary (Totals)</h3>
        <ul>
          <li>
            <strong>Total Fuel Cost:</strong> INR {totals.totalFuelCost.toLocaleString()}
          </li>
          <li>
            <strong>Total Maintenance Cost:</strong> INR {totals.totalMaintenanceCost.toLocaleString()}
          </li>
          <li>
            <strong>Operational Cost (Fuel + Maintenance only):</strong>{" "}
            <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
              INR {totals.operationalCost.toLocaleString()}
            </span>
          </li>
          <li>
            <strong>Total General Expenses (Toll / Other):</strong> INR{" "}
            {totals.totalGeneralExpenses.toLocaleString()}
          </li>
        </ul>
        <small style={{ color: "gray" }}>
          * Operational Cost strictly sums Fuel + Maintenance and excludes general expenses (Toll/Other)
          to prevent double-counting.
        </small>
      </section>

      <hr />

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Fuel Logs list */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3>Fuel Purchase Log</h3>
          {fuelList.length === 0 ? (
            <p>No fuel purchases logged yet.</p>
          ) : (
            <table border={1}>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trip #</th>
                  <th>Quantity (L)</th>
                  <th>Cost (INR)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelList.map((f) => (
                  <tr key={f.id}>
                    <td>{f.vehicleReg || "—"}</td>
                    <td>{f.tripNumber ? `Trip #${f.tripNumber}` : "—"}</td>
                    <td>{parseFloat(f.liters).toLocaleString()} L</td>
                    <td>{parseFloat(f.cost).toLocaleString()}</td>
                    <td>{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expenses list */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3>Trip Expenses (Toll & Other)</h3>
          {expensesList.length === 0 ? (
            <p>No trip expenses logged yet.</p>
          ) : (
            <table border={1}>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trip #</th>
                  <th>Category</th>
                  <th>Amount (INR)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expensesList.map((e) => (
                  <tr key={e.id}>
                    <td>{e.vehicleReg || "—"}</td>
                    <td>{e.tripNumber ? `Trip #${e.tripNumber}` : "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{e.type}</td>
                    <td>{parseFloat(e.amount).toLocaleString()}</td>
                    <td>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
