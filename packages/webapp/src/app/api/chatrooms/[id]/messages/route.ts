import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { messages, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId } = await auth();
  const chatroomId = params.id;

  if (!chatroomId) {
    return NextResponse.json(
      { error: "Chatroom ID is required" },
      { status: 400 }
    );
  }

  try {
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
      .where(eq(messages.chatroomId, parseInt(chatroomId)))
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
      { error: "Failed to fetch chatroom messages" },
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

  try {
    const newMessage = await db
      .insert(messages)
      .values({
        chatroomId: parseInt(chatroomId),
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
