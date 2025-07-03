import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { chatroom_members, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: Request,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const chatroomId = params.id; // UUID string, no need to parse
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
    // Check if already a member
    const existing = await db
      .select()
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.userId, user[0].id),
          eq(chatroom_members.chatroomId, chatroomId)
        )
      );
    if (existing.length > 0)
      return NextResponse.json({ success: true, alreadyMember: true });
    // Add as member
    await db
      .insert(chatroom_members)
      .values({ userId: user[0].id, chatroomId, role: "member" });

    // Broadcast member join to PartyKit for real-time updates
    try {
      const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
      if (apiKey) {
        const memberName =
          user[0].firstName && user[0].lastName
            ? `${user[0].firstName} ${user[0].lastName}`
            : user[0].firstName || user[0].lastName || "User";

        await fetch(
          `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/member-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              type: "member-joined",
              chatroomId: chatroomId,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
