CREATE TYPE "public"."document_type" AS ENUM('insurance', 'fitness', 'rc', 'pollution', 'other');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('available', 'on_trip', 'off_duty', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('toll', 'other');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('open', 'completed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'dispatched', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'on_trip', 'in_shop', 'retired');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('truck', 'van', 'bike', 'mini_truck', 'pickup', 'other');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"license_number" text NOT NULL,
	"license_category" text NOT NULL,
	"license_expiry" date NOT NULL,
	"phone" text NOT NULL,
	"safety_score" integer DEFAULT 100 NOT NULL,
	"status" "driver_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_safety_score_valid" CHECK ("drivers"."safety_score" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"trip_id" uuid,
	"type" "expense_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "expense_amount_positive" CHECK ("expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "fuel_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"trip_id" uuid,
	"liters" numeric(10, 2) NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "fuel_liters_positive" CHECK ("fuel_logs"."liters" >= 0),
	CONSTRAINT "fuel_cost_positive" CHECK ("fuel_logs"."cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"service_type" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"notes" text,
	"status" "maintenance_status" DEFAULT 'open' NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "maintenance_cost_positive" CHECK ("maintenance_logs"."cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_name" text DEFAULT 'Main Depot' NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"distance_unit" text DEFAULT 'km' NOT NULL,
	"rate_per_km" numeric(10, 2) DEFAULT '0' NOT NULL,
	"avg_speed_kmph" numeric(6, 2) DEFAULT '40' NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_rate_positive" CHECK ("settings"."rate_per_km" >= 0),
	CONSTRAINT "settings_speed_positive" CHECK ("settings"."avg_speed_kmph" >= 0)
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_number" serial NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"cargo_weight_kg" numeric(10, 2) NOT NULL,
	"planned_distance_km" numeric(10, 2) NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "trip_status" DEFAULT 'draft' NOT NULL,
	"vehicle_id" uuid,
	"driver_id" uuid,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"final_odometer_km" numeric(10, 2),
	"fuel_consumed_liters" numeric(10, 2),
	"estimated_duration_minutes" integer,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_vehicle_driver_required_once_active" CHECK (("trips"."status" NOT IN ('dispatched', 'completed')) OR ("trips"."vehicle_id" IS NOT NULL AND "trips"."driver_id" IS NOT NULL)),
	CONSTRAINT "trips_cargo_weight_positive" CHECK ("trips"."cargo_weight_kg" >= 0),
	CONSTRAINT "trips_planned_distance_positive" CHECK ("trips"."planned_distance_km" >= 0),
	CONSTRAINT "trips_revenue_positive" CHECK ("trips"."revenue" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "role" DEFAULT 'dispatcher' NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"expiry_date" date NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" text NOT NULL,
	"name" text NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"odometer_km" numeric(10, 2) DEFAULT '0' NOT NULL,
	"acquisition_cost" numeric(12, 2) NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"region" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_capacity_positive" CHECK ("vehicles"."capacity_kg" > 0),
	CONSTRAINT "vehicles_odometer_positive" CHECK ("vehicles"."odometer_km" >= 0),
	CONSTRAINT "vehicles_cost_positive" CHECK ("vehicles"."acquisition_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_license_number_unique_idx" ON "drivers" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "drivers_status_idx" ON "drivers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_vehicle_id_idx" ON "expenses" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "expenses_trip_id_idx" ON "expenses" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "fuel_logs_vehicle_id_idx" ON "fuel_logs" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "fuel_logs_trip_id_idx" ON "fuel_logs" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "maintenance_logs_vehicle_id_idx" ON "maintenance_logs" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "maintenance_logs_status_idx" ON "maintenance_logs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "maintenance_one_open_per_vehicle_idx" ON "maintenance_logs" USING btree ("vehicle_id") WHERE "maintenance_logs"."status" = 'open';--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_status_idx" ON "trips" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trips_vehicle_id_idx" ON "trips" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trips_driver_id_idx" ON "trips" USING btree ("driver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trips_one_dispatched_per_vehicle_idx" ON "trips" USING btree ("vehicle_id") WHERE "trips"."status" = 'dispatched';--> statement-breakpoint
CREATE UNIQUE INDEX "trips_one_dispatched_per_driver_idx" ON "trips" USING btree ("driver_id") WHERE "trips"."status" = 'dispatched';--> statement-breakpoint
CREATE INDEX "vehicle_documents_vehicle_id_idx" ON "vehicle_documents" USING btree ("vehicle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_registration_number_unique_idx" ON "vehicles" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "vehicles_status_idx" ON "vehicles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");