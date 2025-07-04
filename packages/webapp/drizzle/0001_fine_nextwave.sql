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
