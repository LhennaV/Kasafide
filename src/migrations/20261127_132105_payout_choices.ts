import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payout Settings: one e-wallet of any provider (not just GCash/Maya) + a bank account.
// Safe to re-run. Existing GCash (or else Maya) payout numbers are copied into the new fields.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE "payload"."enum_payments_method" ADD VALUE IF NOT EXISTS 'ewallet' BEFORE 'bank_transfer';
  ALTER TYPE "payload"."enum__payments_v_version_method" ADD VALUE IF NOT EXISTS 'ewallet' BEFORE 'bank_transfer';
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "ewallet_provider" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "ewallet_number" varchar;
  ALTER TABLE "payload"."users" ADD COLUMN IF NOT EXISTS "ewallet_name" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_ewallet_provider" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_ewallet_number" varchar;
  ALTER TABLE "payload"."_users_v" ADD COLUMN IF NOT EXISTS "version_ewallet_name" varchar;
  ALTER TABLE "payload"."payments" ADD COLUMN IF NOT EXISTS "method_label" varchar;
  ALTER TABLE "payload"."_payments_v" ADD COLUMN IF NOT EXISTS "version_method_label" varchar;
  UPDATE "payload"."users" SET "ewallet_provider" = 'GCash', "ewallet_number" = "gcash_number", "ewallet_name" = "gcash_name"
    WHERE coalesce("ewallet_number", '') = '' AND coalesce("gcash_number", '') <> '';
  UPDATE "payload"."users" SET "ewallet_provider" = 'Maya', "ewallet_number" = "maya_number", "ewallet_name" = "maya_name"
    WHERE coalesce("ewallet_number", '') = '' AND coalesce("maya_number", '') <> '';`)
}
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."payments" ALTER COLUMN "method" SET DATA TYPE text;
  DROP TYPE "payload"."enum_payments_method";
  CREATE TYPE "payload"."enum_payments_method" AS ENUM('qrph', 'gcash', 'maya', 'bank_transfer');
  ALTER TABLE "payload"."payments" ALTER COLUMN "method" SET DATA TYPE "payload"."enum_payments_method" USING "method"::"payload"."enum_payments_method";
  ALTER TABLE "payload"."_payments_v" ALTER COLUMN "version_method" SET DATA TYPE text;
  DROP TYPE "payload"."enum__payments_v_version_method";
  CREATE TYPE "payload"."enum__payments_v_version_method" AS ENUM('qrph', 'gcash', 'maya', 'bank_transfer');
  ALTER TABLE "payload"."_payments_v" ALTER COLUMN "version_method" SET DATA TYPE "payload"."enum__payments_v_version_method" USING "version_method"::"payload"."enum__payments_v_version_method";
  ALTER TABLE "payload"."users" DROP COLUMN "ewallet_provider";
  ALTER TABLE "payload"."users" DROP COLUMN "ewallet_number";
  ALTER TABLE "payload"."users" DROP COLUMN "ewallet_name";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_ewallet_provider";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_ewallet_number";
  ALTER TABLE "payload"."_users_v" DROP COLUMN "version_ewallet_name";
  ALTER TABLE "payload"."payments" DROP COLUMN "method_label";
  ALTER TABLE "payload"."_payments_v" DROP COLUMN "version_method_label";`)
}
