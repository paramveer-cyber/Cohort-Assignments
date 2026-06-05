CREATE TYPE "public"."provider" AS ENUM('local', 'google');--> statement-breakpoint
CREATE TABLE "user_party" (
	"party_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pokemon_id" integer NOT NULL,
	"order_id" numeric(4, 3) NOT NULL,
	CONSTRAINT "user_slot_unique" UNIQUE("user_id","order_id"),
	CONSTRAINT "pokemon_id" CHECK ("user_party"."pokemon_id" >= 0 AND "user_party"."pokemon_id" <= 1350),
	CONSTRAINT "order_id" CHECK ("user_party"."order_id" >= 0 AND "user_party"."order_id" <= 6)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"email" varchar(322) NOT NULL,
	"salt" text,
	"password" text,
	"refresh_token" text,
	"provider" "provider" DEFAULT 'local' NOT NULL,
	"user_xp" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_xp" CHECK ("users"."user_xp" >= 0)
);
--> statement-breakpoint
ALTER TABLE "user_party" ADD CONSTRAINT "user_party_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;