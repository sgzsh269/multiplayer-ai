import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  chatroom_invites,
  chatroom_members,
  users,
  chatrooms,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  context: { params: { code: string } } | Promise<{ params: { code: string } }>
) {
  const { params } = await context;

  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code: inviteCode } = await params;

    // Find the user in the DB
    const user = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user[0])
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Find the invite
    const invite = await db
      .select()
      .from(chatroom_invites)
      .where(eq(chatroom_invites.inviteCode, inviteCode));

    if (!invite[0]) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 }
      );
    }

    // Check if invite is active
    if (!invite[0].isActive) {
      return NextResponse.json(
        { error: "This invite link has been deactivated" },
        { status: 400 }
      );
    }

    // Check if invite has expired
    const now = new Date();
    if (invite[0].expiresAt < now) {
      return NextResponse.json(
        { error: "This invite link has expired" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.userId, user[0].id),
          eq(chatroom_members.chatroomId, invite[0].chatroomId)
        )
      );

    if (existingMembership.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        chatroomId: invite[0].chatroomId,
      });
    }

    // Check maxUses if set
    if (invite[0].maxUses && invite[0].usedBy) {
      const maxUsesNum = parseInt(invite[0].maxUses);
      if (invite[0].usedBy.length >= maxUsesNum) {
        return NextResponse.json(
          { error: "This invite link has reached its usage limit" },
          { status: 400 }
        );
      }
    }

    // Add user to chatroom
    await db.insert(chatroom_members).values({
      userId: user[0].id,
      chatroomId: invite[0].chatroomId,
      role: "member",
    });

    // Update invite usage tracking
    const currentUsedBy = invite[0].usedBy || [];
    if (!currentUsedBy.includes(user[0].id)) {
      await db
        .update(chatroom_invites)
        .set({
          usedBy: [...currentUsedBy, user[0].id],
        })
        .where(eq(chatroom_invites.id, invite[0].id));
    }

    // Get chatroom details for response
    const chatroom = await db
      .select({ name: chatrooms.name })
      .from(chatrooms)
      .where(eq(chatrooms.id, invite[0].chatroomId));

    // Broadcast member join to PartyKit for real-time updates
    try {
      const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
      if (apiKey) {
        const memberName =
          user[0].firstName && user[0].lastName
            ? `${user[0].firstName} ${user[0].lastName}`
            : user[0].firstName || user[0].lastName || "User";

        await fetch(
          `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${invite[0].chatroomId}/member-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              type: "member-joined",
              chatroomId: invite[0].chatroomId,
              member: {
                id: user[0].id,
                name: memberName,
                role: "member",
              },
              timestamp: Date.now(),
            }),
          }
        );
      }
    } catch (error) {
      console.error("Failed to broadcast member join to PartyKit:", error);
      // Don't fail the request if PartyKit broadcast fails
    }

    return NextResponse.json({
      success: true,
      chatroomId: invite[0].chatroomId,
      chatroomName: chatroom[0]?.name,
    });
  } catch (err) {
    console.error("Error processing invite:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
