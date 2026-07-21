CREATE TABLE "student_password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_password_resets" ADD CONSTRAINT "student_password_resets_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_password_resets_student_unique" ON "student_password_resets" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_password_resets_expiry_idx" ON "student_password_resets" USING btree ("expires_at");