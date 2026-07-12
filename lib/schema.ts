import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  date,
  uniqueIndex,
  index,
  check,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- Enums ----------

export const roleEnum = pgEnum("role", [
  "fleet_manager",
  "dispatcher",
  "safety_officer",
  "financial_analyst",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "on_trip",
  "in_shop",
  "retired",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "truck",
  "van",
  "bike",
  "mini_truck",
  "pickup",
  "other",
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "available",
  "on_trip",
  "off_duty",
  "suspended",
]);

export const tripStatusEnum = pgEnum("trip_status", [
  "draft",
  "dispatched",
  "completed",
  "cancelled",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "open",
  "completed",
]);

export const expenseTypeEnum = pgEnum("expense_type", ["toll", "other"]);

export const documentTypeEnum = pgEnum("document_type", [
  "insurance",
  "fitness",
  "rc",
  "pollution",
  "other",
]);

// ---------- Users ----------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("users_email_unique_idx").on(table.email),
]);

// ---------- Vehicles ----------

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationNumber: text("registration_number").notNull(),
  name: text("name").notNull(),
  type: vehicleTypeEnum("type").notNull(),
  capacityKg: numeric("capacity_kg", { precision: 10, scale: 2 }).notNull(),
  odometerKm: numeric("odometer_km", { precision: 10, scale: 2 }).notNull().default("0"),
  acquisitionCost: numeric("acquisition_cost", { precision: 12, scale: 2 }).notNull(),
  status: vehicleStatusEnum("status").notNull().default("available"),
  region: text("region"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("vehicles_registration_number_unique_idx").on(table.registrationNumber),
  index("vehicles_status_idx").on(table.status),
  check("vehicles_capacity_positive", sql`${table.capacityKg} > 0`),
  check("vehicles_odometer_positive", sql`${table.odometerKm} >= 0`),
  check("vehicles_cost_positive", sql`${table.acquisitionCost} >= 0`),
]);

// ---------- Drivers ----------

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  licenseCategory: text("license_category").notNull(),
  licenseExpiry: date("license_expiry").notNull(),
  phone: text("phone").notNull(),
  safetyScore: integer("safety_score").notNull().default(100),
  status: driverStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("drivers_license_number_unique_idx").on(table.licenseNumber),
  index("drivers_status_idx").on(table.status),
  check("drivers_safety_score_valid", sql`${table.safetyScore} BETWEEN 0 AND 100`),
]);

// ---------- Trips ----------

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripNumber: serial("trip_number").notNull(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  cargoWeightKg: numeric("cargo_weight_kg", { precision: 10, scale: 2 }).notNull(),
  plannedDistanceKm: numeric("planned_distance_km", { precision: 10, scale: 2 }).notNull(),
  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  status: tripStatusEnum("status").notNull().default("draft"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "restrict" }),
  driverId: uuid("driver_id").references(() => drivers.id, { onDelete: "restrict" }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  finalOdometerKm: numeric("final_odometer_km", { precision: 10, scale: 2 }),
  fuelConsumedLiters: numeric("fuel_consumed_liters", { precision: 10, scale: 2 }),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("trips_status_idx").on(table.status),
  index("trips_vehicle_id_idx").on(table.vehicleId),
  index("trips_driver_id_idx").on(table.driverId),
  check(
    "trips_vehicle_driver_required_once_active",
    sql`(${table.status} NOT IN ('dispatched', 'completed')) OR (${table.vehicleId} IS NOT NULL AND ${table.driverId} IS NOT NULL)`
  ),
  uniqueIndex("trips_one_dispatched_per_vehicle_idx")
    .on(table.vehicleId)
    .where(sql`${table.status} = 'dispatched'`),
  uniqueIndex("trips_one_dispatched_per_driver_idx")
    .on(table.driverId)
    .where(sql`${table.status} = 'dispatched'`),
  check("trips_cargo_weight_positive", sql`${table.cargoWeightKg} >= 0`),
  check("trips_planned_distance_positive", sql`${table.plannedDistanceKm} >= 0`),
  check("trips_revenue_positive", sql`${table.revenue} >= 0`),
]);

