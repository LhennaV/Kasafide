import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."listings" ADD COLUMN IF NOT EXISTS "ownership_doc_path" varchar;
  ALTER TABLE "payload"."listings" ADD COLUMN IF NOT EXISTS "photo_urls" jsonb;
  ALTER TABLE "payload"."_listings_v" ADD COLUMN IF NOT EXISTS "version_ownership_doc_path" varchar;
  ALTER TABLE "payload"."_listings_v" ADD COLUMN IF NOT EXISTS "version_photo_urls" jsonb;
  ALTER TABLE "payload"."verification_submissions" ADD COLUMN IF NOT EXISTS "id_image_path" varchar;
  ALTER TABLE "payload"."verification_submissions" ADD COLUMN IF NOT EXISTS "selfie_image_path" varchar;
  ALTER TABLE "payload"."_verification_submissions_v" ADD COLUMN IF NOT EXISTS "version_id_image_path" varchar;
  ALTER TABLE "payload"."_verification_submissions_v" ADD COLUMN IF NOT EXISTS "version_selfie_image_path" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."listings" DROP COLUMN IF EXISTS "ownership_doc_path";
  ALTER TABLE "payload"."listings" DROP COLUMN IF EXISTS "photo_urls";
  ALTER TABLE "payload"."_listings_v" DROP COLUMN IF EXISTS "version_ownership_doc_path";
  ALTER TABLE "payload"."_listings_v" DROP COLUMN IF EXISTS "version_photo_urls";
  ALTER TABLE "payload"."verification_submissions" DROP COLUMN IF EXISTS "id_image_path";
  ALTER TABLE "payload"."verification_submissions" DROP COLUMN IF EXISTS "selfie_image_path";
  ALTER TABLE "payload"."_verification_submissions_v" DROP COLUMN IF EXISTS "version_id_image_path";
  ALTER TABLE "payload"."_verification_submissions_v" DROP COLUMN IF EXISTS "version_selfie_image_path";`)
}
