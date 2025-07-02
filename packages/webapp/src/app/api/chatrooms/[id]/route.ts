import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { chatrooms, chatroom_members, users, messages } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatroomId = Number(params.id);
    if (isNaN(chatroomId)) {
      return NextResponse.json(
        { error: "Invalid Chatroom ID" },
        { status: 400 }
      );
    }

    // Find the chatroom
    const chatroomResult = await db
      .select()
      .from(chatrooms)
      .where(eq(chatrooms.id, chatroomId));
    const chatroom = chatroomResult[0];
    if (!chatroom) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // Check if the current user is a member of this chatroom
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId));
    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMember = await db
      .select()
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.userId, user[0].id),
          eq(chatroom_members.chatroomId, chatroomId)
        )
      );
    if (isMember.length === 0) {
      return NextResponse.json(
        { error: "Forbidden: Not a member of this chatroom" },
        { status: 403 }
      );
    }

    // Get chatroom members with their display names
    const chatroomMembers = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: chatroom_members.role,
      })
      .from(chatroom_members)
      .innerJoin(users, eq(chatroom_members.userId, users.id))
      .where(eq(chatroom_members.chatroomId, chatroomId));

    // Get messages for the chatroom
    const chatroomMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatroomId, chatroomId))
      .orderBy(messages.createdAt);

    return NextResponse.json({
      chatroom: {
        ...chatroom,
        members: chatroomMembers,
        messages: chatroomMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching chatroom details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
