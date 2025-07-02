import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/clerk-sdk-node";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Dummy members list
  const { userId } = await auth();
  return NextResponse.json({
    members: [
      { id: 1, displayName: "Alice", role: "admin" },
      { id: 2, displayName: "Bob", role: "member" },
    ],
  });
}
