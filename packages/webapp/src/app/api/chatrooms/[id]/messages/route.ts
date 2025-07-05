import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { messages, users, chatroom_members } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { id } = await params;

  const chatroomId = id;

  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user in the database
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate that user is a member of this chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.userId, user[0].id),
          eq(chatroom_members.chatroomId, chatroomId)
        )
      );

    if (membership.length === 0) {
      return NextResponse.json(
        { error: "Forbidden: Not a member of this chatroom" },
        { status: 403 }
      );
    }

    const chatMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        isAiMessage: messages.isAiMessage,
        aiModel: messages.aiModel,
        senderId: users.id,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderAvatarUrl: users.avatarUrl,
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.chatroomId, chatroomId))
      .orderBy(asc(messages.createdAt));

    const formattedMessages = chatMessages.map((msg) => ({
      ...msg,
      sender: {
        id: msg.senderId,
        name:
          msg.senderFirstName && msg.senderLastName
            ? `${msg.senderFirstName} ${msg.senderLastName}`
            : msg.senderFirstName || msg.senderLastName || "User",
        firstName: msg.senderFirstName,
        lastName: msg.senderLastName,
        avatarUrl: msg.senderAvatarUrl,
      },
      senderId: undefined,
      senderFirstName: undefined,
      senderLastName: undefined,
      senderAvatarUrl: undefined,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching chatroom messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { id: chatroomId } = await params;

  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user in the database
    const user = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is an admin of this chatroom
    const membership = await db
      .select({ role: chatroom_members.role })
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.chatroomId, chatroomId),
          eq(chatroom_members.userId, user[0].id)
        )
      )
      .limit(1);

    if (!membership[0]) {
      return NextResponse.json(
        { error: "Not a member of this chatroom" },
        { status: 403 }
      );
    }

    if (membership[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete all messages" },
        { status: 403 }
      );
    }

    // Delete all messages in the chatroom
    const deletedMessages = await db
      .delete(messages)
      .where(eq(messages.chatroomId, chatroomId))
      .returning({ id: messages.id });

    // Broadcast the clear event to PartyKit
    try {
      const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
      if (apiKey) {
        await fetch(
          `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/messages-cleared`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              type: "messages-cleared",
              chatroomId: chatroomId,
              clearedBy: {
                id: user[0].id,
                name:
                  user[0].firstName && user[0].lastName
                    ? `${user[0].firstName} ${user[0].lastName}`
                    : user[0].firstName || user[0].lastName || "Admin",
              },
              timestamp: Date.now(),
            }),
          }
        );
      }
    } catch (error) {
      console.error("Failed to broadcast clear messages to PartyKit:", error);
      // Don't fail the request if PartyKit broadcast fails
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedMessages.length,
      message: "All messages deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting all messages:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId } = await auth();

  const { id } = await params;
  const chatroomId = id;

  const { content } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!chatroomId || !content) {
    return NextResponse.json(
      { error: "Chatroom ID and content are required" },
      { status: 400 }
    );
  }

  // Validate that user is a member of this chatroom
  const membership = await db
    .select()
    .from(chatroom_members)
    .where(
      and(
        eq(chatroom_members.userId, user[0].id),
        eq(chatroom_members.chatroomId, chatroomId)
      )
    );

  if (membership.length === 0) {
    return NextResponse.json(
      { error: "Forbidden: Not a member of this chatroom" },
      { status: 403 }
    );
  }

  try {
    const newMessage = await db
      .insert(messages)
      .values({
        chatroomId: chatroomId,
        userId: user[0].id,
        content: content,
      })
      .returning();

    console.log("New message inserted:", newMessage[0]);
    return NextResponse.json({ message: newMessage[0] });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
