import { useEffect, useRef, useState, useCallback } from "react";
import PartySocket from "partysocket";
import { useAuth } from "@clerk/nextjs";

export interface PartyMessage {
  type: string;
  text: string;
  sentAt: number;
  user: string;
  senderId?: string;
  userId?: string;
  displayName?: string;
  roomId?: string;
  receivedAt?: number;
  isAiMessage?: boolean;
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
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!chatroomId || !user || !isLoaded || !isSignedIn) return;
    let conn: PartySocket | null = null;
    let isMounted = true;
    (async () => {
      const token = await getToken();
      if (!token) return;
      conn = new PartySocket({
        host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
        room: chatroomId,
        query: { token },
      });
      connRef.current = conn;
      conn.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (isMounted) setMessages((prev) => [...prev, data]);
        } catch (e) {
          // ignore malformed
        }
      });
    })();
    return () => {
      isMounted = false;
      if (conn) conn.close();
    };
  }, [chatroomId, user, isLoaded, isSignedIn, getToken]);

  const sendMessage = async (text: string) => {
    if (!connRef.current) return;
    const token = await getToken();
    if (!token) return;
    connRef.current.send(
      JSON.stringify({
        type: "chat-message",
        text,
        sentAt: Date.now(),
        user,
        token,
      })
    );
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearMessages };
}
