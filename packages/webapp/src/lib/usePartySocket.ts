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

export interface StreamingAiMessage {
  streamId: string;
  content: string;
  isActive: boolean;
  timestamp: number;
}

export interface SettingsUpdateMessage {
  type: "settings-update";
  settings: {
    aiMode: string;
    aiEnabled: boolean;
  };
  timestamp: number;
  updatedBy: {
    id: number;
    displayName: string;
  };
  roomId: string;
  receivedAt: number;
}

export interface MemberEventMessage {
  type: "member-joined" | "member-removed";
  member: {
    id: number;
    name: string;
    role: string;
  };
  timestamp: number;
  chatroomId: string;
}

export interface TypingEventMessage {
  type: "typing-start" | "typing-stop";
  userId: string;
  displayName: string;
  timestamp: number;
  roomId: string;
}

export function usePartySocket({
  chatroomId,
  user,
  onSettingsUpdate,
  onMemberEvent,
  onTypingEvent,
}: {
  chatroomId: string;
  user: string;
  onSettingsUpdate?: (update: SettingsUpdateMessage) => void;
  onMemberEvent?: (event: MemberEventMessage) => void;
  onTypingEvent?: (event: TypingEventMessage) => void;
}) {
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [streamingAiMessage, setStreamingAiMessage] =
    useState<StreamingAiMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const connRef = useRef<PartySocket | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Track typing timeout for auto-cleanup
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

          // Handle settings updates
          if (data.type === "settings-update" && onSettingsUpdate) {
            onSettingsUpdate(data as SettingsUpdateMessage);
            return;
          }

          // Handle member events
          if (
            (data.type === "member-joined" || data.type === "member-removed") &&
            onMemberEvent
          ) {
            onMemberEvent(data as MemberEventMessage);
            return;
          }

          // Handle typing events
          if (data.type === "typing-start" || data.type === "typing-stop") {
            if (onTypingEvent) {
              onTypingEvent(data as TypingEventMessage);
            }

            // Update local typing state
            if (isMounted) {
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                if (data.type === "typing-start") {
                  newSet.add(data.userId);
                } else {
                  newSet.delete(data.userId);
                }
                return newSet;
              });
            }
            return;
          }

          // Handle AI streaming events
          if (data.type === "ai-stream") {
            if (data.streamType === "start") {
              setStreamingAiMessage({
                streamId: data.streamId,
                content: "",
                isActive: true,
                timestamp: data.timestamp,
              });
            } else if (data.streamType === "token") {
              setStreamingAiMessage((prev) => {
                if (!prev || prev.streamId !== data.streamId) return prev;
                return {
                  ...prev,
                  content: prev.content + data.token,
                  timestamp: data.timestamp,
                };
              });
            } else if (data.streamType === "complete") {
              setStreamingAiMessage((prev) => {
                if (!prev || prev.streamId !== data.streamId) return prev;
                return {
                  ...prev,
                  isActive: false,
                };
              });
              // Clear streaming message after a delay
              setTimeout(() => {
                setStreamingAiMessage(null);
              }, 500);
            }
            return;
          }

          // Handle regular messages
          if (isMounted) setMessages((prev) => [...prev, data]);
        } catch (e) {
          // ignore malformed
        }
      });
    })();
    return () => {
      isMounted = false;
      if (conn) conn.close();
      // Clear typing timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    chatroomId,
    user,
    isLoaded,
    isSignedIn,
    getToken,
    onSettingsUpdate,
    onMemberEvent,
    onTypingEvent,
  ]);

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

  const sendTypingStart = async () => {
    if (!connRef.current) return;
    const token = await getToken();
    if (!token) return;
    connRef.current.send(
      JSON.stringify({
        type: "typing-start",
        token,
        displayName: user, // Pass the display name from the frontend
      })
    );
  };

  const sendTypingStop = async () => {
    if (!connRef.current) return;
    const token = await getToken();
    if (!token) return;
    connRef.current.send(
      JSON.stringify({
        type: "typing-stop",
        token,
        displayName: user, // Pass the display name from the frontend
      })
    );
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    streamingAiMessage,
    typingUsers,
    sendTypingStart,
    sendTypingStop,
  };
}
