import fs from "fs";
import path from "path";

// 1. Manually load .env file if DATABASE_URL is not set (runs before other imports)
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, "utf-8");
      envFile.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            const val = trimmed.slice(firstEqual + 1).trim().replace(/^['"]|['"]$/g, "");
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {
    console.error("Failed to load .env manually:", e);
  }
}

// Helper function to calculate date offsets
const now = new Date();
const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(now.getDate() - d);
  return date;
};
const formatDate = (date: Date) => date.toISOString().split("T")[0];

async function main() {
  console.log("Seeding database...");

  // Dynamically import db and schemas so environment variables are loaded first
  const { db } = await import("./db");
  const {
    vehicles,
    drivers,
    trips,
    maintenanceLogs,
    fuelLogs,
    expenses,
    vehicleDocuments,
    settings,
    user,
    account,
    notifications
  } = await import("./schema");
  const { sql } = await import("drizzle-orm");
  const bcrypt = await import("bcrypt");

  // 1. Clear existing data (in correct order due to foreign keys)
  console.log("Clearing existing data...");
  await db.execute(
    sql`TRUNCATE TABLE "verification", "session", "account", "settings", "notifications", "vehicle_documents", "expenses", "fuel_logs", "maintenance_logs", "trips", "drivers", "vehicles", "user" CASCADE;`
  );

  // 2. Seed a Settings row (singleton)
  console.log("Seeding operational settings...");
  await db.insert(settings).values({
    depotName: "Mumbai Central Depot",
    currency: "INR",
    distanceUnit: "km",
    ratePerKm: "18.50",
    avgSpeedKmph: "48.00",
  });

  // 3. Seed Vehicles
  console.log("Seeding vehicles...");
  const vList = await db.insert(vehicles).values([
    {
      registrationNumber: "MH12AB1234",
      name: "Tata Prima Truck",
      type: "truck",
      capacityKg: "15000",
      odometerKm: "52400.00",
      acquisitionCost: "3500000",
      status: "available",
      region: "West",
    },
    {
      registrationNumber: "DL01XY9876",
      name: "Mahindra Bolero Pickup",
      type: "pickup",
      capacityKg: "1500",
      odometerKm: "12350.00",
      acquisitionCost: "850000",
      status: "available",
      region: "North",
    },
    {
      registrationNumber: "KA03MM4567",
      name: "Maruti Suzuki Super Carry",
      type: "mini_truck",
      capacityKg: "800",
      odometerKm: "8200.00",
      acquisitionCost: "600000",
      status: "available",
      region: "South",
    },
    {
      registrationNumber: "TN02KK3322",
      name: "Ashok Leyland Dost",
      type: "pickup",
      capacityKg: "2000",
      odometerKm: "24500.00",
      acquisitionCost: "780000",
      status: "available",
      region: "South",
    },
    {
      registrationNumber: "MH15GG4321",
      name: "BharatBenz 2823R Heavy",
      type: "truck",
      capacityKg: "20000",
      odometerKm: "85600.00",
      acquisitionCost: "4200000",
      status: "on_trip",
      region: "West",
    },
    {
      registrationNumber: "HR55AA9000",
      name: "Force Shaktiman Van",
      type: "van",
      capacityKg: "4000",
      odometerKm: "43200.00",
      acquisitionCost: "1100000",
      status: "on_trip",
      region: "North",
    },
    {
      registrationNumber: "GJ01ZZ5555",
      name: "Eicher Pro 2049 Cargo",
      type: "mini_truck",
      capacityKg: "3500",
      odometerKm: "31800.00",
      acquisitionCost: "1400000",
      status: "in_shop",
      region: "West",
    },
    {
      registrationNumber: "MH14ZZ9999",
      name: "Scania Heavy Hauler",
      type: "truck",
      capacityKg: "25000",
      odometerKm: "154000.00",
      acquisitionCost: "8000000",
      status: "retired",
      region: "West",
    },
  ]).returning();

  // Map vehicles by registrationNumber for easy lookup
  const vMap = new Map(vList.map(v => [v.registrationNumber, v]));

  // 4. Seed Drivers
  console.log("Seeding drivers...");
  const dList = await db.insert(drivers).values([
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
      name: "Vikram Singh",
      licenseNumber: "UP-78901234567",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2032-10-10",
      phone: "+919876543213",
      safetyScore: 98,
      status: "available",
    },
    {
      name: "Suresh Patel",
      licenseNumber: "GJ-11223344556",
      licenseCategory: "Medium Commercial",
      licenseExpiry: "2028-04-12",
      phone: "+919876540012",
      safetyScore: 90,
      status: "available",
    },
    {
      name: "Ramesh Dev",
      licenseNumber: "MH-44556677889",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2031-09-24",
      phone: "+919876543288",
      safetyScore: 88,
      status: "on_trip",
    },
    {
      name: "Gurpreet Singh",
      licenseNumber: "PB-99887766554",
      licenseCategory: "Heavy Commercial",
      licenseExpiry: "2030-01-15",
      phone: "+919876543299",
      safetyScore: 95,
      status: "on_trip",
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
      name: "Vijay Yadav",
      licenseNumber: "BR-55667788990",
      licenseCategory: "Medium Commercial",
      licenseExpiry: "2031-11-30",
      phone: "+919876543200",
      safetyScore: 82,
      status: "off_duty",
    },
  ]).returning();

  // Map drivers by licenseNumber for easy lookup
  const dMap = new Map(dList.map(d => [d.licenseNumber, d]));

  // 5. Seed Users & Accounts for Test Credentials
  console.log("Hashing passwords for test users...");
  const hashedPassword = await bcrypt.default.hash("Password123", 10);

  const testUsers = [
    {
      id: "user_fleet_manager",
      name: "Fleet Manager User",
      email: "manager@transitops.com",
      role: "fleet_manager" as const,
    },
    {
      id: "user_dispatcher",
      name: "Dispatcher User",
      email: "dispatcher@transitops.com",
      role: "dispatcher" as const,
    },
    {
      id: "user_safety_officer",
      name: "Safety Officer User",
      email: "safety@transitops.com",
      role: "safety_officer" as const,
    },
    {
      id: "user_financial_analyst",
      name: "Financial Analyst User",
      email: "finance@transitops.com",
      role: "financial_analyst" as const,
    },
  ];

  await db.insert(user).values(testUsers);

  const testAccounts = testUsers.map((tu) => ({
    id: `acc_${tu.id}`,
    userId: tu.id,
    accountId: tu.email,
    providerId: "credential",
    password: hashedPassword,
  }));

  await db.insert(account).values(testAccounts);

  // 6. Seed Trips
  console.log("Seeding operational trips...");
  const tList = await db.insert(trips).values([
    // Completed Trip 1
    {
      source: "Mumbai",
      destination: "Pune",
      cargoWeightKg: "12000.00",
      plannedDistanceKm: "150.00",
      revenue: "2775.00", // 150 * 18.50
      status: "completed",
      vehicleId: vMap.get("MH12AB1234")?.id,
      driverId: dMap.get("DL-12345678901")?.id,
      startedAt: daysAgo(3),
      completedAt: new Date(daysAgo(3).getTime() + 4 * 60 * 60 * 1000), // 4 hours duration
      finalOdometerKm: "52400.00",
      fuelConsumedLiters: "42.00",
      estimatedDurationMinutes: 240,
    },
    // Completed Trip 2
    {
      source: "Delhi",
      destination: "Noida",
      cargoWeightKg: "1200.00",
      plannedDistanceKm: "45.00",
      revenue: "832.50", // 45 * 18.50
      status: "completed",
      vehicleId: vMap.get("DL01XY9876")?.id,
      driverId: dMap.get("MH-98765432102")?.id,
      startedAt: daysAgo(2),
      completedAt: new Date(daysAgo(2).getTime() + 90 * 60 * 1000), // 1.5 hours duration
      finalOdometerKm: "12350.00",
      fuelConsumedLiters: "6.00",
      estimatedDurationMinutes: 90,
    },
    // Completed Trip 3
    {
      source: "Chennai",
      destination: "Bangalore",
      cargoWeightKg: "1800.00",
      plannedDistanceKm: "350.00",
      revenue: "6475.00", // 350 * 18.50
      status: "completed",
      vehicleId: vMap.get("TN02KK3322")?.id,
      driverId: dMap.get("GJ-11223344556")?.id,
      startedAt: daysAgo(5),
      completedAt: new Date(daysAgo(5).getTime() + 8 * 60 * 60 * 1000), // 8 hours duration
      finalOdometerKm: "24500.00",
      fuelConsumedLiters: "38.00",
      estimatedDurationMinutes: 480,
    },
    // Dispatched (On Trip) Trip 1
    {
      source: "Pune",
      destination: "Nashik",
      cargoWeightKg: "18000.00",
      plannedDistanceKm: "210.00",
      revenue: "3885.00",
      status: "dispatched",
      vehicleId: vMap.get("MH15GG4321")?.id,
      driverId: dMap.get("MH-44556677889")?.id,
      startedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      estimatedDurationMinutes: 300,
    },
    // Dispatched (On Trip) Trip 2
    {
      source: "Delhi",
      destination: "Chandigarh",
      cargoWeightKg: "3500.00",
      plannedDistanceKm: "250.00",
      revenue: "4625.00",
      status: "dispatched",
      vehicleId: vMap.get("HR55AA9000")?.id,
      driverId: dMap.get("PB-99887766554")?.id,
      startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      estimatedDurationMinutes: 330,
    },
    // Cancelled Trip
    {
      source: "Mumbai",
      destination: "Goa",
      cargoWeightKg: "14000.00",
      plannedDistanceKm: "600.00",
      revenue: "11100.00",
      status: "cancelled",
      vehicleId: vMap.get("MH12AB1234")?.id,
      driverId: dMap.get("DL-12345678901")?.id,
      cancellationReason: "Severe weather warning along the coastal highway routes.",
    },
    // Draft Trip
    {
      source: "Bangalore",
      destination: "Hyderabad",
      cargoWeightKg: "1500.00",
      plannedDistanceKm: "570.00",
      revenue: "10545.00",
      status: "draft",
      vehicleId: vMap.get("TN02KK3322")?.id,
      driverId: dMap.get("GJ-11223344556")?.id,
    },
  ]).returning();

  // 7. Seed Fuel Logs
  console.log("Seeding fuel logs...");
  await db.insert(fuelLogs).values([
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      tripId: tList[0].id,
      liters: "42.00",
      cost: "4032.00", // 42 * 96/L
      date: formatDate(daysAgo(3)),
    },
    {
      vehicleId: vMap.get("DL01XY9876")!.id,
      tripId: tList[1].id,
      liters: "6.00",
      cost: "576.00",
      date: formatDate(daysAgo(2)),
    },
    {
      vehicleId: vMap.get("TN02KK3322")!.id,
      tripId: tList[2].id,
      liters: "38.00",
      cost: "3648.00",
      date: formatDate(daysAgo(5)),
    },
    // Standalone historical fuel logs
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      liters: "85.00",
      cost: "8160.00",
      date: formatDate(daysAgo(10)),
    },
    {
      vehicleId: vMap.get("DL01XY9876")!.id,
      liters: "22.00",
      cost: "2112.00",
      date: formatDate(daysAgo(8)),
    },
    {
      vehicleId: vMap.get("KA03MM4567")!.id,
      liters: "15.00",
      cost: "1440.00",
      date: formatDate(daysAgo(6)),
    },
  ]);

  // 8. Seed Maintenance Logs
  console.log("Seeding maintenance logs...");
  await db.insert(maintenanceLogs).values([
    {
      vehicleId: vMap.get("GJ01ZZ5555")!.id,
      serviceType: "Engine Overhaul",
      cost: "45000.00",
      notes: "Replacing cylinder gasket, fixing exhaust smoke valve issue.",
      status: "open",
      openedAt: daysAgo(2),
    },
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      serviceType: "Brake Pad Replacement",
      cost: "8500.00",
      notes: "Front and rear brake pads replacement and rotor machining.",
      status: "completed",
      openedAt: daysAgo(15),
      closedAt: daysAgo(14),
    },
    {
      vehicleId: vMap.get("DL01XY9876")!.id,
      serviceType: "Routine Service & Oil Change",
      cost: "4500.00",
      notes: "Full synthetic oil replacement, oil filter check, fluid top-up.",
      status: "completed",
      openedAt: daysAgo(30),
      closedAt: daysAgo(30),
    },
  ]);

  // 9. Seed Expenses
  console.log("Seeding accessory expenses...");
  await db.insert(expenses).values([
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      tripId: tList[0].id,
      type: "toll",
      amount: "600.00",
      date: formatDate(daysAgo(3)),
    },
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      tripId: tList[0].id,
      type: "other",
      amount: "250.00",
      date: formatDate(daysAgo(3)),
    },
    {
      vehicleId: vMap.get("TN02KK3322")!.id,
      tripId: tList[2].id,
      type: "toll",
      amount: "1200.00",
      date: formatDate(daysAgo(5)),
    },
  ]);

  // 10. Seed Vehicle Documents
  console.log("Seeding vehicle compliance documents...");
  await db.insert(vehicleDocuments).values([
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      documentType: "insurance",
      fileUrl: "/docs/mh12_insurance.pdf",
      expiryDate: formatDate(new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
    },
    {
      vehicleId: vMap.get("MH12AB1234")!.id,
      documentType: "pollution",
      fileUrl: "/docs/mh12_puc.pdf",
      expiryDate: formatDate(daysAgo(-60)), // Expiring in 60 days
    },
    {
      vehicleId: vMap.get("DL01XY9876")!.id,
      documentType: "rc",
      fileUrl: "/docs/dl01_rc.pdf",
      expiryDate: formatDate(new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000)),
    },
  ]);

  // 11. Seed Notifications
  console.log("Seeding system notifications...");
  await db.insert(notifications).values([
    {
      userId: "user_fleet_manager",
      title: "Vehicle Scheduled for Maintenance",
      message: "Eicher Pro 2049 Cargo (GJ01ZZ5555) requires an engine overhaul service.",
      type: "maintenance",
      isRead: false,
    },
    {
      userId: "user_dispatcher",
      title: "New Dispatch Assigned",
      message: "Trip dispatched successfully from Pune to Nashik assigned to driver Ramesh Dev.",
      type: "trip",
      isRead: false,
    },
  ]);

  console.log("Database seeded successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
