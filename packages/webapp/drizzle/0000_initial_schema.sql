CREATE TABLE "chatroom_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"invite_code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"used_by" jsonb DEFAULT '[]'::jsonb,
	"max_uses" text,
	CONSTRAINT "chatroom_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "chatroom_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"is_private" text DEFAULT '0',
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ai_mode" text DEFAULT 'auto-respond' NOT NULL,
	"ai_enabled" boolean DEFAULT true NOT NULL,
	"ai_system_message" text DEFAULT 'You are a helpful AI assistant in a collaborative chatroom. You can see the conversation history and should provide helpful, relevant responses to user questions. Be concise but informative. You''re part of a team discussion, so be collaborative and supportive.'
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"user_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"parent_id" uuid,
	"is_ai_message" boolean DEFAULT false NOT NULL,
	"ai_model" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "chatroom_invites" ADD CONSTRAINT "chatroom_invites_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatroom_invites" ADD CONSTRAINT "chatroom_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatroom_members" ADD CONSTRAINT "chatroom_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatroom_members" ADD CONSTRAINT "chatroom_members_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatrooms" ADD CONSTRAINT "chatrooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_chatroom" ON "chatroom_members" USING btree ("user_id","chatroom_id");