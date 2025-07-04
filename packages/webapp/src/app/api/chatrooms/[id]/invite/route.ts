import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  chatrooms,
  chatroom_members,
  chatroom_invites,
  users,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { id: chatroomId } = await params;

  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chatroomId)) {
      return NextResponse.json(
        { error: "Invalid chatroom ID format" },
        { status: 400 }
      );
    }

    // Find the user in the DB
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user[0])
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if user is a member of this chatroom
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

    // Check if chatroom exists
    const chatroom = await db
      .select()
      .from(chatrooms)
      .where(eq(chatrooms.id, chatroomId));

    if (!chatroom[0]) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // Generate a secure invite code (shorter than UUID but still secure)
    const inviteCode = nanoid(12); // 12 characters, URL-safe

    // Set expiry to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Create the invite record
    const invite = await db
      .insert(chatroom_invites)
      .values({
        chatroomId,
        createdBy: user[0].id,
        inviteCode,
        expiresAt,
        usedBy: [],
        isActive: true,
      })
      .returning();

    // Generate the invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${inviteCode}`;

    return NextResponse.json({
      success: true,
      inviteUrl,
      inviteCode,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 10,
    });
  } catch (err) {
    console.error("Error creating invite:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
