// Drizzle ORM schema for collaborative AI playground
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatrooms = pgTable("chatrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isPrivate: integer("is_private").default(0),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatroomId: integer("chatroom_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: integer("parent_id"), // for threaded replies
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
