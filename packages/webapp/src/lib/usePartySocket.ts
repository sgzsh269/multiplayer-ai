import { useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";

export interface PartyMessage {
  type: string;
  text: string;
  sentAt: number;
  user: string;
  senderId?: string;
  roomId?: string;
  receivedAt?: number;
}

export function usePartySocket({
  chatroomId,
  user,
}: {
  chatroomId: string;
  user: string;
}) {
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const connRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!chatroomId || !user) return;
    const conn = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: chatroomId,
    });
    connRef.current = conn;

    conn.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (e) {
        // ignore malformed
      }
    });
    return () => {
      conn.close();
    };
  }, [chatroomId, user]);

  const sendMessage = (text: string) => {
    if (!connRef.current) return;
    connRef.current.send(
      JSON.stringify({
        type: "chat-message",
        text,
        sentAt: Date.now(),
        user,
      })
    );
  };

  return { messages, sendMessage };
}
