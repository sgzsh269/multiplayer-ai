import type * as Party from "partykit/server";
import { verifyToken } from "@clerk/backend";

export default class Server implements Party.Server {
  private aiRequestCount = 0;
  private aiRequestResetTime = Date.now();
  private readonly AI_RATE_LIMIT = 10; // Max 10 AI messages per minute per room
  private readonly AI_RATE_WINDOW = 60 * 1000; // 1 minute

  // Track typing users with auto-cleanup
  private typingUsers = new Map<
    string,
    { displayName: string; timeout: NodeJS.Timeout }
  >();
  private readonly TYPING_TIMEOUT = 6000; // 6 seconds before auto-clearing typing status

  // Environment configuration - centralized access to all env vars
  private readonly env = {
    SHARED_PARTYKIT_BACKEND_API_KEY:
      process.env.SHARED_PARTYKIT_BACKEND_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  } as const;

  constructor(readonly room: Party.Room) {}

  /**
   * Validates API key authentication for backend requests
   * @param req The incoming request
   * @returns Response object if authentication fails, null if successful
   */
  private validateApiAuth(req: Party.Request): Response | null {
    if (!this.env.SHARED_PARTYKIT_BACKEND_API_KEY) {
      console.error("SHARED_PARTYKIT_BACKEND_API_KEY not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const authHeader = req.headers.get("authorization");
    if (
      !authHeader ||
      authHeader !== `Bearer ${this.env.SHARED_PARTYKIT_BACKEND_API_KEY}`
    ) {
      console.warn("Unauthorized API request attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    return null; // Authentication successful
  }

  async onRequest(req: Party.Request) {
    // Handle AI message broadcasts from backend
    if (req.method === "POST" && req.url.includes("/ai-message")) {
      try {
        // Verify API key authentication
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

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

        const aiMessageData = {
          type: "ai-message",
          text: body.message,
          sentAt: body.timestamp || Date.now(),
          user: "AI",
          userId: "ai-assistant",
          displayName: "AI",
          isAiMessage: true,
          roomId: body.chatroomId,
          receivedAt: Date.now(),
        };

        console.log("🤖 Broadcasting AI message:", aiMessageData);

        // Broadcast AI message to all connected clients
        this.room.broadcast(JSON.stringify(aiMessageData));

        console.log("✅ AI message broadcasted successfully");
        return new Response("AI message broadcasted", { status: 200 });
      } catch (e) {
        console.error("Error broadcasting AI message:", e);
        return new Response("Error broadcasting AI message", { status: 500 });
      }
    }

    // Handle AI streaming tokens
    if (req.method === "POST" && req.url.includes("/ai-stream")) {
      try {
        console.log("🔄 Received AI stream request");

        // Verify API key authentication
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

        const body = (await req.json()) as {
          type: "token" | "start" | "complete";
          token?: string;
          chatroomId: string;
          streamId: string;
          messageId?: string;
          timestamp?: number;
        };

        console.log("📦 AI stream body:", body);

        // Additional validation
        if (!body.type || !body.chatroomId || !body.streamId) {
          console.error("❌ Invalid AI stream payload:", body);
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        const broadcastData = {
          type: "ai-stream",
          streamType: body.type,
          token: body.token,
          streamId: body.streamId,
          messageId: body.messageId,
          timestamp: body.timestamp || Date.now(),
          chatroomId: body.chatroomId,
          receivedAt: Date.now(),
        };

        console.log("📡 Broadcasting AI stream:", broadcastData);

        // Broadcast streaming event to all connected clients
        this.room.broadcast(JSON.stringify(broadcastData));

        console.log("✅ AI stream broadcasted successfully");
        return new Response("AI stream broadcasted", { status: 200 });
      } catch (e) {
        console.error("❌ Error broadcasting AI stream:", e);
        return new Response("Error broadcasting AI stream", { status: 500 });
      }
    }

    // Handle settings update broadcasts from backend
    if (req.method === "POST" && req.url.includes("/settings-update")) {
      try {
        // Verify API key authentication
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

        const body = (await req.json()) as {
          settings: {
            aiMode: string;
            aiEnabled: boolean;
          };
          chatroomId: string;
          timestamp?: number;
          updatedBy: {
            id: string; // UUID string instead of number
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
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

        const body = (await req.json()) as {
          type: "member-joined" | "member-removed";
          chatroomId: string;
          member: {
            id: string; // UUID string instead of number
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

    // Handle user message broadcasts from backend
    if (req.method === "POST" && req.url.includes("/user-message")) {
      try {
        // Verify API key authentication
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

        const body = (await req.json()) as {
          type: "chat-message";
          text: string;
          sentAt: number;
          user: string;
          userId: string;
          displayName: string;
          roomId: string;
          receivedAt: number;
        };

        // Additional validation
        if (!body.type || !body.text || !body.roomId || !body.userId) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.roomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.roomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        console.log(
          `💬 Broadcasting user message for room ${this.room.id} from ${body.displayName}`
        );

        // Broadcast user message to all connected clients except the sender
        // The sender shows the message optimistically
        this.room.broadcast(JSON.stringify(body));

        console.log("✅ User message broadcasted successfully");
        return new Response("User message broadcasted", { status: 200 });
      } catch (e) {
        console.error("❌ Error broadcasting user message:", e);
        return new Response("Error broadcasting user message", { status: 500 });
      }
    }

    // Handle messages cleared broadcasts from backend
    if (req.method === "POST" && req.url.includes("/messages-cleared")) {
      try {
        // Verify API key authentication
        const authError = this.validateApiAuth(req);
        if (authError) return authError;

        const body = (await req.json()) as {
          type: "messages-cleared";
          chatroomId: string;
          clearedBy: {
            id: string;
            name: string;
          };
          timestamp?: number;
        };

        // Additional validation
        if (!body.type || !body.chatroomId || !body.clearedBy) {
          return new Response("Invalid request payload", { status: 400 });
        }

        // Ensure the chatroomId matches the room
        if (body.chatroomId !== this.room.id) {
          console.warn(
            `Chatroom ID mismatch: ${body.chatroomId} vs ${this.room.id}`
          );
          return new Response("Chatroom ID mismatch", { status: 400 });
        }

        console.log(
          `🧹 Broadcasting messages cleared event for room ${this.room.id} by ${body.clearedBy.name}`
        );

        // Broadcast messages cleared event to all connected clients
        this.room.broadcast(
          JSON.stringify({
            type: "messages-cleared",
            chatroomId: body.chatroomId,
            clearedBy: body.clearedBy,
            timestamp: body.timestamp || Date.now(),
            receivedAt: Date.now(),
          })
        );

        console.log("✅ Messages cleared event broadcasted successfully");
        return new Response("Messages cleared event broadcasted", {
          status: 200,
        });
      } catch (e) {
        console.error("❌ Error broadcasting messages cleared event:", e);
        return new Response("Error broadcasting messages cleared event", {
          status: 500,
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`🔗 New connection to room ${this.room.id}`);

    // Expect Clerk JWT as a query param: ?token=...
    const url = new URL(ctx.request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      console.warn("❌ Connection without token");
      conn.send("Missing Clerk token. Connection will be limited.");
      // Optionally: conn.close();
      return;
    }
    try {
      const session = await verifyToken(token, {
        secretKey: this.env.CLERK_SECRET_KEY!,
      }); // TODO: move secret to env config
      // Attach user info to connection for later use
      (conn as any).clerkUser = session;
      console.log(
        `✅ User ${session.sub} authenticated in room ${this.room.id}`
      );
      conn.send("Authenticated with Clerk");
    } catch (e) {
      console.error("❌ Token verification failed:", e);
      conn.send("Invalid Clerk token. Connection will be limited.");
      // Optionally: conn.close();
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    console.log(`📨 Received message in room ${this.room.id}:`, message);

    // Try to parse the message as JSON
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.warn("❌ Received non-JSON message:", message);
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
        secretKey: this.env.CLERK_SECRET_KEY!,
      }); // TODO: move secret to env config

      // Handle typing events
      if (parsed.type === "typing-start" || parsed.type === "typing-stop") {
        // Use display name from the message, with fallback to "User"
        const displayName = parsed.displayName || "User";
        this.handleTypingEvent(
          parsed.type,
          session.sub as string,
          displayName,
          sender
        );
        return;
      }

      // For regular messages, clear typing status if user was typing
      if (parsed.type === "chat-message") {
        this.clearTypingStatus(session.sub as string);
      }

      const broadcastMessage = {
        ...parsed,
        senderId: sender.id,
        userId: session.sub,
        displayName: session.displayName,
        roomId: this.room.id,
        receivedAt: Date.now(),
      };

      console.log(
        `💬 User ${session.sub} sent message, broadcasting to others:`,
        broadcastMessage
      );

      // Broadcast the structured message to all clients (excluding sender)
      this.room.broadcast(
        JSON.stringify(broadcastMessage),
        [sender.id] // Exclude the sender by ID
      );

      console.log(`✅ Message broadcasted to room ${this.room.id}`);
    } catch (e) {
      sender.send(JSON.stringify({ error: "Invalid Clerk token." }));
      return;
    }
  }

  private handleTypingEvent(
    type: "typing-start" | "typing-stop",
    userId: string,
    displayName: string,
    sender: Party.Connection
  ) {
    if (type === "typing-start") {
      // Clear any existing timeout for this user
      const existing = this.typingUsers.get(userId);
      if (existing) {
        clearTimeout(existing.timeout);
      }

      // Set new typing status with auto-cleanup timeout
      const timeout = setTimeout(() => {
        this.clearTypingStatus(userId);
      }, this.TYPING_TIMEOUT);

      this.typingUsers.set(userId, { displayName, timeout });

      // Broadcast typing start to all other clients
      this.room.broadcast(
        JSON.stringify({
          type: "typing-start",
          userId: userId,
          displayName: displayName,
          timestamp: Date.now(),
          roomId: this.room.id,
        }),
        [sender.id] // Exclude the sender
      );
    } else if (type === "typing-stop") {
      this.clearTypingStatus(userId);
    }
  }

  private clearTypingStatus(userId: string) {
    const existing = this.typingUsers.get(userId);
    if (existing) {
      clearTimeout(existing.timeout);
      this.typingUsers.delete(userId);

      // Broadcast typing stop to all clients
      this.room.broadcast(
        JSON.stringify({
          type: "typing-stop",
          userId: userId,
          displayName: existing.displayName,
          timestamp: Date.now(),
          roomId: this.room.id,
        })
      );
    }
  }

  async onClose(connection: Party.Connection) {
    const clerkUser = (connection as any).clerkUser;
    console.log(
      `🔌 Connection closed in room ${this.room.id}`,
      clerkUser ? `for user ${clerkUser.sub}` : "(unauthenticated)"
    );

    // Clean up typing status when user disconnects
    if (clerkUser) {
      this.clearTypingStatus(clerkUser.sub as string);
    }
  }
}

Server satisfies Party.Worker;
