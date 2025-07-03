import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { chatroom_members, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Dummy members list
  const { userId } = await auth();
  return NextResponse.json({
    members: [
      { id: 1, firstName: "Alice", lastName: null, role: "admin" },
      { id: 2, firstName: "Bob", lastName: null, role: "member" },
    ],
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await context;
  const { id } = await params;  
  const chatroomId = parseInt(id);

  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId } = await req.json();
    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Find the requesting user in the database
    const requestingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkUserId));

    if (!requestingUser[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the requesting user is an admin of this chatroom
    const requestingUserMembership = await db
      .select({ role: chatroom_members.role })
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.chatroomId, chatroomId),
          eq(chatroom_members.userId, requestingUser[0].id)
        )
      )
      .limit(1);

    if (!requestingUserMembership[0]) {
      return NextResponse.json(
        { error: "Not a member of this chatroom" },
        { status: 403 }
      );
    }

    if (requestingUserMembership[0].role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can remove members" },
        { status: 403 }
      );
    }

    // Check if the member to be removed exists in the chatroom
    const memberToRemove = await db
      .select({ role: chatroom_members.role })
      .from(chatroom_members)
      .where(
        and(
          eq(chatroom_members.chatroomId, chatroomId),
          eq(chatroom_members.userId, memberId)
        )
      )
      .limit(1);

    if (!memberToRemove[0]) {
      return NextResponse.json(
        { error: "Member not found in this chatroom" },
        { status: 404 }
      );
    }

    // Prevent removing the last admin
    if (memberToRemove[0].role === "admin") {
      const adminCount = await db
        .select({ count: chatroom_members.id })
        .from(chatroom_members)
        .where(
          and(
            eq(chatroom_members.chatroomId, chatroomId),
            eq(chatroom_members.role, "admin")
          )
        );

      if (adminCount.length <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the chatroom" },
          { status: 400 }
        );
      }
    }

    // Prevent admin from removing themselves
    if (memberId === requestingUser[0].id) {
      return NextResponse.json(
        { error: "Cannot remove yourself from the chatroom" },
        { status: 400 }
      );
    }

    // Get member details before removal for broadcasting
    const memberToRemoveDetails = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, memberId));

    // Remove the member from the chatroom
    await db
      .delete(chatroom_members)
      .where(
        and(
          eq(chatroom_members.chatroomId, chatroomId),
          eq(chatroom_members.userId, memberId)
        )
      );

    // Broadcast member removal to PartyKit for real-time updates
    try {
      const apiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;
      if (apiKey && memberToRemoveDetails[0]) {
        const memberName =
          memberToRemoveDetails[0].firstName &&
          memberToRemoveDetails[0].lastName
            ? `${memberToRemoveDetails[0].firstName} ${memberToRemoveDetails[0].lastName}`
            : memberToRemoveDetails[0].firstName ||
              memberToRemoveDetails[0].lastName ||
              "User";

        await fetch(
          `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/main/${chatroomId}/member-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              type: "member-removed",
              chatroomId: chatroomId.toString(),
              member: {
                id: memberToRemoveDetails[0].id,
                name: memberName,
                role: memberToRemove[0].role,
              },
              timestamp: Date.now(),
            }),
          }
        );
      }
    } catch (error) {
      console.error("Failed to broadcast member removal to PartyKit:", error);
      // Don't fail the request if PartyKit broadcast fails
    }

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
