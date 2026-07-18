CREATE TABLE "pending_student_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(24) NOT NULL,
	"academic_year" "academic_year" NOT NULL,
	"governorate" varchar(80) NOT NULL,
	"guardian_occupation" varchar(120) NOT NULL,
	"guardian_phone" varchar(24) NOT NULL,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"verification_code_hash" text NOT NULL,
	"verification_expires_at" timestamp with time zone NOT NULL,
	"verification_attempts" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pending_students_email_unique" ON "pending_student_registrations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "pending_students_phone_unique" ON "pending_student_registrations" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "pending_students_expiry_idx" ON "pending_student_registrations" USING btree ("verification_expires_at");
--> statement-breakpoint
UPDATE "students" SET "email_verified_at" = COALESCE("email_verified_at", "created_at") WHERE "email_verified_at" IS NULL;