// ---------- Maintenance Logs ----------

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "restrict" }),
  serviceType: text("service_type").notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  status: maintenanceStatusEnum("status").notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  index("maintenance_logs_vehicle_id_idx").on(table.vehicleId),
  index("maintenance_logs_status_idx").on(table.status),
  uniqueIndex("maintenance_one_open_per_vehicle_idx")
    .on(table.vehicleId)
    .where(sql`${table.status} = 'open'`),
  check("maintenance_cost_positive", sql`${table.cost} >= 0`),
]);

// ---------- Fuel Logs ----------

export const fuelLogs = pgTable("fuel_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "restrict" }),
  tripId: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
  liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
}, (table) => [
  index("fuel_logs_vehicle_id_idx").on(table.vehicleId),
  index("fuel_logs_trip_id_idx").on(table.tripId),
  check("fuel_liters_positive", sql`${table.liters} >= 0`),
  check("fuel_cost_positive", sql`${table.cost} >= 0`),
]);

// ---------- Expenses (Toll / Other only — see DECISIONS.md) ----------

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "restrict" }),
  tripId: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
  type: expenseTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
}, (table) => [
  index("expenses_vehicle_id_idx").on(table.vehicleId),
  index("expenses_trip_id_idx").on(table.tripId),
  check("expense_amount_positive", sql`${table.amount} >= 0`),
]);

// ---------- Notifications ----------

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_is_read_idx").on(table.isRead),
]);

// ---------- Vehicle Documents ----------

export const vehicleDocuments = pgTable("vehicle_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(),
  expiryDate: date("expiry_date").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("vehicle_documents_vehicle_id_idx").on(table.vehicleId),
]);

// ---------- Settings (singleton row) ----------

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  depotName: text("depot_name").notNull().default("Main Depot"),
  currency: text("currency").notNull().default("INR"),
  distanceUnit: text("distance_unit").notNull().default("km"),
  ratePerKm: numeric("rate_per_km", { precision: 10, scale: 2 }).notNull().default("0"),
  avgSpeedKmph: numeric("avg_speed_kmph", { precision: 6, scale: 2 }).notNull().default("40"),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  check("settings_rate_positive", sql`${table.ratePerKm} >= 0`),
  check("settings_speed_positive", sql`${table.avgSpeedKmph} >= 0`),
]);

// ---------- Relations (for Drizzle's relational query API) ----------

export const usersRelations = relations(users, ({ many }) => ({
  notifications: many(notifications),
  updatedSettings: many(settings),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  trips: many(trips),
  maintenanceLogs: many(maintenanceLogs),
  fuelLogs: many(fuelLogs),
  expenses: many(expenses),
  documents: many(vehicleDocuments),
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  vehicle: one(vehicles, { fields: [trips.vehicleId], references: [vehicles.id] }),
  driver: one(drivers, { fields: [trips.driverId], references: [drivers.id] }),
  fuelLogs: many(fuelLogs),
}));

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  vehicle: one(vehicles, { fields: [maintenanceLogs.vehicleId], references: [vehicles.id] }),
}));

export const fuelLogsRelations = relations(fuelLogs, ({ one }) => ({
  vehicle: one(vehicles, { fields: [fuelLogs.vehicleId], references: [vehicles.id] }),
  trip: one(trips, { fields: [fuelLogs.tripId], references: [trips.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  vehicle: one(vehicles, { fields: [expenses.vehicleId], references: [vehicles.id] }),
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const vehicleDocumentsRelations = relations(vehicleDocuments, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleDocuments.vehicleId], references: [vehicles.id] }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  updatedByUser: one(users, { fields: [settings.updatedBy], references: [users.id] }),
}));
