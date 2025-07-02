import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { chatrooms, chatroom_members, users, messages } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray, count } from "drizzle-orm";

// TODO: Import db, schema, and Clerk auth utilities

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's internal database ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = user[0].id;

    // Get all chatroom memberships for the current user
    const memberships = await db
      .select({ chatroomId: chatroom_members.chatroomId })
      .from(chatroom_members)
      .where(eq(chatroom_members.userId, currentUserId));

    const chatroomIds = memberships.map((m) => m.chatroomId);

    if (chatroomIds.length === 0) {
      return NextResponse.json({ chatrooms: [] });
    }

    // Get chatroom details for the memberships, and count participants and messages
    const userChatrooms = await db
      .select({
        id: chatrooms.id,
        name: chatrooms.name,
        isPrivate: chatrooms.isPrivate,
        createdBy: chatrooms.createdBy,
        createdAt: chatrooms.createdAt,
        participantCount: count(chatroom_members.userId),
        messageCount: count(messages.id),
      })
      .from(chatrooms)
      .leftJoin(chatroom_members, eq(chatrooms.id, chatroom_members.chatroomId))
      .leftJoin(messages, eq(chatrooms.id, messages.chatroomId))
      .where(inArray(chatrooms.id, chatroomIds))
      .groupBy(
        chatrooms.id,
        chatrooms.name,
        chatrooms.isPrivate,
        chatrooms.createdBy,
        chatrooms.createdAt
      );

    return NextResponse.json({ chatrooms: userChatrooms });
  } catch (error) {
    console.error("Error listing chatrooms:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, description } = body;
    // Find the user in the DB
    const user = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!user[0])
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    // Create chatroom
    const [chatroom] = await db
      .insert(chatrooms)
      .values({ name, createdBy: user[0].id })
      .returning();
    // Add user as admin member
    await db
      .insert(chatroom_members)
      .values({ userId: user[0].id, chatroomId: chatroom.id, role: "admin" });
    return NextResponse.json({ chatroom });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
