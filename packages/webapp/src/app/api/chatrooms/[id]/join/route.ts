import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { chatroom_members, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const chatroomId = Number(params.id);
    // Find the user in the DB
    const user = await db.select().from(users).where(eq(users.clerkId, userId));
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
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
