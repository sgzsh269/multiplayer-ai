ALTER TABLE "messages" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chatrooms" ADD COLUMN "ai_mode" text DEFAULT 'summoned' NOT NULL;--> statement-breakpoint
ALTER TABLE "chatrooms" ADD COLUMN "ai_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_ai_message" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "ai_model" text;