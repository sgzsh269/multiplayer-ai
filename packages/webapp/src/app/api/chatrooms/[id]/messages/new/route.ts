import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { messages, users, chatrooms, chatroom_members } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId: clerkUserId } = await auth();
  const { id } = await params;
  const chatroomId = id;
  const { content } = await req.json();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user in the database
  const user = await db
    .select()
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

  // Save the user message
  let newMessage;
  try {
    [newMessage] = await db
      .insert(messages)
      .values({
        chatroomId: chatroomId,
        userId: user[0].id,
        content: content,
      })
      .returning();
  } catch (error) {
    console.error("Error saving user message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }

  // Broadcast user message to PartyKit
  try {
    const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
    if (apiKey) {
      await fetch(
        `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/user-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            type: "chat-message",
            text: content,
            sentAt: Date.now(),
            user:
              user[0].firstName && user[0].lastName
                ? `${user[0].firstName} ${user[0].lastName}`
                : user[0].firstName || user[0].lastName || "User",
            userId: user[0].id,
            displayName:
              user[0].firstName && user[0].lastName
                ? `${user[0].firstName} ${user[0].lastName}`
                : user[0].firstName || user[0].lastName || "User",
            roomId: chatroomId,
            receivedAt: Date.now(),
          }),
        }
      );
    }
  } catch (error) {
    console.error("Failed to broadcast user message to PartyKit:", error);
    // Don't fail the request if PartyKit broadcast fails
  }

  // Check AI settings for this chatroom
  const chatroom = await db
    .select()
    .from(chatrooms)
    .where(eq(chatrooms.id, chatroomId))
    .limit(1);
  if (!chatroom[0]) {
    return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
  }

  if (!chatroom[0].aiEnabled) {
    return NextResponse.json({ message: newMessage, ai: null });
  }

  // Check if AI should respond based on mode
  const aiMode = chatroom[0].aiMode;
  const shouldRespond =
    aiMode === "auto-respond" ||
    (aiMode === "summoned" && content.toLowerCase().includes("@ai"));

  if (!shouldRespond) {
    return NextResponse.json({ message: newMessage, ai: null });
  }

  // Get recent conversation history for context
  const recentMessages = await db
    .select({
      content: messages.content,
      isAiMessage: messages.isAiMessage,
      createdAt: messages.createdAt,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.chatroomId, chatroomId))
    .orderBy(desc(messages.createdAt))
    .limit(10);
  const conversationHistory = recentMessages.reverse();

  // Build messages array for chat completion
  const chatMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    {
      role: "system",
      content:
        chatroom[0].aiSystemMessage ||
        `You are a helpful AI assistant in a collaborative chatroom called "${chatroom[0].name}".\nYou can see the conversation history and should provide helpful, relevant responses to user questions.\nBe concise but informative. You're part of a team discussion, so be collaborative and supportive.`,
    },
  ];
  conversationHistory.forEach((msg) => {
    if (msg.isAiMessage) {
      chatMessages.push({ role: "assistant", content: msg.content });
    } else {
      chatMessages.push({ role: "user", content: msg.content });
    }
  });
  chatMessages.push({ role: "user", content });

  // Generate AI response using AI SDK streaming
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages: chatMessages,
    temperature: 0.7,
    maxTokens: 500,
  });

  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      const streamId = `stream-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      // Broadcast stream start to PartyKit
      try {
        const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
        if (apiKey) {
          await fetch(
            `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/ai-stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                type: "start",
                chatroomId: chatroomId,
                streamId,
                timestamp: Date.now(),
              }),
            }
          );
        }
      } catch (error) {
        console.error("Failed to broadcast stream start to PartyKit:", error);
      }
      for await (const delta of result.textStream) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ token: delta })}\n\n`
          )
        );
        fullResponse += delta;
        // Broadcast each token to PartyKit
        try {
          const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
          if (apiKey) {
            await fetch(
              `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/ai-stream`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  type: "token",
                  token: delta,
                  chatroomId: chatroomId,
                  streamId,
                  timestamp: Date.now(),
                }),
              }
            );
          }
        } catch (error) {
          console.error("Failed to broadcast token to PartyKit:", error);
        }
      }
      // Save complete AI response to database
      const aiMessage = await db
        .insert(messages)
        .values({
          chatroomId: chatroomId,
          userId: null, // AI messages have null userId
          content: fullResponse,
          isAiMessage: true,
          aiModel: "gpt-4o-mini",
        })
        .returning();
      // Broadcast complete AI message to PartyKit
      try {
        const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
        if (apiKey) {
          await fetch(
            `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/ai-message`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                message: fullResponse,
                chatroomId: chatroomId,
                timestamp: Date.now(),
              }),
            }
          );
        }
      } catch (error) {
        console.error("Failed to broadcast AI message to PartyKit:", error);
      }
      // Broadcast completion to PartyKit
      try {
        const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
        if (apiKey) {
          await fetch(
            `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/ai-stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                type: "complete",
                chatroomId: chatroomId,
                streamId,
                timestamp: Date.now(),
              }),
            }
          );
        }
      } catch (error) {
        console.error(
          "Failed to broadcast stream completion to PartyKit:",
          error
        );
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
