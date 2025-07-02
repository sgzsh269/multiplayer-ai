import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/clerk-sdk-node";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Dummy messages list
  const { userId } = await auth();
  return NextResponse.json({
    messages: [
      {
        id: 1,
        userId: 1,
        content: "Hello!",
        createdAt: new Date().toISOString(),
      },
      { id: 2, userId: 2, content: "Hi!", createdAt: new Date().toISOString() },
    ],
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Dummy create message
  const { userId } = await auth();
  return NextResponse.json({
    message: {
      id: 3,
      userId: 1,
      content: "This is a new message!",
      createdAt: new Date().toISOString(),
    },
  });
}
