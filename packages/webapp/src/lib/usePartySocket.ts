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
    aiSystemMessage?: string;
  };
  updatedFields?: {
    aiMode?: boolean;
    aiEnabled?: boolean;
    aiSystemMessage?: boolean;
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

export interface MessagesClearedEvent {
  type: "messages-cleared";
  chatroomId: string;
  clearedBy: {
    id: string;
    name: string;
  };
  timestamp: number;
  receivedAt: number;
}

export function usePartySocket({
  chatroomId,
  user,
  onSettingsUpdate,
  onMemberEvent,
  onTypingEvent,
  onMessagesClear,
}: {
  chatroomId: string;
  user: string;
  onSettingsUpdate?: (update: SettingsUpdateMessage) => void;
  onMemberEvent?: (event: MemberEventMessage) => void;
  onTypingEvent?: (event: TypingEventMessage) => void;
  onMessagesClear?: (event: MessagesClearedEvent) => void;
}) {
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [streamingAiMessage, setStreamingAiMessage] =
    useState<StreamingAiMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const connRef = useRef<PartySocket | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Track typing timeout for auto-cleanup
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to store callback functions to avoid dependency issues
  const onSettingsUpdateRef = useRef(onSettingsUpdate);
  const onMemberEventRef = useRef(onMemberEvent);
  const onTypingEventRef = useRef(onTypingEvent);
  const onMessagesClearRef = useRef(onMessagesClear);

  // Update refs when callbacks change
  useEffect(() => {
    onSettingsUpdateRef.current = onSettingsUpdate;
  }, [onSettingsUpdate]);

  useEffect(() => {
    onMemberEventRef.current = onMemberEvent;
  }, [onMemberEvent]);

  useEffect(() => {
    onTypingEventRef.current = onTypingEvent;
  }, [onTypingEvent]);

  useEffect(() => {
    onMessagesClearRef.current = onMessagesClear;
  }, [onMessagesClear]);

  // Clear messages when chatroom changes to prevent cross-chatroom message leakage
  useEffect(() => {
    setMessages([]);
    setStreamingAiMessage(null);
    setTypingUsers(new Map());
  }, [chatroomId]);

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
          // Check if the message is JSON before parsing
          const messageData = event.data;
          if (
            typeof messageData !== "string" ||
            (!messageData.startsWith("{") && !messageData.startsWith("["))
          ) {
            console.log("📢 PartyKit non-JSON message:", messageData);
            return;
          }

          const data = JSON.parse(messageData);
          console.log("🎉 PartyKit message received:", data);

          // Handle settings updates
          if (data.type === "settings-update" && onSettingsUpdateRef.current) {
            console.log("⚙️ Settings update:", data);
            onSettingsUpdateRef.current(data as SettingsUpdateMessage);
            return;
          }

          // Handle member events
          if (
            (data.type === "member-joined" || data.type === "member-removed") &&
            onMemberEventRef.current
          ) {
            console.log("👥 Member event:", data);
            onMemberEventRef.current(data as MemberEventMessage);
            return;
          }

          // Handle typing events
          if (data.type === "typing-start" || data.type === "typing-stop") {
            console.log("⌨️ Typing event:", data);
            if (onTypingEventRef.current) {
              onTypingEventRef.current(data as TypingEventMessage);
            }

            // Update local typing state
            if (isMounted) {
              setTypingUsers((prev) => {
                const newMap = new Map(prev);
                if (data.type === "typing-start") {
                  newMap.set(data.userId, data.displayName);
                } else {
                  newMap.delete(data.userId);
                }
                return newMap;
              });
            }
            return;
          }

          // Handle messages cleared event
          if (data.type === "messages-cleared") {
            console.log("🧹 Messages cleared event:", data);
            if (onMessagesClearRef.current) {
              onMessagesClearRef.current(data as MessagesClearedEvent);
            }
            // Clear local messages state
            if (isMounted) {
              setMessages([]);
              setStreamingAiMessage(null);
            }
            return;
          }

          // Handle AI streaming events
          if (data.type === "ai-stream") {
            console.log("🤖 AI stream event:", data);
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

                // Don't convert to permanent message here - the server will send the actual message
                // Just mark as inactive and let the server-sent message handle persistence

                return {
                  ...prev,
                  isActive: false,
                };
              });

              // Clear streaming message after a short delay to allow server message to arrive
              setTimeout(() => {
                setStreamingAiMessage(null);
              }, 1000);
            }
            return;
          }

          // Handle regular messages
          console.log("💬 Adding regular message to state:", data);
          if (isMounted)
            setMessages((prev) => {
              const newMessages = [...prev, data];
              console.log("📝 Updated messages state:", newMessages);
              return newMessages;
            });
        } catch (e) {
          console.error("❌ Error parsing PartyKit message:", e, event.data);
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
