import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { messages, users, chatrooms } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId } = await auth();

  const { id } = await params;
  const chatroomId = parseInt(id);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, triggerType = "manual" } = await req.json();

  if (!chatroomId || !message) {
    return NextResponse.json(
      { error: "Chatroom ID and message are required" },
      { status: 400 }
    );
  }

  try {
    // Get chatroom settings
    const chatroom = await db
      .select()
      .from(chatrooms)
      .where(eq(chatrooms.id, chatroomId))
      .limit(1);

    if (!chatroom[0]) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // Check if AI is enabled for this chatroom
    if (!chatroom[0].aiEnabled) {
      return NextResponse.json(
        { error: "AI is disabled for this chatroom" },
        { status: 403 }
      );
    }

    // Check if AI should respond based on mode and trigger
    const aiMode = chatroom[0].aiMode;
    const shouldRespond =
      aiMode === "auto-respond" ||
      (aiMode === "summoned" &&
        (triggerType === "mention" || triggerType === "manual"));

    if (!shouldRespond) {
      return NextResponse.json(
        { message: "AI not triggered in current mode" },
        { status: 200 }
      );
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

    // Reverse to get chronological order
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
          `You are a helpful AI assistant in a collaborative chatroom called "${chatroom[0].name}". 
You can see the conversation history and should provide helpful, relevant responses to user questions.
Be concise but informative. You're part of a team discussion, so be collaborative and supportive.`,
      },
    ];

    // Add conversation history as messages
    conversationHistory.forEach((msg) => {
      if (msg.isAiMessage) {
        chatMessages.push({
          role: "assistant",
          content: msg.content,
        });
      } else {
        chatMessages.push({
          role: "user",
          content: msg.content,
        });
      }
    });

    // Add current user message
    chatMessages.push({
      role: "user",
      content: message,
    });

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
                  chatroomId: chatroomId.toString(),
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
          // Send each token to the client
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
                    chatroomId: chatroomId.toString(),
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
          if (!apiKey) {
            console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
          } else {
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
                  chatroomId: chatroomId.toString(),
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
                  chatroomId: chatroomId.toString(),
                  streamId,
                  messageId: aiMessage[0].id,
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

        // Send completion signal
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              complete: true,
              messageId: aiMessage[0].id,
            })}\n\n`
          )
        );

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
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
