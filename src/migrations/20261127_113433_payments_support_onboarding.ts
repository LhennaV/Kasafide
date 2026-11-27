import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN CREATE TYPE "payload"."enum_messages_requested_payment_type" AS ENUM('rent', 'reservation', 'security_deposit', 'purchase'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "payload"."enum__messages_v_version_requested_payment_type" AS ENUM('rent', 'reservation', 'security_deposit', 'purchase'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TYPE "payload"."enum_messages_message_type" ADD VALUE IF NOT EXISTS 'support';
  ALTER TYPE "payload"."enum__messages_v_version_message_type" ADD VALUE IF NOT EXISTS 'support';
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "gcash_name" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "maya_name" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "bank_name" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "bank_account_number" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "bank_account_name" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "onboarding_completed_at" timestamp(3) with time zone;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_gcash_name" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_maya_name" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_bank_name" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_bank_account_number" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_bank_account_name" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_onboarding_completed_at" timestamp(3) with time zone;
  ALTER TABLE "payload"."messages" ADD COLUMN IF NOT EXISTS "requested_payment_type" "payload"."enum_messages_requested_payment_type";
  ALTER TABLE "payload"."messages" ADD COLUMN IF NOT EXISTS "requested_period_label" varchar;
  ALTER TABLE "payload"."_messages_v" ADD COLUMN IF NOT EXISTS "version_requested_payment_type" "payload"."enum__messages_v_version_requested_payment_type";
  ALTER TABLE "payload"."_messages_v" ADD COLUMN IF NOT EXISTS "version_requested_period_label" varchar;
  ALTER TABLE "payload"."payments" ADD COLUMN IF NOT EXISTS "request_message_id" integer;
  ALTER TABLE "payload"."payments" ADD COLUMN IF NOT EXISTS "payer_reference" varchar;
  ALTER TABLE "payload"."payments" ADD COLUMN IF NOT EXISTS "proof_path" varchar;
  ALTER TABLE "payload"."_payments_v" ADD COLUMN IF NOT EXISTS "version_request_message_id" integer;
  ALTER TABLE "payload"."_payments_v" ADD COLUMN IF NOT EXISTS "version_payer_reference" varchar;
  ALTER TABLE "payload"."_payments_v" ADD COLUMN IF NOT EXISTS "version_proof_path" varchar;
  DO $$ BEGIN ALTER TABLE "payload"."payments" ADD CONSTRAINT "payments_request_message_id_messages_id_fk" FOREIGN KEY ("request_message_id") REFERENCES "payload"."messages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload"."_payments_v" ADD CONSTRAINT "_payments_v_version_request_message_id_messages_id_fk" FOREIGN KEY ("version_request_message_id") REFERENCES "payload"."messages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "payments_request_message_idx" ON "payload"."payments" USING btree ("request_message_id");
  CREATE INDEX IF NOT EXISTS "_payments_v_version_version_request_message_idx" ON "payload"."_payments_v" USING btree ("version_request_message_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."payments" DROP CONSTRAINT "payments_request_message_id_messages_id_fk";
  
  ALTER TABLE "payload"."_payments_v" DROP CONSTRAINT "_payments_v_version_request_message_id_messages_id_fk";
  
  ALTER TABLE "payload"."messages" ALTER COLUMN "message_type" SET DATA TYPE text;
  ALTER TABLE "payload"."messages" ALTER COLUMN "message_type" SET DEFAULT 'text'::text;
  DROP TYPE "payload"."enum_messages_message_type";
  CREATE TYPE "payload"."enum_messages_message_type" AS ENUM('text', 'viewing_request', 'payment_request');
  ALTER TABLE "payload"."messages" ALTER COLUMN "message_type" SET DEFAULT 'text'::"payload"."enum_messages_message_type";
  ALTER TABLE "payload"."messages" ALTER COLUMN "message_type" SET DATA TYPE "payload"."enum_messages_message_type" USING "message_type"::"payload"."enum_messages_message_type";
  ALTER TABLE "payload"."_messages_v" ALTER COLUMN "version_message_type" SET DATA TYPE text;
  ALTER TABLE "payload"."_messages_v" ALTER COLUMN "version_message_type" SET DEFAULT 'text'::text;
  DROP TYPE "payload"."enum__messages_v_version_message_type";
  CREATE TYPE "payload"."enum__messages_v_version_message_type" AS ENUM('text', 'viewing_request', 'payment_request');
  ALTER TABLE "payload"."_messages_v" ALTER COLUMN "version_message_type" SET DEFAULT 'text'::"payload"."enum__messages_v_version_message_type";
  ALTER TABLE "payload"."_messages_v" ALTER COLUMN "version_message_type" SET DATA TYPE "payload"."enum__messages_v_version_message_type" USING "version_message_type"::"payload"."enum__messages_v_version_message_type";
  DROP INDEX "payload"."payments_request_message_idx";
  DROP INDEX "payload"."_payments_v_version_version_request_message_idx";
  ALTER TABLE "payload"."users" DROP COLUMN "gcash_name";
  ALTER TABLE "payload"."users" DROP COLUMN "maya_name";
  ALTER TABLE "payload"."users" DROP COLUMN "bank_name";
  ALTER TABLE "payload"."users" DROP COLUMN "bank_account_number";
  ALTER TABLE "payload"."users" DROP COLUMN "bank_account_name";
  ALTER TABLE "payload"."users" DROP COLUMN "onboarding_completed_at";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_gcash_name";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_maya_name";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_bank_name";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_bank_account_number";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_bank_account_name";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_onboarding_completed_at";
  ALTER TABLE "payload"."messages" DROP COLUMN "requested_payment_type";
  ALTER TABLE "payload"."messages" DROP COLUMN "requested_period_label";
  ALTER TABLE "payload"."_messages_v" DROP COLUMN "version_requested_payment_type";
  ALTER TABLE "payload"."_messages_v" DROP COLUMN "version_requested_period_label";
  ALTER TABLE "payload"."payments" DROP COLUMN "request_message_id";
  ALTER TABLE "payload"."payments" DROP COLUMN "payer_reference";
  ALTER TABLE "payload"."payments" DROP COLUMN "proof_path";
  ALTER TABLE "payload"."_payments_v" DROP COLUMN "version_request_message_id";
  ALTER TABLE "payload"."_payments_v" DROP COLUMN "version_payer_reference";
  ALTER TABLE "payload"."_payments_v" DROP COLUMN "version_proof_path";
  DROP TYPE "payload"."enum_messages_requested_payment_type";
  DROP TYPE "payload"."enum__messages_v_version_requested_payment_type";`)
}
