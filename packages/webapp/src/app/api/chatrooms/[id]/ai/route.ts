import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { messages, users, chatrooms } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { generateText } from "ai";
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
      aiMode === "reactive" ||
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
        sender: {
          name: users.displayName,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.chatroomId, chatroomId))
      .orderBy(desc(messages.createdAt))
      .limit(10);

    // Reverse to get chronological order
    const conversationHistory = recentMessages.reverse();

    // Build context prompt
    const contextPrompt = conversationHistory
      .map((msg) => {
        const sender = msg.isAiMessage
          ? "AI Assistant"
          : msg.sender?.name || "User";
        return `${sender}: ${msg.content}`;
      })
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant in a collaborative chatroom called "${chatroom[0].name}". 
You can see the conversation history and should provide helpful, relevant responses to user questions.
Be concise but informative. You're part of a team discussion, so be collaborative and supportive.

Recent conversation:
${contextPrompt}

Current user message: ${message}`;

    // Generate AI response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Save AI response to database
    const aiMessage = await db
      .insert(messages)
      .values({
        chatroomId: chatroomId,
        userId: null, // AI messages have null userId
        content: text,
        isAiMessage: true,
        aiModel: "gpt-3.5-turbo",
      })
      .returning();

    return NextResponse.json({
      message: aiMessage[0],
      aiResponse: text,
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
