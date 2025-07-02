import type * as Party from "partykit/server";
import { verifyToken } from "@clerk/backend";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

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
