# TransitOps — Fleet Dispatch & Operations Control

TransitOps is a premium, real-time fleet operations management and analytics platform. Built with a modern, high-fidelity dark UI and orange accents, it enables fleet managers, dispatchers, safety officers, and financial analysts to monitor utilization, assign trips, track compliance, and manage operating costs.

---

## 🛠️ Technology Stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Authentication** | Better Auth (Email/Password + Drizzle Adapter) |
| **Authorization** | Server-side Role-Based Access Control (RBAC) |
| **Database ORM** | Drizzle ORM |
| **Database** | PostgreSQL (Neon / Local Dev Postgres) |
| **Validation** | Zod schemas |

---

## 🚀 Core Features & Role-Based Workflows

TransitOps uses role-based routing and permissions:
- **Fleet Manager**: Oversees fleet utilization metrics, registers/manages vehicles, opens/closes maintenance logs, and reviews compliance.
- **Dispatcher**: Dispatches trips, pairs available vehicles and drivers, monitors ongoing trips, and handles trip cancellations/completions.
- **Safety Officer**: Manages driver safety records, tracks license expiries, updates safety scores, and monitors driver statuses.
- **Financial Analyst**: Evaluates fleet ROI, fuel expenditure logs, maintenance costs, and general operating expenses.

---

## ⚙️ Key Business & Operational Rules

- **Vehicle Registrations**: Registration numbers are unique and server-side validated.
- **Capacity Enforcement**: Cargo weight must not exceed the selected vehicle's cargo capacity limit (validated at the API layer).
- **Dispatch Pool Filter**: Retired or in-shop vehicles and suspended or expired-license drivers are automatically excluded from the dispatch pool.
- **Atomic Transactions**: 
  - *Dispatching*: Flips both the driver and vehicle status to `on_trip` in a single transaction.
  - *Completion*: Flips both the driver and vehicle back to `available` in a single transaction.
  - *Cancellation*: Reverts both the driver and vehicle to `available` safely behind a confirmation dialog.
  - *Maintenance*: Opens a log and puts the vehicle `in_shop` instantly. Closing maintenance returns the vehicle to `available` (unless retired).
- **Operational Cost calculation**: Sum of Fuel Logs + Maintenance Logs (Excludes Toll/Other Expenses to avoid double counting).
- **Utilization & ROI**: Active Fleet = Total Fleet - Retired Fleet. Revenue = sum of (completed trip distance × rate per km).

---

## 🔑 Default Login Credentials

Use the following quick-login test accounts on the login screen:

*   **Password**: `Password123` (applies to all accounts)

| Role | Email Address |
|---|---|
| **Fleet Manager** | `manager@transitops.com` |
| **Dispatcher** | `dispatcher@transitops.com` |
| **Safety Officer** | `safety@transitops.com` |
| **Financial Analyst** | `finance@transitops.com` |

---

## 💻 Commands and Local Setup

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
BETTER_AUTH_SECRET="your_better_auth_secret_key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Push & Seeding
Push the database schema to your database instance:
```bash
npm run db:push
```

Seed the database with realistic fleet, driver, trip, maintenance, and expense datasets:
```bash
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build Verification
To verify the application for production deployment:
```bash
npm run build
```
This builds an optimized output with full type check compliance.
