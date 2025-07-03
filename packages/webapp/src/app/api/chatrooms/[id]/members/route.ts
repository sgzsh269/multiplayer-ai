import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
