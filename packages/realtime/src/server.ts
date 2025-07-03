import type * as Party from "partykit/server";
import { verifyToken } from "@clerk/backend";

export default class Server implements Party.Server {
  private aiRequestCount = 0;
  private aiRequestResetTime = Date.now();
  private readonly AI_RATE_LIMIT = 10; // Max 10 AI messages per minute per room
  private readonly AI_RATE_WINDOW = 60 * 1000; // 1 minute

  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request) {
    // Handle AI message broadcasts from backend
    if (req.method === "POST" && req.url.includes("/ai-message")) {
      try {
        // Verify API key authentication
        const authHeader = req.headers.get("authorization");
        const expectedApiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;

        if (!expectedApiKey) {
          console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
          return new Response("Server configuration error", { status: 500 });
        }

        if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
          console.warn("Unauthorized AI message broadcast attempt");
          return new Response("Unauthorized", { status: 401 });
        }

        // Rate limiting for AI messages
        const now = Date.now();
        if (now - this.aiRequestResetTime > this.AI_RATE_WINDOW) {
          this.aiRequestCount = 0;
          this.aiRequestResetTime = now;
        }

        if (this.aiRequestCount >= this.AI_RATE_LIMIT) {
          console.warn(`AI rate limit exceeded for room ${this.room.id}`);
          return new Response("Rate limit exceeded", { status: 429 });
        }

        this.aiRequestCount++;

        const body = (await req.json()) as {
          message: string;
          chatroomId: string;
          timestamp?: number;
        };

        // Additional validation
        if (!body.message || !body.chatroomId) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Validate message content
        if (body.message.length > 4000) {
          return new Response("Message too long", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        // Broadcast AI message to all connected clients
        this.room.broadcast(
          JSON.stringify({
            type: "ai-message",
            text: body.message,
            sentAt: body.timestamp || Date.now(),
            user: "AI Assistant",
            userId: "ai-assistant",
            displayName: "AI Assistant",
            isAiMessage: true,
            roomId: body.chatroomId,
            receivedAt: Date.now(),
          })
        );

        return new Response("AI message broadcasted", { status: 200 });
      } catch (e) {
        console.error("Error broadcasting AI message:", e);
        return new Response("Error broadcasting AI message", { status: 500 });
      }
    }

    // Handle AI streaming tokens
    if (req.method === "POST" && req.url.includes("/ai-stream")) {
      try {
        // Verify API key authentication
        const authHeader = req.headers.get("authorization");
        const expectedApiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;

        if (!expectedApiKey) {
          console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
          return new Response("Server configuration error", { status: 500 });
        }

        if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
          console.warn("Unauthorized AI stream broadcast attempt");
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await req.json()) as {
          type: "token" | "start" | "complete";
          token?: string;
          chatroomId: string;
          streamId: string;
          messageId?: string;
          timestamp?: number;
        };

        // Additional validation
        if (!body.type || !body.chatroomId || !body.streamId) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        // Broadcast streaming event to all connected clients
        this.room.broadcast(
          JSON.stringify({
            type: "ai-stream",
            streamType: body.type,
            token: body.token,
            streamId: body.streamId,
            messageId: body.messageId,
            timestamp: body.timestamp || Date.now(),
            chatroomId: body.chatroomId,
            receivedAt: Date.now(),
          })
        );

        return new Response("AI stream broadcasted", { status: 200 });
      } catch (e) {
        console.error("Error broadcasting AI stream:", e);
        return new Response("Error broadcasting AI stream", { status: 500 });
      }
    }

    // Handle settings update broadcasts from backend
    if (req.method === "POST" && req.url.includes("/settings-update")) {
      try {
        // Verify API key authentication
        const authHeader = req.headers.get("authorization");
        const expectedApiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;

        if (!expectedApiKey) {
          console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
          return new Response("Server configuration error", { status: 500 });
        }

        if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
          console.warn("Unauthorized settings update broadcast attempt");
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await req.json()) as {
          settings: {
            aiMode: string;
            aiEnabled: boolean;
          };
          chatroomId: string;
          timestamp?: number;
          updatedBy: {
            id: number;
            displayName: string;
          };
        };

        // Additional validation
        if (!body.settings || !body.chatroomId || !body.updatedBy) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        // Broadcast settings update to all connected clients
        this.room.broadcast(
          JSON.stringify({
            type: "settings-update",
            settings: body.settings,
            timestamp: body.timestamp || Date.now(),
            updatedBy: body.updatedBy,
            roomId: body.chatroomId,
            receivedAt: Date.now(),
          })
        );

        return new Response("Settings update broadcasted", { status: 200 });
      } catch (e) {
        console.error("Error broadcasting settings update:", e);
        return new Response("Error broadcasting settings update", {
          status: 500,
        });
      }
    }

    // Handle member event broadcasts from backend
    if (req.method === "POST" && req.url.includes("/member-event")) {
      try {
        // Verify API key authentication
        const authHeader = req.headers.get("authorization");
        const expectedApiKey = process.env.SHARED_PARTYKIT_BACKEND_API_KEY;

        if (!expectedApiKey) {
          console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
          return new Response("Server configuration error", { status: 500 });
        }

        if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
          console.warn("Unauthorized member event broadcast attempt");
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await req.json()) as {
          type: "member-joined" | "member-removed";
          chatroomId: string;
          member: {
            id: number;
            name: string;
            role: string;
          };
          timestamp?: number;
        };

        // Additional validation
        if (!body.type || !body.chatroomId || !body.member) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        // Broadcast member event to all connected clients
        this.room.broadcast(
          JSON.stringify({
            type: body.type,
            member: body.member,
            timestamp: body.timestamp || Date.now(),
            chatroomId: body.chatroomId,
            receivedAt: Date.now(),
          })
        );

        return new Response("Member event broadcasted", { status: 200 });
      } catch (e) {
        console.error("Error broadcasting member event:", e);
        return new Response("Error broadcasting member event", { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Expect Clerk JWT as a query param: ?token=...
    const url = new URL(ctx.request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      conn.send("Missing Clerk token. Connection will be limited.");
      // Optionally: conn.close();
      return;
    }
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      }); // TODO: move secret to env config
      // Attach user info to connection for later use
      (conn as any).clerkUser = session;
      conn.send("Authenticated with Clerk");
    } catch (e) {
      conn.send("Invalid Clerk token. Connection will be limited.");
      // Optionally: conn.close();
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    // Try to parse the message as JSON
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.warn("Received non-JSON message:", message);
      return;
    }
    // Expect Clerk JWT in the message (for extra security)
    const token = parsed.token;
    if (!token) {
      sender.send(JSON.stringify({ error: "Missing Clerk token in message." }));
      return;
    }
    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      }); // TODO: move secret to env config
      // Log the message and user
      console.log(
        `connection ${sender.id} (user ${session.sub}) sent message:`,
        parsed
      );
      // Broadcast the structured message to all clients (excluding sender)
      this.room.broadcast(
        JSON.stringify({
          ...parsed,
          senderId: sender.id,
          userId: session.sub,
          displayName: session.displayName,
          roomId: this.room.id,
          receivedAt: Date.now(),
        }),
        [sender.id] // Exclude the sender by ID
      );
    } catch (e) {
      sender.send(JSON.stringify({ error: "Invalid Clerk token." }));
      return;
    }
  }
}

Server satisfies Party.Worker;
