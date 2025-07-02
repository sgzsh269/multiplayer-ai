import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const userSchema = z.object({
  clerkId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return new Response("Invalid user data", { status: 400 });
    }
    const { clerkId, displayName, avatarUrl } = parsed.data;

    // Ensure the authenticated user can only sync their own data
    if (clerkUserId !== clerkId) {
      return new Response("Forbidden: Can only sync own user data", {
        status: 403,
      });
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    if (existing.length > 0) {
      // Update if displayName or avatarUrl changed
      const user = existing[0];
      if (user.displayName !== displayName || user.avatarUrl !== avatarUrl) {
        await db
          .update(users)
          .set({ displayName, avatarUrl })
          .where(eq(users.clerkId, clerkId));
      }
      return new Response("User updated", { status: 200 });
    } else {
      // Insert new user
      await db.insert(users).values({ clerkId, displayName, avatarUrl });
      return new Response("User created", { status: 201 });
    }
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}
