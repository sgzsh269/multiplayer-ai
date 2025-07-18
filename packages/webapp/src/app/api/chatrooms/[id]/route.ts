import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { chatrooms, chatroom_members, users, messages } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;

  const { id } = await params;
  const chatroomId = id; // UUID string, no need to parse

  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chatroomId)) {
      return NextResponse.json(
        { error: "Invalid Chatroom ID format" },
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

    // Get chatroom members with their first and last names, assuming all are online for MVP
    const chatroomMembers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        role: chatroom_members.role,
      })
      .from(chatroom_members)
      .innerJoin(users, eq(chatroom_members.userId, users.id))
      .where(eq(chatroom_members.chatroomId, chatroomId));

    // Get messages for the chatroom with sender information (including AI messages)
    const chatroomMessages = await db
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
      .leftJoin(users, eq(messages.userId, users.id)) // Use leftJoin to include AI messages
      .where(eq(messages.chatroomId, chatroomId))
      .orderBy(messages.createdAt);

    // Calculate additional info for session info
    const participantsActive = chatroomMembers.length;
    const messagesCount = chatroomMessages.length;
    const filesShared = 0; // TODO: Implement file sharing logic and count
    const aiInteractions = 0; // TODO: Implement AI interaction tracking

    // Format timestamps and avatar initials
    const formattedParticipants = chatroomMembers.map((p) => ({
      id: p.id,
      name:
        p.firstName && p.lastName
          ? `${p.firstName} ${p.lastName}`
          : p.firstName || p.lastName || "User",
      role: p.role,
      isOnline: true, // Mock for MVP
      isTyping: false, // Mock for MVP
      avatarInitials:
        p.firstName && p.lastName
          ? `${p.firstName[0]}${p.lastName[0]}`.toUpperCase()
          : p.firstName
          ? p.firstName[0].toUpperCase()
          : "U",
    }));

    const formattedMessages = chatroomMessages.map((msg) => ({
      id: msg.id,
      sender: msg.isAiMessage
        ? {
            id: "ai-assistant",
            name: "AI",
            avatarUrl: null,
          }
        : {
            id: msg.senderId,
            name:
              msg.senderFirstName && msg.senderLastName
                ? `${msg.senderFirstName} ${msg.senderLastName}`
                : msg.senderFirstName || msg.senderLastName || "User",
            firstName: msg.senderFirstName,
            lastName: msg.senderLastName,
            avatarUrl: msg.senderAvatarUrl,
          },
      createdAt: msg.createdAt,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: msg.content,
      isAiMessage: msg.isAiMessage,
      aiModel: msg.aiModel,
    }));

    // Calculate startedAgo
    const startedDate = new Date(chatroom.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - startedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const startedAgo = diffHours > 0 ? `${diffHours} hours ago` : "just now";

    return NextResponse.json({
      chatroom: {
        id: chatroom.id,
        name: chatroom.name,
        startedAgo: startedAgo,
        participantsActive: participantsActive,
        participants: formattedParticipants,
        messages: formattedMessages,
        sessionInfo: {
          started: startedDate.toLocaleString(),
          messages: messagesCount,
          filesShared: filesShared,
          aiInteractions: aiInteractions,
        },
        aiSettings: {
          aiMode: chatroom.aiMode,
          aiEnabled: chatroom.aiEnabled,
          aiSystemMessage: chatroom.aiSystemMessage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching chatroom details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
