// Drizzle ORM schema for collaborative AI playground
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatrooms = pgTable("chatrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isPrivate: integer("is_private").default(0),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // AI Assistant settings
  aiMode: text("ai_mode").default("auto-respond").notNull(), // "auto-respond" or "summoned"
  aiEnabled: boolean("ai_enabled").default(true).notNull(),
  aiSystemMessage: text("ai_system_message").default(
    "You are a helpful AI assistant in a collaborative chatroom. You can see the conversation history and should provide helpful, relevant responses to user questions. Be concise but informative. You're part of a team discussion, so be collaborative and supportive."
  ),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatroomId: integer("chatroom_id").notNull(),
  userId: integer("user_id"), // null for AI messages
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: integer("parent_id"), // for threaded replies
  // AI message metadata
  isAiMessage: boolean("is_ai_message").default(false).notNull(),
  aiModel: text("ai_model"), // which AI model was used
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  chatroomId: integer("chatroom_id").notNull(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatroom_members = pgTable(
  "chatroom_members",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    chatroomId: integer("chatroom_id").notNull(),
    role: text("role").notNull(), // e.g., admin, guest
  },
  (table) => [
    uniqueIndex("unique_user_chatroom").on(table.userId, table.chatroomId),
  ]
);
