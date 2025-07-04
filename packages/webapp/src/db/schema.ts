// Drizzle ORM schema for collaborative AI playground
import {
  pgTable,
  text,
  timestamp,
  boolean,
  unique,
  uniqueIndex,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatrooms = pgTable("chatrooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  isPrivate: text("is_private").default("0"), // Changed from integer to text for consistency
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // AI Assistant settings
  aiMode: text("ai_mode").default("auto-respond").notNull(), // "auto-respond" or "summoned"
  aiEnabled: boolean("ai_enabled").default(true).notNull(),
  aiSystemMessage: text("ai_system_message").default(
    "You are a helpful AI assistant in a collaborative chatroom. You can see the conversation history and should provide helpful, relevant responses to user questions. Be concise but informative. You're part of a team discussion, so be collaborative and supportive."
  ),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatroomId: uuid("chatroom_id").notNull(),
  userId: uuid("user_id"), // null for AI messages
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: uuid("parent_id"), // for threaded replies
  // AI message metadata
  isAiMessage: boolean("is_ai_message").default(false).notNull(),
  aiModel: text("ai_model"), // which AI model was used
});

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatroomId: uuid("chatroom_id").notNull(),
  userId: uuid("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatroom_members = pgTable(
  "chatroom_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    chatroomId: uuid("chatroom_id").notNull(),
    role: text("role").notNull(), // e.g., admin, guest
  },
  (table) => [
    uniqueIndex("unique_user_chatroom").on(table.userId, table.chatroomId),
  ]
);

export const chatroom_invites = pgTable("chatroom_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatroomId: uuid("chatroom_id").notNull(),
  createdBy: uuid("created_by").notNull(), // User who created the invite
  inviteCode: text("invite_code").notNull().unique(), // Short unique code for the invite URL
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(), // Can be deactivated manually
  usedBy: jsonb("used_by").default([]).$type<string[]>(), // Array of user IDs who used this invite
  maxUses: text("max_uses"), // Optional limit on how many times it can be used (null = unlimited)
});
