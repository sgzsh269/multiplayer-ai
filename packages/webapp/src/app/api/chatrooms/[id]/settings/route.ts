import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { chatrooms, chatroom_members, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId } = await auth();
  const chatroomId = parseInt(params.id);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatroom = await db
      .select({
        aiMode: chatrooms.aiMode,
        aiEnabled: chatrooms.aiEnabled,
        aiSystemMessage: chatrooms.aiSystemMessage,
      })
      .from(chatrooms)
      .where(eq(chatrooms.id, chatroomId))
      .limit(1);

    if (!chatroom[0]) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings: chatroom[0] });
  } catch (error) {
    console.error("Error fetching chatroom settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatroom settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { userId } = await auth();
  const chatroomId = parseInt(params.id);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { aiMode, aiEnabled, aiSystemMessage } = await req.json();

  // Validate aiMode
  if (aiMode && !["auto-respond", "summoned"].includes(aiMode)) {
    return NextResponse.json(
      { error: "Invalid AI mode. Must be 'auto-respond' or 'summoned'" },
      { status: 400 }
    );
  }

  try {
    // Get user from Clerk ID
    const user = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member of the chatroom (basic permission check)
    const membership = await db
      .select()
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
        { error: "Not authorized to modify this chatroom" },
        { status: 403 }
      );
    }

    // Update chatroom settings
    const updateData: any = {};
    if (aiMode !== undefined) updateData.aiMode = aiMode;
    if (aiEnabled !== undefined) updateData.aiEnabled = aiEnabled;
    if (aiSystemMessage !== undefined)
      updateData.aiSystemMessage = aiSystemMessage;

    const updatedChatroom = await db
      .update(chatrooms)
      .set(updateData)
      .where(eq(chatrooms.id, chatroomId))
      .returning({
        aiMode: chatrooms.aiMode,
        aiEnabled: chatrooms.aiEnabled,
        aiSystemMessage: chatrooms.aiSystemMessage,
      });

    if (!updatedChatroom[0]) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // Broadcast settings change to PartyKit for real-time updates
    try {
      const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
      if (!apiKey) {
        console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
        // Continue without broadcasting but log the error
      } else {
        await fetch(
          `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/settings-update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              settings: updatedChatroom[0],
              chatroomId: chatroomId.toString(),
              timestamp: Date.now(),
              updatedBy: {
                id: user[0].id,
                displayName:
                  user[0].firstName && user[0].lastName
                    ? `${user[0].firstName} ${user[0].lastName}`
                    : user[0].firstName || user[0].lastName || "User",
              },
            }),
          }
        );
      }
    } catch (error) {
      console.error("Failed to broadcast settings update to PartyKit:", error);
      // Don't fail the request if PartyKit broadcast fails
    }

    return NextResponse.json({ settings: updatedChatroom[0] });
  } catch (error) {
    console.error("Error updating chatroom settings:", error);
    return NextResponse.json(
      { error: "Failed to update chatroom settings" },
      { status: 500 }
    );
  }
}
