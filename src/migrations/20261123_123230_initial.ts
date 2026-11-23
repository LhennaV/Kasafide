import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."_locales" AS ENUM('en');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('buyer', 'seller', 'admin', 'superadmin', 'super_duper_admin');
  CREATE TYPE "payload"."enum_users_account_status" AS ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended');
  CREATE TYPE "payload"."enum_users_auth_provider" AS ENUM('local', 'google');
  CREATE TYPE "payload"."enum__users_v_version_role" AS ENUM('buyer', 'seller', 'admin', 'superadmin', 'super_duper_admin');
  CREATE TYPE "payload"."enum__users_v_version_account_status" AS ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended');
  CREATE TYPE "payload"."enum__users_v_version_auth_provider" AS ENUM('local', 'google');
  CREATE TYPE "payload"."enum_listings_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'closed');
  CREATE TYPE "payload"."enum_listings_property_type" AS ENUM('house', 'apartment', 'condo', 'commercial', 'lot');
  CREATE TYPE "payload"."enum_listings_listing_type" AS ENUM('rent', 'sale');
  CREATE TYPE "payload"."enum_listings_ownership_doc_type" AS ENUM('tct', 'deed_of_sale', 'tax_declaration');
  CREATE TYPE "payload"."enum__listings_v_version_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'closed');
  CREATE TYPE "payload"."enum__listings_v_version_property_type" AS ENUM('house', 'apartment', 'condo', 'commercial', 'lot');
  CREATE TYPE "payload"."enum__listings_v_version_listing_type" AS ENUM('rent', 'sale');
  CREATE TYPE "payload"."enum__listings_v_version_ownership_doc_type" AS ENUM('tct', 'deed_of_sale', 'tax_declaration');
  CREATE TYPE "payload"."enum_viewing_requests_status" AS ENUM('pending', 'accepted', 'declined', 'completed');
  CREATE TYPE "payload"."enum__viewing_requests_v_version_status" AS ENUM('pending', 'accepted', 'declined', 'completed');
  CREATE TYPE "payload"."enum_messages_message_type" AS ENUM('text', 'viewing_request', 'payment_request');
  CREATE TYPE "payload"."enum__messages_v_version_message_type" AS ENUM('text', 'viewing_request', 'payment_request');
  CREATE TYPE "payload"."enum_payments_payment_type" AS ENUM('rent', 'reservation', 'security_deposit', 'purchase');
  CREATE TYPE "payload"."enum_payments_method" AS ENUM('qrph', 'gcash', 'maya', 'bank_transfer');
  CREATE TYPE "payload"."enum_payments_status" AS ENUM('pending_verification', 'confirmed', 'rejected', 'refund_requested', 'refunded');
  CREATE TYPE "payload"."enum__payments_v_version_payment_type" AS ENUM('rent', 'reservation', 'security_deposit', 'purchase');
  CREATE TYPE "payload"."enum__payments_v_version_method" AS ENUM('qrph', 'gcash', 'maya', 'bank_transfer');
  CREATE TYPE "payload"."enum__payments_v_version_status" AS ENUM('pending_verification', 'confirmed', 'rejected', 'refund_requested', 'refunded');
  CREATE TYPE "payload"."enum_verification_submissions_id_type" AS ENUM('drivers_license', 'passport', 'philid', 'umid', 'postal_id');
  CREATE TYPE "payload"."enum_verification_submissions_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "payload"."enum__verification_submissions_v_version_id_type" AS ENUM('drivers_license', 'passport', 'philid', 'umid', 'postal_id');
  CREATE TYPE "payload"."enum__verification_submissions_v_version_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "payload"."enum_listing_reports_reason" AS ENUM('fake_listing', 'misleading_photos', 'wrong_price', 'scam_behavior', 'duplicate');
  CREATE TYPE "payload"."enum_listing_reports_status" AS ENUM('open', 'investigating', 'resolved', 'dismissed');
  CREATE TYPE "payload"."enum__listing_reports_v_version_reason" AS ENUM('fake_listing', 'misleading_photos', 'wrong_price', 'scam_behavior', 'duplicate');
  CREATE TYPE "payload"."enum__listing_reports_v_version_status" AS ENUM('open', 'investigating', 'resolved', 'dismissed');
  CREATE TYPE "payload"."enum_notifications_type" AS ENUM('listing', 'message', 'payment', 'system');
  CREATE TYPE "payload"."enum__notifications_v_version_type" AS ENUM('listing', 'message', 'payment', 'system');
  CREATE TYPE "payload"."enum_audit_logs_actor_role" AS ENUM('buyer', 'seller', 'admin', 'superadmin', 'system');
  CREATE TYPE "payload"."enum_audit_logs_status" AS ENUM('success', 'warning', 'failed');
  CREATE TYPE "payload"."enum__audit_logs_v_version_actor_role" AS ENUM('buyer', 'seller', 'admin', 'superadmin', 'system');
  CREATE TYPE "payload"."enum__audit_logs_v_version_status" AS ENUM('success', 'warning', 'failed');
  CREATE TYPE "payload"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "payload"."admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "payload"."admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."admins_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"middle_initial" varchar,
  	"last_name" varchar NOT NULL,
  	"full_name" varchar NOT NULL,
  	"role" "payload"."enum_users_role" DEFAULT 'buyer' NOT NULL,
  	"account_status" "payload"."enum_users_account_status" DEFAULT 'unverified' NOT NULL,
  	"phone" varchar,
  	"bio" varchar,
  	"avatar_id" integer,
  	"avatar_url" varchar,
  	"auth_provider" "payload"."enum_users_auth_provider" DEFAULT 'local',
  	"provider_id" varchar,
  	"verified_at" timestamp(3) with time zone,
  	"verification_expiry" timestamp(3) with time zone,
  	"moa_signed_at" timestamp(3) with time zone,
  	"moa_signature_name" varchar,
  	"gcash_number" varchar,
  	"maya_number" varchar,
  	"warning_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"listings_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_users_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_count" numeric,
  	"refreshed_at" timestamp(3) with time zone,
  	"label" varchar,
  	"type" varchar,
  	"metadata" jsonb
  );
  
  CREATE TABLE "payload"."_users_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_first_name" varchar NOT NULL,
  	"version_middle_initial" varchar,
  	"version_last_name" varchar NOT NULL,
  	"version_full_name" varchar NOT NULL,
  	"version_role" "payload"."enum__users_v_version_role" DEFAULT 'buyer' NOT NULL,
  	"version_account_status" "payload"."enum__users_v_version_account_status" DEFAULT 'unverified' NOT NULL,
  	"version_phone" varchar,
  	"version_bio" varchar,
  	"version_avatar_id" integer,
  	"version_avatar_url" varchar,
  	"version_auth_provider" "payload"."enum__users_v_version_auth_provider" DEFAULT 'local',
  	"version_provider_id" varchar,
  	"version_verified_at" timestamp(3) with time zone,
  	"version_verification_expiry" timestamp(3) with time zone,
  	"version_moa_signed_at" timestamp(3) with time zone,
  	"version_moa_signature_name" varchar,
  	"version_gcash_number" varchar,
  	"version_maya_number" varchar,
  	"version_warning_count" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_users_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"listings_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."barangays" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"map_x" numeric NOT NULL,
  	"map_y" numeric NOT NULL,
  	"featured_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."barangays_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_barangays_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_map_x" numeric NOT NULL,
  	"version_map_y" numeric NOT NULL,
  	"version_featured_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_barangays_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."listings_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "payload"."listings_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."listings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "payload"."enum_listings_status" DEFAULT 'pending' NOT NULL,
  	"seller_id" integer NOT NULL,
  	"property_type" "payload"."enum_listings_property_type" NOT NULL,
  	"listing_type" "payload"."enum_listings_listing_type" NOT NULL,
  	"price" numeric NOT NULL,
  	"barangay_id" integer NOT NULL,
  	"address" varchar NOT NULL,
  	"city" varchar DEFAULT 'Sta. Maria',
  	"province" varchar DEFAULT 'Bulacan',
  	"bedrooms" numeric DEFAULT 0,
  	"bathrooms" numeric DEFAULT 0,
  	"floor_area_sqm" numeric,
  	"lot_area_sqm" numeric,
  	"description" varchar NOT NULL,
  	"cover_image_id" integer NOT NULL,
  	"price_negotiable" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"title_verified" boolean DEFAULT false,
  	"has_multiple_units" boolean DEFAULT false,
  	"total_units" numeric DEFAULT 1,
  	"available_units" numeric DEFAULT 1,
  	"ownership_doc_type" "payload"."enum_listings_ownership_doc_type" DEFAULT 'tct',
  	"rejection_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."listings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_listings_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_listings_v_version_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_listings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_status" "payload"."enum__listings_v_version_status" DEFAULT 'pending' NOT NULL,
  	"version_seller_id" integer NOT NULL,
  	"version_property_type" "payload"."enum__listings_v_version_property_type" NOT NULL,
  	"version_listing_type" "payload"."enum__listings_v_version_listing_type" NOT NULL,
  	"version_price" numeric NOT NULL,
  	"version_barangay_id" integer NOT NULL,
  	"version_address" varchar NOT NULL,
  	"version_city" varchar DEFAULT 'Sta. Maria',
  	"version_province" varchar DEFAULT 'Bulacan',
  	"version_bedrooms" numeric DEFAULT 0,
  	"version_bathrooms" numeric DEFAULT 0,
  	"version_floor_area_sqm" numeric,
  	"version_lot_area_sqm" numeric,
  	"version_description" varchar NOT NULL,
  	"version_cover_image_id" integer NOT NULL,
  	"version_price_negotiable" boolean DEFAULT false,
  	"version_featured" boolean DEFAULT false,
  	"version_title_verified" boolean DEFAULT false,
  	"version_has_multiple_units" boolean DEFAULT false,
  	"version_total_units" numeric DEFAULT 1,
  	"version_available_units" numeric DEFAULT 1,
  	"version_ownership_doc_type" "payload"."enum__listings_v_version_ownership_doc_type" DEFAULT 'tct',
  	"version_rejection_reason" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_listings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."viewing_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_id" integer NOT NULL,
  	"buyer_id" integer NOT NULL,
  	"seller_id" integer NOT NULL,
  	"preferred_date" varchar NOT NULL,
  	"preferred_time" varchar NOT NULL,
  	"notes" varchar,
  	"status" "payload"."enum_viewing_requests_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."viewing_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_viewing_requests_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_listing_id" integer NOT NULL,
  	"version_buyer_id" integer NOT NULL,
  	"version_seller_id" integer NOT NULL,
  	"version_preferred_date" varchar NOT NULL,
  	"version_preferred_time" varchar NOT NULL,
  	"version_notes" varchar,
  	"version_status" "payload"."enum__viewing_requests_v_version_status" DEFAULT 'pending' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_viewing_requests_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sender_id" integer NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"listing_id" integer,
  	"body" varchar NOT NULL,
  	"message_type" "payload"."enum_messages_message_type" DEFAULT 'text' NOT NULL,
  	"requested_amount" numeric,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."messages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_messages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_sender_id" integer NOT NULL,
  	"version_recipient_id" integer NOT NULL,
  	"version_listing_id" integer,
  	"version_body" varchar NOT NULL,
  	"version_message_type" "payload"."enum__messages_v_version_message_type" DEFAULT 'text' NOT NULL,
  	"version_requested_amount" numeric,
  	"version_read" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_messages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_code" varchar NOT NULL,
  	"listing_id" integer NOT NULL,
  	"payer_id" integer NOT NULL,
  	"payee_id" integer NOT NULL,
  	"payment_type" "payload"."enum_payments_payment_type" NOT NULL,
  	"method" "payload"."enum_payments_method" NOT NULL,
  	"amount" numeric NOT NULL,
  	"period_label" varchar,
  	"status" "payload"."enum_payments_status" DEFAULT 'pending_verification' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_payments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_reference_code" varchar NOT NULL,
  	"version_listing_id" integer NOT NULL,
  	"version_payer_id" integer NOT NULL,
  	"version_payee_id" integer NOT NULL,
  	"version_payment_type" "payload"."enum__payments_v_version_payment_type" NOT NULL,
  	"version_method" "payload"."enum__payments_v_version_method" NOT NULL,
  	"version_amount" numeric NOT NULL,
  	"version_period_label" varchar,
  	"version_status" "payload"."enum__payments_v_version_status" DEFAULT 'pending_verification' NOT NULL,
  	"version_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_payments_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_id" integer NOT NULL,
  	"reviewer_id" integer NOT NULL,
  	"seller_id" integer NOT NULL,
  	"rating" numeric NOT NULL,
  	"comment" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_reviews_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_listing_id" integer NOT NULL,
  	"version_reviewer_id" integer NOT NULL,
  	"version_seller_id" integer NOT NULL,
  	"version_rating" numeric NOT NULL,
  	"version_comment" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_reviews_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."verification_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"id_type" "payload"."enum_verification_submissions_id_type" NOT NULL,
  	"id_number_last4" varchar,
  	"selfie_captured" boolean DEFAULT true,
  	"status" "payload"."enum_verification_submissions_status" DEFAULT 'pending' NOT NULL,
  	"reviewer_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."verification_submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_verification_submissions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_user_id" integer NOT NULL,
  	"version_id_type" "payload"."enum__verification_submissions_v_version_id_type" NOT NULL,
  	"version_id_number_last4" varchar,
  	"version_selfie_captured" boolean DEFAULT true,
  	"version_status" "payload"."enum__verification_submissions_v_version_status" DEFAULT 'pending' NOT NULL,
  	"version_reviewer_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_verification_submissions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."listing_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"listing_id" integer NOT NULL,
  	"reporter_id" integer NOT NULL,
  	"reason" "payload"."enum_listing_reports_reason" NOT NULL,
  	"details" varchar NOT NULL,
  	"status" "payload"."enum_listing_reports_status" DEFAULT 'open' NOT NULL,
  	"resolution_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."listing_reports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_listing_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_listing_id" integer NOT NULL,
  	"version_reporter_id" integer NOT NULL,
  	"version_reason" "payload"."enum__listing_reports_v_version_reason" NOT NULL,
  	"version_details" varchar NOT NULL,
  	"version_status" "payload"."enum__listing_reports_v_version_status" DEFAULT 'open' NOT NULL,
  	"version_resolution_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_listing_reports_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"type" "payload"."enum_notifications_type" DEFAULT 'system' NOT NULL,
  	"link" varchar,
  	"unread" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."notifications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_notifications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_recipient_id" integer NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_body" varchar NOT NULL,
  	"version_type" "payload"."enum__notifications_v_version_type" DEFAULT 'system' NOT NULL,
  	"version_link" varchar,
  	"version_unread" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_notifications_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_name" varchar NOT NULL,
  	"actor_email" varchar,
  	"actor_role" "payload"."enum_audit_logs_actor_role" NOT NULL,
  	"action" varchar NOT NULL,
  	"ip_address" varchar DEFAULT '120.28.64.18',
  	"status" "payload"."enum_audit_logs_status" DEFAULT 'success' NOT NULL,
  	"details" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."audit_logs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_audit_logs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_actor_name" varchar NOT NULL,
  	"version_actor_email" varchar,
  	"version_actor_role" "payload"."enum__audit_logs_v_version_actor_role" NOT NULL,
  	"version_action" varchar NOT NULL,
  	"version_ip_address" varchar DEFAULT '120.28.64.18',
  	"version_status" "payload"."enum__audit_logs_v_version_status" DEFAULT 'success' NOT NULL,
  	"version_details" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_audit_logs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"_h_folders_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"_stored" boolean,
  	"_transforms" jsonb,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"original__stored" boolean,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar NOT NULL,
  	"version__h_folders_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version__stored" boolean,
  	"version__transforms" jsonb,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_original__stored" boolean,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_folders_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."folders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_folders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_folders_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_folders_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_h_tags_id" integer,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."tags_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__h_tags_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."_tags_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer,
  	"barangays_id" integer,
  	"listings_id" integer,
  	"viewing_requests_id" integer,
  	"messages_id" integer,
  	"payments_id" integer,
  	"reviews_id" integer,
  	"verification_submissions_id" integer,
  	"listing_reports_id" integer,
  	"notifications_id" integer,
  	"audit_logs_id" integer,
  	"media_id" integer,
  	"folders_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "payload"."enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer
  );
  
  ALTER TABLE "payload"."admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."admins_rels" ADD CONSTRAINT "admins_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."admins_rels" ADD CONSTRAINT "admins_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."admins_rels" ADD CONSTRAINT "admins_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users_rels" ADD CONSTRAINT "users_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users_rels" ADD CONSTRAINT "users_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_users_v_version_sessions" ADD CONSTRAINT "_users_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_users_v" ADD CONSTRAINT "_users_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_users_v_rels" ADD CONSTRAINT "_users_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_users_v_rels" ADD CONSTRAINT "_users_v_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_users_v_rels" ADD CONSTRAINT "_users_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_users_v_rels" ADD CONSTRAINT "_users_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."barangays_rels" ADD CONSTRAINT "barangays_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."barangays"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."barangays_rels" ADD CONSTRAINT "barangays_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."barangays_rels" ADD CONSTRAINT "barangays_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_barangays_v" ADD CONSTRAINT "_barangays_v_parent_id_barangays_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."barangays"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_barangays_v_rels" ADD CONSTRAINT "_barangays_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_barangays_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_barangays_v_rels" ADD CONSTRAINT "_barangays_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_barangays_v_rels" ADD CONSTRAINT "_barangays_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listings_gallery" ADD CONSTRAINT "listings_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listings_gallery" ADD CONSTRAINT "listings_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listings_amenities" ADD CONSTRAINT "listings_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listings" ADD CONSTRAINT "listings_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "payload"."barangays"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listings" ADD CONSTRAINT "listings_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listings_rels" ADD CONSTRAINT "listings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listings_rels" ADD CONSTRAINT "listings_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listings_rels" ADD CONSTRAINT "listings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_version_gallery" ADD CONSTRAINT "_listings_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_version_gallery" ADD CONSTRAINT "_listings_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_version_amenities" ADD CONSTRAINT "_listings_v_version_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v" ADD CONSTRAINT "_listings_v_parent_id_listings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v" ADD CONSTRAINT "_listings_v_version_seller_id_users_id_fk" FOREIGN KEY ("version_seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v" ADD CONSTRAINT "_listings_v_version_barangay_id_barangays_id_fk" FOREIGN KEY ("version_barangay_id") REFERENCES "payload"."barangays"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v" ADD CONSTRAINT "_listings_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_listings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listings_v_rels" ADD CONSTRAINT "_listings_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests" ADD CONSTRAINT "viewing_requests_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests" ADD CONSTRAINT "viewing_requests_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests" ADD CONSTRAINT "viewing_requests_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests_rels" ADD CONSTRAINT "viewing_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."viewing_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests_rels" ADD CONSTRAINT "viewing_requests_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."viewing_requests_rels" ADD CONSTRAINT "viewing_requests_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v" ADD CONSTRAINT "_viewing_requests_v_parent_id_viewing_requests_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."viewing_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v" ADD CONSTRAINT "_viewing_requests_v_version_listing_id_listings_id_fk" FOREIGN KEY ("version_listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v" ADD CONSTRAINT "_viewing_requests_v_version_buyer_id_users_id_fk" FOREIGN KEY ("version_buyer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v" ADD CONSTRAINT "_viewing_requests_v_version_seller_id_users_id_fk" FOREIGN KEY ("version_seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v_rels" ADD CONSTRAINT "_viewing_requests_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_viewing_requests_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v_rels" ADD CONSTRAINT "_viewing_requests_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_viewing_requests_v_rels" ADD CONSTRAINT "_viewing_requests_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."messages" ADD CONSTRAINT "messages_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."messages_rels" ADD CONSTRAINT "messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."messages_rels" ADD CONSTRAINT "messages_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."messages_rels" ADD CONSTRAINT "messages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v" ADD CONSTRAINT "_messages_v_parent_id_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v" ADD CONSTRAINT "_messages_v_version_sender_id_users_id_fk" FOREIGN KEY ("version_sender_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v" ADD CONSTRAINT "_messages_v_version_recipient_id_users_id_fk" FOREIGN KEY ("version_recipient_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v" ADD CONSTRAINT "_messages_v_version_listing_id_listings_id_fk" FOREIGN KEY ("version_listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v_rels" ADD CONSTRAINT "_messages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_messages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v_rels" ADD CONSTRAINT "_messages_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_messages_v_rels" ADD CONSTRAINT "_messages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payments" ADD CONSTRAINT "payments_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payments" ADD CONSTRAINT "payments_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payments" ADD CONSTRAINT "payments_payee_id_users_id_fk" FOREIGN KEY ("payee_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payments_rels" ADD CONSTRAINT "payments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payments_rels" ADD CONSTRAINT "payments_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payments_rels" ADD CONSTRAINT "payments_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v" ADD CONSTRAINT "_payments_v_parent_id_payments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v" ADD CONSTRAINT "_payments_v_version_listing_id_listings_id_fk" FOREIGN KEY ("version_listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v" ADD CONSTRAINT "_payments_v_version_payer_id_users_id_fk" FOREIGN KEY ("version_payer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v" ADD CONSTRAINT "_payments_v_version_payee_id_users_id_fk" FOREIGN KEY ("version_payee_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v_rels" ADD CONSTRAINT "_payments_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_payments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v_rels" ADD CONSTRAINT "_payments_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_payments_v_rels" ADD CONSTRAINT "_payments_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reviews" ADD CONSTRAINT "reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."reviews" ADD CONSTRAINT "reviews_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reviews_rels" ADD CONSTRAINT "reviews_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."reviews_rels" ADD CONSTRAINT "reviews_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v" ADD CONSTRAINT "_reviews_v_version_listing_id_listings_id_fk" FOREIGN KEY ("version_listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v" ADD CONSTRAINT "_reviews_v_version_reviewer_id_users_id_fk" FOREIGN KEY ("version_reviewer_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v" ADD CONSTRAINT "_reviews_v_version_seller_id_users_id_fk" FOREIGN KEY ("version_seller_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_reviews_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_reviews_v_rels" ADD CONSTRAINT "_reviews_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."verification_submissions" ADD CONSTRAINT "verification_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."verification_submissions_rels" ADD CONSTRAINT "verification_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."verification_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."verification_submissions_rels" ADD CONSTRAINT "verification_submissions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."verification_submissions_rels" ADD CONSTRAINT "verification_submissions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_verification_submissions_v" ADD CONSTRAINT "_verification_submissions_v_parent_id_verification_submissions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."verification_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_verification_submissions_v" ADD CONSTRAINT "_verification_submissions_v_version_user_id_users_id_fk" FOREIGN KEY ("version_user_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_verification_submissions_v_rels" ADD CONSTRAINT "_verification_submissions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_verification_submissions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_verification_submissions_v_rels" ADD CONSTRAINT "_verification_submissions_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_verification_submissions_v_rels" ADD CONSTRAINT "_verification_submissions_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listing_reports" ADD CONSTRAINT "listing_reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listing_reports" ADD CONSTRAINT "listing_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."listing_reports_rels" ADD CONSTRAINT "listing_reports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."listing_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listing_reports_rels" ADD CONSTRAINT "listing_reports_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."listing_reports_rels" ADD CONSTRAINT "listing_reports_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v" ADD CONSTRAINT "_listing_reports_v_parent_id_listing_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."listing_reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v" ADD CONSTRAINT "_listing_reports_v_version_listing_id_listings_id_fk" FOREIGN KEY ("version_listing_id") REFERENCES "payload"."listings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v" ADD CONSTRAINT "_listing_reports_v_version_reporter_id_users_id_fk" FOREIGN KEY ("version_reporter_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v_rels" ADD CONSTRAINT "_listing_reports_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_listing_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v_rels" ADD CONSTRAINT "_listing_reports_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_listing_reports_v_rels" ADD CONSTRAINT "_listing_reports_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."notifications_rels" ADD CONSTRAINT "notifications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."notifications_rels" ADD CONSTRAINT "notifications_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."notifications_rels" ADD CONSTRAINT "notifications_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_notifications_v" ADD CONSTRAINT "_notifications_v_parent_id_notifications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."notifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_notifications_v" ADD CONSTRAINT "_notifications_v_version_recipient_id_users_id_fk" FOREIGN KEY ("version_recipient_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_notifications_v_rels" ADD CONSTRAINT "_notifications_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_notifications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_notifications_v_rels" ADD CONSTRAINT "_notifications_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_notifications_v_rels" ADD CONSTRAINT "_notifications_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."audit_logs_rels" ADD CONSTRAINT "audit_logs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."audit_logs_rels" ADD CONSTRAINT "audit_logs_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."audit_logs_rels" ADD CONSTRAINT "audit_logs_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_audit_logs_v" ADD CONSTRAINT "_audit_logs_v_parent_id_audit_logs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."audit_logs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_audit_logs_v_rels" ADD CONSTRAINT "_audit_logs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_audit_logs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_audit_logs_v_rels" ADD CONSTRAINT "_audit_logs_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_audit_logs_v_rels" ADD CONSTRAINT "_audit_logs_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media" ADD CONSTRAINT "media__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "payload"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_rels" ADD CONSTRAINT "media_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "payload"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_rels" ADD CONSTRAINT "media_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_media_v" ADD CONSTRAINT "_media_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "payload"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_media_v_rels" ADD CONSTRAINT "_media_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "payload"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_media_v_rels" ADD CONSTRAINT "_media_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_media_v_rels" ADD CONSTRAINT "_media_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."folders" ADD CONSTRAINT "folders__h_folders_id_folders_id_fk" FOREIGN KEY ("_h_folders_id") REFERENCES "payload"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."folders_rels" ADD CONSTRAINT "folders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."folders_rels" ADD CONSTRAINT "folders_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."folders_rels" ADD CONSTRAINT "folders_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_folders_v" ADD CONSTRAINT "_folders_v_parent_id_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_folders_v" ADD CONSTRAINT "_folders_v_version__h_folders_id_folders_id_fk" FOREIGN KEY ("version__h_folders_id") REFERENCES "payload"."folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_folders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_folders_v_rels" ADD CONSTRAINT "_folders_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tags" ADD CONSTRAINT "tags__h_tags_id_tags_id_fk" FOREIGN KEY ("_h_tags_id") REFERENCES "payload"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."tags_rels" ADD CONSTRAINT "tags_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tags_rels" ADD CONSTRAINT "tags_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tags_rels" ADD CONSTRAINT "tags_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_tags_v" ADD CONSTRAINT "_tags_v_version__h_tags_id_tags_id_fk" FOREIGN KEY ("version__h_tags_id") REFERENCES "payload"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_tags_v_rels" ADD CONSTRAINT "_tags_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_barangays_fk" FOREIGN KEY ("barangays_id") REFERENCES "payload"."barangays"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listings_fk" FOREIGN KEY ("listings_id") REFERENCES "payload"."listings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_viewing_requests_fk" FOREIGN KEY ("viewing_requests_id") REFERENCES "payload"."viewing_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "payload"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "payload"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "payload"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_submissions_fk" FOREIGN KEY ("verification_submissions_id") REFERENCES "payload"."verification_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listing_reports_fk" FOREIGN KEY ("listing_reports_id") REFERENCES "payload"."listing_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "payload"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "payload"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_folders_fk" FOREIGN KEY ("folders_id") REFERENCES "payload"."folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "payload"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "payload"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "payload"."admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "payload"."admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "payload"."admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "payload"."admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "payload"."admins" USING btree ("email");
  CREATE INDEX "admins_rels_order_idx" ON "payload"."admins_rels" USING btree ("order");
  CREATE INDEX "admins_rels_parent_idx" ON "payload"."admins_rels" USING btree ("parent_id");
  CREATE INDEX "admins_rels_path_idx" ON "payload"."admins_rels" USING btree ("path");
  CREATE INDEX "admins_rels_admins_id_idx" ON "payload"."admins_rels" USING btree ("admins_id");
  CREATE INDEX "admins_rels_users_id_idx" ON "payload"."admins_rels" USING btree ("users_id");
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_full_name_idx" ON "payload"."users" USING btree ("full_name");
  CREATE INDEX "users_role_idx" ON "payload"."users" USING btree ("role");
  CREATE INDEX "users_account_status_idx" ON "payload"."users" USING btree ("account_status");
  CREATE INDEX "users_avatar_idx" ON "payload"."users" USING btree ("avatar_id");
  CREATE UNIQUE INDEX "users_provider_id_idx" ON "payload"."users" USING btree ("provider_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "payload"."users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "payload"."users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "payload"."users_rels" USING btree ("path");
  CREATE INDEX "users_rels_listings_id_idx" ON "payload"."users_rels" USING btree ("listings_id");
  CREATE INDEX "users_rels_admins_id_idx" ON "payload"."users_rels" USING btree ("admins_id");
  CREATE INDEX "users_rels_users_id_idx" ON "payload"."users_rels" USING btree ("users_id");
  CREATE INDEX "_users_v_version_sessions_order_idx" ON "payload"."_users_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_users_v_version_sessions_parent_id_idx" ON "payload"."_users_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_users_v_parent_idx" ON "payload"."_users_v" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_version_full_name_idx" ON "payload"."_users_v" USING btree ("version_full_name");
  CREATE INDEX "_users_v_version_version_role_idx" ON "payload"."_users_v" USING btree ("version_role");
  CREATE INDEX "_users_v_version_version_account_status_idx" ON "payload"."_users_v" USING btree ("version_account_status");
  CREATE INDEX "_users_v_version_version_avatar_idx" ON "payload"."_users_v" USING btree ("version_avatar_id");
  CREATE INDEX "_users_v_version_version_provider_id_idx" ON "payload"."_users_v" USING btree ("version_provider_id");
  CREATE INDEX "_users_v_version_version_updated_at_idx" ON "payload"."_users_v" USING btree ("version_updated_at");
  CREATE INDEX "_users_v_version_version_created_at_idx" ON "payload"."_users_v" USING btree ("version_created_at");
  CREATE INDEX "_users_v_version_version_email_idx" ON "payload"."_users_v" USING btree ("version_email");
  CREATE INDEX "_users_v_created_at_idx" ON "payload"."_users_v" USING btree ("created_at");
  CREATE INDEX "_users_v_updated_at_idx" ON "payload"."_users_v" USING btree ("updated_at");
  CREATE INDEX "_users_v_rels_order_idx" ON "payload"."_users_v_rels" USING btree ("order");
  CREATE INDEX "_users_v_rels_parent_idx" ON "payload"."_users_v_rels" USING btree ("parent_id");
  CREATE INDEX "_users_v_rels_path_idx" ON "payload"."_users_v_rels" USING btree ("path");
  CREATE INDEX "_users_v_rels_listings_id_idx" ON "payload"."_users_v_rels" USING btree ("listings_id");
  CREATE INDEX "_users_v_rels_admins_id_idx" ON "payload"."_users_v_rels" USING btree ("admins_id");
  CREATE INDEX "_users_v_rels_users_id_idx" ON "payload"."_users_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "barangays_name_idx" ON "payload"."barangays" USING btree ("name");
  CREATE UNIQUE INDEX "barangays_slug_idx" ON "payload"."barangays" USING btree ("slug");
  CREATE INDEX "barangays_updated_at_idx" ON "payload"."barangays" USING btree ("updated_at");
  CREATE INDEX "barangays_created_at_idx" ON "payload"."barangays" USING btree ("created_at");
  CREATE INDEX "barangays_rels_order_idx" ON "payload"."barangays_rels" USING btree ("order");
  CREATE INDEX "barangays_rels_parent_idx" ON "payload"."barangays_rels" USING btree ("parent_id");
  CREATE INDEX "barangays_rels_path_idx" ON "payload"."barangays_rels" USING btree ("path");
  CREATE INDEX "barangays_rels_admins_id_idx" ON "payload"."barangays_rels" USING btree ("admins_id");
  CREATE INDEX "barangays_rels_users_id_idx" ON "payload"."barangays_rels" USING btree ("users_id");
  CREATE INDEX "_barangays_v_parent_idx" ON "payload"."_barangays_v" USING btree ("parent_id");
  CREATE INDEX "_barangays_v_version_version_name_idx" ON "payload"."_barangays_v" USING btree ("version_name");
  CREATE INDEX "_barangays_v_version_version_slug_idx" ON "payload"."_barangays_v" USING btree ("version_slug");
  CREATE INDEX "_barangays_v_version_version_updated_at_idx" ON "payload"."_barangays_v" USING btree ("version_updated_at");
  CREATE INDEX "_barangays_v_version_version_created_at_idx" ON "payload"."_barangays_v" USING btree ("version_created_at");
  CREATE INDEX "_barangays_v_created_at_idx" ON "payload"."_barangays_v" USING btree ("created_at");
  CREATE INDEX "_barangays_v_updated_at_idx" ON "payload"."_barangays_v" USING btree ("updated_at");
  CREATE INDEX "_barangays_v_rels_order_idx" ON "payload"."_barangays_v_rels" USING btree ("order");
  CREATE INDEX "_barangays_v_rels_parent_idx" ON "payload"."_barangays_v_rels" USING btree ("parent_id");
  CREATE INDEX "_barangays_v_rels_path_idx" ON "payload"."_barangays_v_rels" USING btree ("path");
  CREATE INDEX "_barangays_v_rels_admins_id_idx" ON "payload"."_barangays_v_rels" USING btree ("admins_id");
  CREATE INDEX "_barangays_v_rels_users_id_idx" ON "payload"."_barangays_v_rels" USING btree ("users_id");
  CREATE INDEX "listings_gallery_order_idx" ON "payload"."listings_gallery" USING btree ("_order");
  CREATE INDEX "listings_gallery_parent_id_idx" ON "payload"."listings_gallery" USING btree ("_parent_id");
  CREATE INDEX "listings_gallery_image_idx" ON "payload"."listings_gallery" USING btree ("image_id");
  CREATE INDEX "listings_amenities_order_idx" ON "payload"."listings_amenities" USING btree ("_order");
  CREATE INDEX "listings_amenities_parent_id_idx" ON "payload"."listings_amenities" USING btree ("_parent_id");
  CREATE INDEX "listings_title_idx" ON "payload"."listings" USING btree ("title");
  CREATE UNIQUE INDEX "listings_slug_idx" ON "payload"."listings" USING btree ("slug");
  CREATE INDEX "listings_status_idx" ON "payload"."listings" USING btree ("status");
  CREATE INDEX "listings_seller_idx" ON "payload"."listings" USING btree ("seller_id");
  CREATE INDEX "listings_property_type_idx" ON "payload"."listings" USING btree ("property_type");
  CREATE INDEX "listings_listing_type_idx" ON "payload"."listings" USING btree ("listing_type");
  CREATE INDEX "listings_price_idx" ON "payload"."listings" USING btree ("price");
  CREATE INDEX "listings_barangay_idx" ON "payload"."listings" USING btree ("barangay_id");
  CREATE INDEX "listings_cover_image_idx" ON "payload"."listings" USING btree ("cover_image_id");
  CREATE INDEX "listings_updated_at_idx" ON "payload"."listings" USING btree ("updated_at");
  CREATE INDEX "listings_created_at_idx" ON "payload"."listings" USING btree ("created_at");
  CREATE INDEX "listings_rels_order_idx" ON "payload"."listings_rels" USING btree ("order");
  CREATE INDEX "listings_rels_parent_idx" ON "payload"."listings_rels" USING btree ("parent_id");
  CREATE INDEX "listings_rels_path_idx" ON "payload"."listings_rels" USING btree ("path");
  CREATE INDEX "listings_rels_admins_id_idx" ON "payload"."listings_rels" USING btree ("admins_id");
  CREATE INDEX "listings_rels_users_id_idx" ON "payload"."listings_rels" USING btree ("users_id");
  CREATE INDEX "_listings_v_version_gallery_order_idx" ON "payload"."_listings_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_listings_v_version_gallery_parent_id_idx" ON "payload"."_listings_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_version_gallery_image_idx" ON "payload"."_listings_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_listings_v_version_amenities_order_idx" ON "payload"."_listings_v_version_amenities" USING btree ("_order");
  CREATE INDEX "_listings_v_version_amenities_parent_id_idx" ON "payload"."_listings_v_version_amenities" USING btree ("_parent_id");
  CREATE INDEX "_listings_v_parent_idx" ON "payload"."_listings_v" USING btree ("parent_id");
  CREATE INDEX "_listings_v_version_version_title_idx" ON "payload"."_listings_v" USING btree ("version_title");
  CREATE INDEX "_listings_v_version_version_slug_idx" ON "payload"."_listings_v" USING btree ("version_slug");
  CREATE INDEX "_listings_v_version_version_status_idx" ON "payload"."_listings_v" USING btree ("version_status");
  CREATE INDEX "_listings_v_version_version_seller_idx" ON "payload"."_listings_v" USING btree ("version_seller_id");
  CREATE INDEX "_listings_v_version_version_property_type_idx" ON "payload"."_listings_v" USING btree ("version_property_type");
  CREATE INDEX "_listings_v_version_version_listing_type_idx" ON "payload"."_listings_v" USING btree ("version_listing_type");
  CREATE INDEX "_listings_v_version_version_price_idx" ON "payload"."_listings_v" USING btree ("version_price");
  CREATE INDEX "_listings_v_version_version_barangay_idx" ON "payload"."_listings_v" USING btree ("version_barangay_id");
  CREATE INDEX "_listings_v_version_version_cover_image_idx" ON "payload"."_listings_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_listings_v_version_version_updated_at_idx" ON "payload"."_listings_v" USING btree ("version_updated_at");
  CREATE INDEX "_listings_v_version_version_created_at_idx" ON "payload"."_listings_v" USING btree ("version_created_at");
  CREATE INDEX "_listings_v_created_at_idx" ON "payload"."_listings_v" USING btree ("created_at");
  CREATE INDEX "_listings_v_updated_at_idx" ON "payload"."_listings_v" USING btree ("updated_at");
  CREATE INDEX "_listings_v_rels_order_idx" ON "payload"."_listings_v_rels" USING btree ("order");
  CREATE INDEX "_listings_v_rels_parent_idx" ON "payload"."_listings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_listings_v_rels_path_idx" ON "payload"."_listings_v_rels" USING btree ("path");
  CREATE INDEX "_listings_v_rels_admins_id_idx" ON "payload"."_listings_v_rels" USING btree ("admins_id");
  CREATE INDEX "_listings_v_rels_users_id_idx" ON "payload"."_listings_v_rels" USING btree ("users_id");
  CREATE INDEX "viewing_requests_listing_idx" ON "payload"."viewing_requests" USING btree ("listing_id");
  CREATE INDEX "viewing_requests_buyer_idx" ON "payload"."viewing_requests" USING btree ("buyer_id");
  CREATE INDEX "viewing_requests_seller_idx" ON "payload"."viewing_requests" USING btree ("seller_id");
  CREATE INDEX "viewing_requests_updated_at_idx" ON "payload"."viewing_requests" USING btree ("updated_at");
  CREATE INDEX "viewing_requests_created_at_idx" ON "payload"."viewing_requests" USING btree ("created_at");
  CREATE INDEX "viewing_requests_rels_order_idx" ON "payload"."viewing_requests_rels" USING btree ("order");
  CREATE INDEX "viewing_requests_rels_parent_idx" ON "payload"."viewing_requests_rels" USING btree ("parent_id");
  CREATE INDEX "viewing_requests_rels_path_idx" ON "payload"."viewing_requests_rels" USING btree ("path");
  CREATE INDEX "viewing_requests_rels_admins_id_idx" ON "payload"."viewing_requests_rels" USING btree ("admins_id");
  CREATE INDEX "viewing_requests_rels_users_id_idx" ON "payload"."viewing_requests_rels" USING btree ("users_id");
  CREATE INDEX "_viewing_requests_v_parent_idx" ON "payload"."_viewing_requests_v" USING btree ("parent_id");
  CREATE INDEX "_viewing_requests_v_version_version_listing_idx" ON "payload"."_viewing_requests_v" USING btree ("version_listing_id");
  CREATE INDEX "_viewing_requests_v_version_version_buyer_idx" ON "payload"."_viewing_requests_v" USING btree ("version_buyer_id");
  CREATE INDEX "_viewing_requests_v_version_version_seller_idx" ON "payload"."_viewing_requests_v" USING btree ("version_seller_id");
  CREATE INDEX "_viewing_requests_v_version_version_updated_at_idx" ON "payload"."_viewing_requests_v" USING btree ("version_updated_at");
  CREATE INDEX "_viewing_requests_v_version_version_created_at_idx" ON "payload"."_viewing_requests_v" USING btree ("version_created_at");
  CREATE INDEX "_viewing_requests_v_created_at_idx" ON "payload"."_viewing_requests_v" USING btree ("created_at");
  CREATE INDEX "_viewing_requests_v_updated_at_idx" ON "payload"."_viewing_requests_v" USING btree ("updated_at");
  CREATE INDEX "_viewing_requests_v_rels_order_idx" ON "payload"."_viewing_requests_v_rels" USING btree ("order");
  CREATE INDEX "_viewing_requests_v_rels_parent_idx" ON "payload"."_viewing_requests_v_rels" USING btree ("parent_id");
  CREATE INDEX "_viewing_requests_v_rels_path_idx" ON "payload"."_viewing_requests_v_rels" USING btree ("path");
  CREATE INDEX "_viewing_requests_v_rels_admins_id_idx" ON "payload"."_viewing_requests_v_rels" USING btree ("admins_id");
  CREATE INDEX "_viewing_requests_v_rels_users_id_idx" ON "payload"."_viewing_requests_v_rels" USING btree ("users_id");
  CREATE INDEX "messages_sender_idx" ON "payload"."messages" USING btree ("sender_id");
  CREATE INDEX "messages_recipient_idx" ON "payload"."messages" USING btree ("recipient_id");
  CREATE INDEX "messages_listing_idx" ON "payload"."messages" USING btree ("listing_id");
  CREATE INDEX "messages_updated_at_idx" ON "payload"."messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "payload"."messages" USING btree ("created_at");
  CREATE INDEX "messages_rels_order_idx" ON "payload"."messages_rels" USING btree ("order");
  CREATE INDEX "messages_rels_parent_idx" ON "payload"."messages_rels" USING btree ("parent_id");
  CREATE INDEX "messages_rels_path_idx" ON "payload"."messages_rels" USING btree ("path");
  CREATE INDEX "messages_rels_admins_id_idx" ON "payload"."messages_rels" USING btree ("admins_id");
  CREATE INDEX "messages_rels_users_id_idx" ON "payload"."messages_rels" USING btree ("users_id");
  CREATE INDEX "_messages_v_parent_idx" ON "payload"."_messages_v" USING btree ("parent_id");
  CREATE INDEX "_messages_v_version_version_sender_idx" ON "payload"."_messages_v" USING btree ("version_sender_id");
  CREATE INDEX "_messages_v_version_version_recipient_idx" ON "payload"."_messages_v" USING btree ("version_recipient_id");
  CREATE INDEX "_messages_v_version_version_listing_idx" ON "payload"."_messages_v" USING btree ("version_listing_id");
  CREATE INDEX "_messages_v_version_version_updated_at_idx" ON "payload"."_messages_v" USING btree ("version_updated_at");
  CREATE INDEX "_messages_v_version_version_created_at_idx" ON "payload"."_messages_v" USING btree ("version_created_at");
  CREATE INDEX "_messages_v_created_at_idx" ON "payload"."_messages_v" USING btree ("created_at");
  CREATE INDEX "_messages_v_updated_at_idx" ON "payload"."_messages_v" USING btree ("updated_at");
  CREATE INDEX "_messages_v_rels_order_idx" ON "payload"."_messages_v_rels" USING btree ("order");
  CREATE INDEX "_messages_v_rels_parent_idx" ON "payload"."_messages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_messages_v_rels_path_idx" ON "payload"."_messages_v_rels" USING btree ("path");
  CREATE INDEX "_messages_v_rels_admins_id_idx" ON "payload"."_messages_v_rels" USING btree ("admins_id");
  CREATE INDEX "_messages_v_rels_users_id_idx" ON "payload"."_messages_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payments_reference_code_idx" ON "payload"."payments" USING btree ("reference_code");
  CREATE INDEX "payments_listing_idx" ON "payload"."payments" USING btree ("listing_id");
  CREATE INDEX "payments_payer_idx" ON "payload"."payments" USING btree ("payer_id");
  CREATE INDEX "payments_payee_idx" ON "payload"."payments" USING btree ("payee_id");
  CREATE INDEX "payments_status_idx" ON "payload"."payments" USING btree ("status");
  CREATE INDEX "payments_updated_at_idx" ON "payload"."payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payload"."payments" USING btree ("created_at");
  CREATE INDEX "payments_rels_order_idx" ON "payload"."payments_rels" USING btree ("order");
  CREATE INDEX "payments_rels_parent_idx" ON "payload"."payments_rels" USING btree ("parent_id");
  CREATE INDEX "payments_rels_path_idx" ON "payload"."payments_rels" USING btree ("path");
  CREATE INDEX "payments_rels_admins_id_idx" ON "payload"."payments_rels" USING btree ("admins_id");
  CREATE INDEX "payments_rels_users_id_idx" ON "payload"."payments_rels" USING btree ("users_id");
  CREATE INDEX "_payments_v_parent_idx" ON "payload"."_payments_v" USING btree ("parent_id");
  CREATE INDEX "_payments_v_version_version_reference_code_idx" ON "payload"."_payments_v" USING btree ("version_reference_code");
  CREATE INDEX "_payments_v_version_version_listing_idx" ON "payload"."_payments_v" USING btree ("version_listing_id");
  CREATE INDEX "_payments_v_version_version_payer_idx" ON "payload"."_payments_v" USING btree ("version_payer_id");
  CREATE INDEX "_payments_v_version_version_payee_idx" ON "payload"."_payments_v" USING btree ("version_payee_id");
  CREATE INDEX "_payments_v_version_version_status_idx" ON "payload"."_payments_v" USING btree ("version_status");
  CREATE INDEX "_payments_v_version_version_updated_at_idx" ON "payload"."_payments_v" USING btree ("version_updated_at");
  CREATE INDEX "_payments_v_version_version_created_at_idx" ON "payload"."_payments_v" USING btree ("version_created_at");
  CREATE INDEX "_payments_v_created_at_idx" ON "payload"."_payments_v" USING btree ("created_at");
  CREATE INDEX "_payments_v_updated_at_idx" ON "payload"."_payments_v" USING btree ("updated_at");
  CREATE INDEX "_payments_v_rels_order_idx" ON "payload"."_payments_v_rels" USING btree ("order");
  CREATE INDEX "_payments_v_rels_parent_idx" ON "payload"."_payments_v_rels" USING btree ("parent_id");
  CREATE INDEX "_payments_v_rels_path_idx" ON "payload"."_payments_v_rels" USING btree ("path");
  CREATE INDEX "_payments_v_rels_admins_id_idx" ON "payload"."_payments_v_rels" USING btree ("admins_id");
  CREATE INDEX "_payments_v_rels_users_id_idx" ON "payload"."_payments_v_rels" USING btree ("users_id");
  CREATE INDEX "reviews_listing_idx" ON "payload"."reviews" USING btree ("listing_id");
  CREATE INDEX "reviews_reviewer_idx" ON "payload"."reviews" USING btree ("reviewer_id");
  CREATE INDEX "reviews_seller_idx" ON "payload"."reviews" USING btree ("seller_id");
  CREATE INDEX "reviews_updated_at_idx" ON "payload"."reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "payload"."reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "payload"."reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "payload"."reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "payload"."reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_admins_id_idx" ON "payload"."reviews_rels" USING btree ("admins_id");
  CREATE INDEX "reviews_rels_users_id_idx" ON "payload"."reviews_rels" USING btree ("users_id");
  CREATE INDEX "_reviews_v_parent_idx" ON "payload"."_reviews_v" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_version_version_listing_idx" ON "payload"."_reviews_v" USING btree ("version_listing_id");
  CREATE INDEX "_reviews_v_version_version_reviewer_idx" ON "payload"."_reviews_v" USING btree ("version_reviewer_id");
  CREATE INDEX "_reviews_v_version_version_seller_idx" ON "payload"."_reviews_v" USING btree ("version_seller_id");
  CREATE INDEX "_reviews_v_version_version_updated_at_idx" ON "payload"."_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX "_reviews_v_version_version_created_at_idx" ON "payload"."_reviews_v" USING btree ("version_created_at");
  CREATE INDEX "_reviews_v_created_at_idx" ON "payload"."_reviews_v" USING btree ("created_at");
  CREATE INDEX "_reviews_v_updated_at_idx" ON "payload"."_reviews_v" USING btree ("updated_at");
  CREATE INDEX "_reviews_v_rels_order_idx" ON "payload"."_reviews_v_rels" USING btree ("order");
  CREATE INDEX "_reviews_v_rels_parent_idx" ON "payload"."_reviews_v_rels" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_rels_path_idx" ON "payload"."_reviews_v_rels" USING btree ("path");
  CREATE INDEX "_reviews_v_rels_admins_id_idx" ON "payload"."_reviews_v_rels" USING btree ("admins_id");
  CREATE INDEX "_reviews_v_rels_users_id_idx" ON "payload"."_reviews_v_rels" USING btree ("users_id");
  CREATE INDEX "verification_submissions_user_idx" ON "payload"."verification_submissions" USING btree ("user_id");
  CREATE INDEX "verification_submissions_updated_at_idx" ON "payload"."verification_submissions" USING btree ("updated_at");
  CREATE INDEX "verification_submissions_created_at_idx" ON "payload"."verification_submissions" USING btree ("created_at");
  CREATE INDEX "verification_submissions_rels_order_idx" ON "payload"."verification_submissions_rels" USING btree ("order");
  CREATE INDEX "verification_submissions_rels_parent_idx" ON "payload"."verification_submissions_rels" USING btree ("parent_id");
  CREATE INDEX "verification_submissions_rels_path_idx" ON "payload"."verification_submissions_rels" USING btree ("path");
  CREATE INDEX "verification_submissions_rels_admins_id_idx" ON "payload"."verification_submissions_rels" USING btree ("admins_id");
  CREATE INDEX "verification_submissions_rels_users_id_idx" ON "payload"."verification_submissions_rels" USING btree ("users_id");
  CREATE INDEX "_verification_submissions_v_parent_idx" ON "payload"."_verification_submissions_v" USING btree ("parent_id");
  CREATE INDEX "_verification_submissions_v_version_version_user_idx" ON "payload"."_verification_submissions_v" USING btree ("version_user_id");
  CREATE INDEX "_verification_submissions_v_version_version_updated_at_idx" ON "payload"."_verification_submissions_v" USING btree ("version_updated_at");
  CREATE INDEX "_verification_submissions_v_version_version_created_at_idx" ON "payload"."_verification_submissions_v" USING btree ("version_created_at");
  CREATE INDEX "_verification_submissions_v_created_at_idx" ON "payload"."_verification_submissions_v" USING btree ("created_at");
  CREATE INDEX "_verification_submissions_v_updated_at_idx" ON "payload"."_verification_submissions_v" USING btree ("updated_at");
  CREATE INDEX "_verification_submissions_v_rels_order_idx" ON "payload"."_verification_submissions_v_rels" USING btree ("order");
  CREATE INDEX "_verification_submissions_v_rels_parent_idx" ON "payload"."_verification_submissions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_verification_submissions_v_rels_path_idx" ON "payload"."_verification_submissions_v_rels" USING btree ("path");
  CREATE INDEX "_verification_submissions_v_rels_admins_id_idx" ON "payload"."_verification_submissions_v_rels" USING btree ("admins_id");
  CREATE INDEX "_verification_submissions_v_rels_users_id_idx" ON "payload"."_verification_submissions_v_rels" USING btree ("users_id");
  CREATE INDEX "listing_reports_listing_idx" ON "payload"."listing_reports" USING btree ("listing_id");
  CREATE INDEX "listing_reports_reporter_idx" ON "payload"."listing_reports" USING btree ("reporter_id");
  CREATE INDEX "listing_reports_updated_at_idx" ON "payload"."listing_reports" USING btree ("updated_at");
  CREATE INDEX "listing_reports_created_at_idx" ON "payload"."listing_reports" USING btree ("created_at");
  CREATE INDEX "listing_reports_rels_order_idx" ON "payload"."listing_reports_rels" USING btree ("order");
  CREATE INDEX "listing_reports_rels_parent_idx" ON "payload"."listing_reports_rels" USING btree ("parent_id");
  CREATE INDEX "listing_reports_rels_path_idx" ON "payload"."listing_reports_rels" USING btree ("path");
  CREATE INDEX "listing_reports_rels_admins_id_idx" ON "payload"."listing_reports_rels" USING btree ("admins_id");
  CREATE INDEX "listing_reports_rels_users_id_idx" ON "payload"."listing_reports_rels" USING btree ("users_id");
  CREATE INDEX "_listing_reports_v_parent_idx" ON "payload"."_listing_reports_v" USING btree ("parent_id");
  CREATE INDEX "_listing_reports_v_version_version_listing_idx" ON "payload"."_listing_reports_v" USING btree ("version_listing_id");
  CREATE INDEX "_listing_reports_v_version_version_reporter_idx" ON "payload"."_listing_reports_v" USING btree ("version_reporter_id");
  CREATE INDEX "_listing_reports_v_version_version_updated_at_idx" ON "payload"."_listing_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_listing_reports_v_version_version_created_at_idx" ON "payload"."_listing_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_listing_reports_v_created_at_idx" ON "payload"."_listing_reports_v" USING btree ("created_at");
  CREATE INDEX "_listing_reports_v_updated_at_idx" ON "payload"."_listing_reports_v" USING btree ("updated_at");
  CREATE INDEX "_listing_reports_v_rels_order_idx" ON "payload"."_listing_reports_v_rels" USING btree ("order");
  CREATE INDEX "_listing_reports_v_rels_parent_idx" ON "payload"."_listing_reports_v_rels" USING btree ("parent_id");
  CREATE INDEX "_listing_reports_v_rels_path_idx" ON "payload"."_listing_reports_v_rels" USING btree ("path");
  CREATE INDEX "_listing_reports_v_rels_admins_id_idx" ON "payload"."_listing_reports_v_rels" USING btree ("admins_id");
  CREATE INDEX "_listing_reports_v_rels_users_id_idx" ON "payload"."_listing_reports_v_rels" USING btree ("users_id");
  CREATE INDEX "notifications_recipient_idx" ON "payload"."notifications" USING btree ("recipient_id");
  CREATE INDEX "notifications_updated_at_idx" ON "payload"."notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "payload"."notifications" USING btree ("created_at");
  CREATE INDEX "notifications_rels_order_idx" ON "payload"."notifications_rels" USING btree ("order");
  CREATE INDEX "notifications_rels_parent_idx" ON "payload"."notifications_rels" USING btree ("parent_id");
  CREATE INDEX "notifications_rels_path_idx" ON "payload"."notifications_rels" USING btree ("path");
  CREATE INDEX "notifications_rels_admins_id_idx" ON "payload"."notifications_rels" USING btree ("admins_id");
  CREATE INDEX "notifications_rels_users_id_idx" ON "payload"."notifications_rels" USING btree ("users_id");
  CREATE INDEX "_notifications_v_parent_idx" ON "payload"."_notifications_v" USING btree ("parent_id");
  CREATE INDEX "_notifications_v_version_version_recipient_idx" ON "payload"."_notifications_v" USING btree ("version_recipient_id");
  CREATE INDEX "_notifications_v_version_version_updated_at_idx" ON "payload"."_notifications_v" USING btree ("version_updated_at");
  CREATE INDEX "_notifications_v_version_version_created_at_idx" ON "payload"."_notifications_v" USING btree ("version_created_at");
  CREATE INDEX "_notifications_v_created_at_idx" ON "payload"."_notifications_v" USING btree ("created_at");
  CREATE INDEX "_notifications_v_updated_at_idx" ON "payload"."_notifications_v" USING btree ("updated_at");
  CREATE INDEX "_notifications_v_rels_order_idx" ON "payload"."_notifications_v_rels" USING btree ("order");
  CREATE INDEX "_notifications_v_rels_parent_idx" ON "payload"."_notifications_v_rels" USING btree ("parent_id");
  CREATE INDEX "_notifications_v_rels_path_idx" ON "payload"."_notifications_v_rels" USING btree ("path");
  CREATE INDEX "_notifications_v_rels_admins_id_idx" ON "payload"."_notifications_v_rels" USING btree ("admins_id");
  CREATE INDEX "_notifications_v_rels_users_id_idx" ON "payload"."_notifications_v_rels" USING btree ("users_id");
  CREATE INDEX "audit_logs_action_idx" ON "payload"."audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_updated_at_idx" ON "payload"."audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "payload"."audit_logs" USING btree ("created_at");
  CREATE INDEX "audit_logs_rels_order_idx" ON "payload"."audit_logs_rels" USING btree ("order");
  CREATE INDEX "audit_logs_rels_parent_idx" ON "payload"."audit_logs_rels" USING btree ("parent_id");
  CREATE INDEX "audit_logs_rels_path_idx" ON "payload"."audit_logs_rels" USING btree ("path");
  CREATE INDEX "audit_logs_rels_admins_id_idx" ON "payload"."audit_logs_rels" USING btree ("admins_id");
  CREATE INDEX "audit_logs_rels_users_id_idx" ON "payload"."audit_logs_rels" USING btree ("users_id");
  CREATE INDEX "_audit_logs_v_parent_idx" ON "payload"."_audit_logs_v" USING btree ("parent_id");
  CREATE INDEX "_audit_logs_v_version_version_action_idx" ON "payload"."_audit_logs_v" USING btree ("version_action");
  CREATE INDEX "_audit_logs_v_version_version_updated_at_idx" ON "payload"."_audit_logs_v" USING btree ("version_updated_at");
  CREATE INDEX "_audit_logs_v_version_version_created_at_idx" ON "payload"."_audit_logs_v" USING btree ("version_created_at");
  CREATE INDEX "_audit_logs_v_created_at_idx" ON "payload"."_audit_logs_v" USING btree ("created_at");
  CREATE INDEX "_audit_logs_v_updated_at_idx" ON "payload"."_audit_logs_v" USING btree ("updated_at");
  CREATE INDEX "_audit_logs_v_rels_order_idx" ON "payload"."_audit_logs_v_rels" USING btree ("order");
  CREATE INDEX "_audit_logs_v_rels_parent_idx" ON "payload"."_audit_logs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_audit_logs_v_rels_path_idx" ON "payload"."_audit_logs_v_rels" USING btree ("path");
  CREATE INDEX "_audit_logs_v_rels_admins_id_idx" ON "payload"."_audit_logs_v_rels" USING btree ("admins_id");
  CREATE INDEX "_audit_logs_v_rels_users_id_idx" ON "payload"."_audit_logs_v_rels" USING btree ("users_id");
  CREATE INDEX "media__h_folders_idx" ON "payload"."media" USING btree ("_h_folders_id");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "payload"."media" USING btree ("original_filename");
  CREATE INDEX "media_rels_order_idx" ON "payload"."media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "payload"."media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "payload"."media_rels" USING btree ("path");
  CREATE INDEX "media_rels_tags_id_idx" ON "payload"."media_rels" USING btree ("tags_id");
  CREATE INDEX "media_rels_admins_id_idx" ON "payload"."media_rels" USING btree ("admins_id");
  CREATE INDEX "media_rels_users_id_idx" ON "payload"."media_rels" USING btree ("users_id");
  CREATE INDEX "_media_v_parent_idx" ON "payload"."_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version__h_folders_idx" ON "payload"."_media_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "payload"."_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "payload"."_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "payload"."_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "payload"."_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "payload"."_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "payload"."_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "payload"."_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "payload"."_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "payload"."_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_tags_id_idx" ON "payload"."_media_v_rels" USING btree ("tags_id");
  CREATE INDEX "_media_v_rels_admins_id_idx" ON "payload"."_media_v_rels" USING btree ("admins_id");
  CREATE INDEX "_media_v_rels_users_id_idx" ON "payload"."_media_v_rels" USING btree ("users_id");
  CREATE INDEX "folders__h_folders_idx" ON "payload"."folders" USING btree ("_h_folders_id");
  CREATE INDEX "folders_updated_at_idx" ON "payload"."folders" USING btree ("updated_at");
  CREATE INDEX "folders_created_at_idx" ON "payload"."folders" USING btree ("created_at");
  CREATE INDEX "folders_rels_order_idx" ON "payload"."folders_rels" USING btree ("order");
  CREATE INDEX "folders_rels_parent_idx" ON "payload"."folders_rels" USING btree ("parent_id");
  CREATE INDEX "folders_rels_path_idx" ON "payload"."folders_rels" USING btree ("path");
  CREATE INDEX "folders_rels_admins_id_idx" ON "payload"."folders_rels" USING btree ("admins_id");
  CREATE INDEX "folders_rels_users_id_idx" ON "payload"."folders_rels" USING btree ("users_id");
  CREATE INDEX "_folders_v_parent_idx" ON "payload"."_folders_v" USING btree ("parent_id");
  CREATE INDEX "_folders_v_version_version__h_folders_idx" ON "payload"."_folders_v" USING btree ("version__h_folders_id");
  CREATE INDEX "_folders_v_version_version_updated_at_idx" ON "payload"."_folders_v" USING btree ("version_updated_at");
  CREATE INDEX "_folders_v_version_version_created_at_idx" ON "payload"."_folders_v" USING btree ("version_created_at");
  CREATE INDEX "_folders_v_created_at_idx" ON "payload"."_folders_v" USING btree ("created_at");
  CREATE INDEX "_folders_v_updated_at_idx" ON "payload"."_folders_v" USING btree ("updated_at");
  CREATE INDEX "_folders_v_rels_order_idx" ON "payload"."_folders_v_rels" USING btree ("order");
  CREATE INDEX "_folders_v_rels_parent_idx" ON "payload"."_folders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_folders_v_rels_path_idx" ON "payload"."_folders_v_rels" USING btree ("path");
  CREATE INDEX "_folders_v_rels_admins_id_idx" ON "payload"."_folders_v_rels" USING btree ("admins_id");
  CREATE INDEX "_folders_v_rels_users_id_idx" ON "payload"."_folders_v_rels" USING btree ("users_id");
  CREATE INDEX "tags__h_tags_idx" ON "payload"."tags" USING btree ("_h_tags_id");
  CREATE INDEX "tags_updated_at_idx" ON "payload"."tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "payload"."tags" USING btree ("created_at");
  CREATE INDEX "tags_rels_order_idx" ON "payload"."tags_rels" USING btree ("order");
  CREATE INDEX "tags_rels_parent_idx" ON "payload"."tags_rels" USING btree ("parent_id");
  CREATE INDEX "tags_rels_path_idx" ON "payload"."tags_rels" USING btree ("path");
  CREATE INDEX "tags_rels_admins_id_idx" ON "payload"."tags_rels" USING btree ("admins_id");
  CREATE INDEX "tags_rels_users_id_idx" ON "payload"."tags_rels" USING btree ("users_id");
  CREATE INDEX "_tags_v_parent_idx" ON "payload"."_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_version__h_tags_idx" ON "payload"."_tags_v" USING btree ("version__h_tags_id");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "payload"."_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "payload"."_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "payload"."_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "payload"."_tags_v" USING btree ("updated_at");
  CREATE INDEX "_tags_v_rels_order_idx" ON "payload"."_tags_v_rels" USING btree ("order");
  CREATE INDEX "_tags_v_rels_parent_idx" ON "payload"."_tags_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tags_v_rels_path_idx" ON "payload"."_tags_v_rels" USING btree ("path");
  CREATE INDEX "_tags_v_rels_admins_id_idx" ON "payload"."_tags_v_rels" USING btree ("admins_id");
  CREATE INDEX "_tags_v_rels_users_id_idx" ON "payload"."_tags_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_barangays_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("barangays_id");
  CREATE INDEX "payload_locked_documents_rels_listings_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("listings_id");
  CREATE INDEX "payload_locked_documents_rels_viewing_requests_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("viewing_requests_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_verification_submissions_i_idx" ON "payload"."payload_locked_documents_rels" USING btree ("verification_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_listing_reports_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("listing_reports_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_folders_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("folders_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload"."payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload"."payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload"."payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload"."payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload"."payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload"."payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload"."payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_admins_id_idx" ON "payload"."payload_llm_instructions_rels" USING btree ("admins_id");
  CREATE INDEX "payload_llm_instructions_rels_users_id_idx" ON "payload"."payload_llm_instructions_rels" USING btree ("users_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."admins_sessions" CASCADE;
  DROP TABLE "payload"."admins" CASCADE;
  DROP TABLE "payload"."admins_rels" CASCADE;
  DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."users_rels" CASCADE;
  DROP TABLE "payload"."_users_v_version_sessions" CASCADE;
  DROP TABLE "payload"."_users_v" CASCADE;
  DROP TABLE "payload"."_users_v_rels" CASCADE;
  DROP TABLE "payload"."barangays" CASCADE;
  DROP TABLE "payload"."barangays_rels" CASCADE;
  DROP TABLE "payload"."_barangays_v" CASCADE;
  DROP TABLE "payload"."_barangays_v_rels" CASCADE;
  DROP TABLE "payload"."listings_gallery" CASCADE;
  DROP TABLE "payload"."listings_amenities" CASCADE;
  DROP TABLE "payload"."listings" CASCADE;
  DROP TABLE "payload"."listings_rels" CASCADE;
  DROP TABLE "payload"."_listings_v_version_gallery" CASCADE;
  DROP TABLE "payload"."_listings_v_version_amenities" CASCADE;
  DROP TABLE "payload"."_listings_v" CASCADE;
  DROP TABLE "payload"."_listings_v_rels" CASCADE;
  DROP TABLE "payload"."viewing_requests" CASCADE;
  DROP TABLE "payload"."viewing_requests_rels" CASCADE;
  DROP TABLE "payload"."_viewing_requests_v" CASCADE;
  DROP TABLE "payload"."_viewing_requests_v_rels" CASCADE;
  DROP TABLE "payload"."messages" CASCADE;
  DROP TABLE "payload"."messages_rels" CASCADE;
  DROP TABLE "payload"."_messages_v" CASCADE;
  DROP TABLE "payload"."_messages_v_rels" CASCADE;
  DROP TABLE "payload"."payments" CASCADE;
  DROP TABLE "payload"."payments_rels" CASCADE;
  DROP TABLE "payload"."_payments_v" CASCADE;
  DROP TABLE "payload"."_payments_v_rels" CASCADE;
  DROP TABLE "payload"."reviews" CASCADE;
  DROP TABLE "payload"."reviews_rels" CASCADE;
  DROP TABLE "payload"."_reviews_v" CASCADE;
  DROP TABLE "payload"."_reviews_v_rels" CASCADE;
  DROP TABLE "payload"."verification_submissions" CASCADE;
  DROP TABLE "payload"."verification_submissions_rels" CASCADE;
  DROP TABLE "payload"."_verification_submissions_v" CASCADE;
  DROP TABLE "payload"."_verification_submissions_v_rels" CASCADE;
  DROP TABLE "payload"."listing_reports" CASCADE;
  DROP TABLE "payload"."listing_reports_rels" CASCADE;
  DROP TABLE "payload"."_listing_reports_v" CASCADE;
  DROP TABLE "payload"."_listing_reports_v_rels" CASCADE;
  DROP TABLE "payload"."notifications" CASCADE;
  DROP TABLE "payload"."notifications_rels" CASCADE;
  DROP TABLE "payload"."_notifications_v" CASCADE;
  DROP TABLE "payload"."_notifications_v_rels" CASCADE;
  DROP TABLE "payload"."audit_logs" CASCADE;
  DROP TABLE "payload"."audit_logs_rels" CASCADE;
  DROP TABLE "payload"."_audit_logs_v" CASCADE;
  DROP TABLE "payload"."_audit_logs_v_rels" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_rels" CASCADE;
  DROP TABLE "payload"."_media_v" CASCADE;
  DROP TABLE "payload"."_media_v_rels" CASCADE;
  DROP TABLE "payload"."folders" CASCADE;
  DROP TABLE "payload"."folders_rels" CASCADE;
  DROP TABLE "payload"."_folders_v" CASCADE;
  DROP TABLE "payload"."_folders_v_rels" CASCADE;
  DROP TABLE "payload"."tags" CASCADE;
  DROP TABLE "payload"."tags_rels" CASCADE;
  DROP TABLE "payload"."_tags_v" CASCADE;
  DROP TABLE "payload"."_tags_v_rels" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."payload_llm_instructions" CASCADE;
  DROP TABLE "payload"."payload_llm_instructions_rels" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_users_account_status";
  DROP TYPE "payload"."enum_users_auth_provider";
  DROP TYPE "payload"."enum__users_v_version_role";
  DROP TYPE "payload"."enum__users_v_version_account_status";
  DROP TYPE "payload"."enum__users_v_version_auth_provider";
  DROP TYPE "payload"."enum_listings_status";
  DROP TYPE "payload"."enum_listings_property_type";
  DROP TYPE "payload"."enum_listings_listing_type";
  DROP TYPE "payload"."enum_listings_ownership_doc_type";
  DROP TYPE "payload"."enum__listings_v_version_status";
  DROP TYPE "payload"."enum__listings_v_version_property_type";
  DROP TYPE "payload"."enum__listings_v_version_listing_type";
  DROP TYPE "payload"."enum__listings_v_version_ownership_doc_type";
  DROP TYPE "payload"."enum_viewing_requests_status";
  DROP TYPE "payload"."enum__viewing_requests_v_version_status";
  DROP TYPE "payload"."enum_messages_message_type";
  DROP TYPE "payload"."enum__messages_v_version_message_type";
  DROP TYPE "payload"."enum_payments_payment_type";
  DROP TYPE "payload"."enum_payments_method";
  DROP TYPE "payload"."enum_payments_status";
  DROP TYPE "payload"."enum__payments_v_version_payment_type";
  DROP TYPE "payload"."enum__payments_v_version_method";
  DROP TYPE "payload"."enum__payments_v_version_status";
  DROP TYPE "payload"."enum_verification_submissions_id_type";
  DROP TYPE "payload"."enum_verification_submissions_status";
  DROP TYPE "payload"."enum__verification_submissions_v_version_id_type";
  DROP TYPE "payload"."enum__verification_submissions_v_version_status";
  DROP TYPE "payload"."enum_listing_reports_reason";
  DROP TYPE "payload"."enum_listing_reports_status";
  DROP TYPE "payload"."enum__listing_reports_v_version_reason";
  DROP TYPE "payload"."enum__listing_reports_v_version_status";
  DROP TYPE "payload"."enum_notifications_type";
  DROP TYPE "payload"."enum__notifications_v_version_type";
  DROP TYPE "payload"."enum_audit_logs_actor_role";
  DROP TYPE "payload"."enum_audit_logs_status";
  DROP TYPE "payload"."enum__audit_logs_v_version_actor_role";
  DROP TYPE "payload"."enum__audit_logs_v_version_status";
  DROP TYPE "payload"."enum_payload_llm_instructions_entity_type";`)
}
