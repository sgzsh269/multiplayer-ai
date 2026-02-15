ALTER TABLE "chatrooms"
  ALTER COLUMN "is_private" TYPE boolean
  USING CASE
    WHEN "is_private" IN ('1', 'true', 't', 'yes', 'y', 'on') THEN true
    ELSE false
  END,
  ALTER COLUMN "is_private" SET DEFAULT false,
  ALTER COLUMN "is_private" SET NOT NULL;

--> statement-breakpoint
ALTER TABLE "chatroom_invites"
  ALTER COLUMN "max_uses" TYPE integer
  USING NULLIF(regexp_replace("max_uses", '[^0-9-]', '', 'g'), '')::integer;