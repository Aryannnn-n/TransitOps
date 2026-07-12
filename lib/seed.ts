import { db } from "./db";
import { vehicles, drivers, settings } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data (in correct order due to foreign keys)
  await db.execute(
    sql`TRUNCATE TABLE "verification", "session", "account", "settings", "notifications", "vehicle_documents", "expenses", "fuel_logs", "maintenance_logs", "trips", "drivers", "vehicles", "user" CASCADE;`
  );

  // 2. Seed a Settings row (singleton)
  await db.insert(settings).values({
    depotName: "Main Depot",
    currency: "INR",
    distanceUnit: "km",
    ratePerKm: "15.00",
    avgSpeedKmph: "45.00",
  });

  // 3. Seed Vehicles
  await db.insert(vehicles).values([
    {
      registrationNumber: "MH12AB1234",
      name: "Tata Prima Truck",
      type: "truck",
      capacityKg: "15000",
      odometerKm: "50000",
      acquisitionCost: "3500000",
      status: "available",
      region: "West",
    },
    {
      registrationNumber: "DL01XY9876",
      name: "Mahindra Bolero Pickup",
      type: "pickup",
      capacityKg: "1500",
      odometerKm: "12000",
      acquisitionCost: "850000",
      status: "available",
      region: "North",
    },
    {
      registrationNumber: "KA03MM4567",
      name: "Maruti Suzuki Super Carry",
      type: "mini_truck",
      capacityKg: "800",
      odometerKm: "8000",
      acquisitionCost: "600000",
      status: "in_shop",
      region: "South",
    },
    {
      registrationNumber: "MH14ZZ9999",
      name: "Scania Heavy Hauler",
      type: "truck",
      capacityKg: "25000",
      odometerKm: "150000",
      acquisitionCost: "8000000",
      status: "retired",
      region: "West",
    },
  ]);

  // 4. Seed Drivers
  await db.insert(drivers).values([
    {
      name: "Rajesh Kumar",
      licenseNumber: "DL-12345678901",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2030-12-31",
      phone: "+919876543210",
      safetyScore: 92,
      status: "available",
    },
    {
      name: "Amit Sharma",
      licenseNumber: "MH-98765432102",
      licenseCategory: "Medium Commercial",
      licenseExpiry: "2029-06-15",
      phone: "+919876543211",
      safetyScore: 85,
      status: "available",
    },
    {
      name: "Sunil Verma",
      licenseNumber: "KA-45678901234",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2024-05-20",
      phone: "+919876543212",
      safetyScore: 78,
      status: "suspended",
    },
    {
      name: "Vikram Singh",
      licenseNumber: "UP-78901234567",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2032-10-10",
      phone: "+919876543213",
      safetyScore: 98,
      status: "off_duty",
    },
  ]);

  console.log("Database seeded successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
