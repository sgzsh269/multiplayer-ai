import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // let's send a message to the connection
    conn.send("hello from server");
  }

  onMessage(message: string, sender: Party.Connection) {
    // Try to parse the message as JSON
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.warn("Received non-JSON message:", message);
      return;
    }
    // Log the message
    console.log(`connection ${sender.id} sent message:`, parsed);
    // Broadcast the structured message to all clients (including sender)
    this.room.broadcast(
      JSON.stringify({
        ...parsed,
        senderId: sender.id,
        roomId: this.room.id,
        receivedAt: Date.now(),
      })
    );
  }
}

Server satisfies Party.Worker;
