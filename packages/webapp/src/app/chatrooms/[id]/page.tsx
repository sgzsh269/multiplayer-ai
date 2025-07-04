"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pause,
  MoreHorizontal,
  Send,
  Users,
  MessageSquare,
  FileText,
  Brain,
  Download,
  Share2,
  Settings,
  Trash2,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import React from "react";
import {
  usePartySocket,
  PartyMessage,
  StreamingAiMessage,
  MemberEventMessage,
  TypingEventMessage,
} from "@/lib/usePartySocket";
import { useUser } from "@clerk/nextjs";

interface Participant {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  isTyping: boolean;
  avatarInitials: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  } | null;
  timestamp?: string;
  createdAt?: string;
  content: string;
  isAiMessage?: boolean;
  aiModel?: string;
}

interface ChatroomDetails {
  id: string;
  name: string;
  startedAgo: string;
  participantsActive: number;
  participants: Participant[];
  messages: Message[];
  sessionInfo: {
    started: string;
    messages: number;
    filesShared: number;
    aiInteractions: number;
  };
  aiSettings?: {
    aiMode: "auto-respond" | "summoned";
    aiEnabled: boolean;
    aiSystemMessage?: string;
  };
}

export default function ChatroomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      setChatroomId(resolved.id);
    };
    resolveParams();
  }, [params]);

  // In a real application, you would fetch data using React Query here
  const {
    data: chatroom,
    isLoading,
    isError,
  } = useQuery<ChatroomDetails>({
    queryKey: ["chatroom", chatroomId],
    queryFn: async () => {
      const res = await fetch(`/api/chatrooms/${chatroomId}`);
      if (!res.ok) throw new Error("Failed to fetch chatroom details");
      const json = await res.json();
      return json.chatroom;
    },
    enabled: !!chatroomId, // Only run the query if chatroomId is available
  });

  const [messageInput, setMessageInput] = useState("");
  const queryClient = useQueryClient();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    aiMode: "auto-respond" as "auto-respond" | "summoned",
    aiEnabled: true,
    aiSystemMessage: "",
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [settingsNotification, setSettingsNotification] = useState<{
    show: boolean;
    message: string;
    updatedBy: string;
  }>({ show: false, message: "", updatedBy: "" });
  const [streamingAiMessage, setStreamingAiMessage] = useState<{
    content: string;
    isStreaming: boolean;
    messageId?: string;
  }>({ content: "", isStreaming: false });

  // Modal state for AI system message editing
  const [isSystemMessageModalOpen, setIsSystemMessageModalOpen] =
    useState(false);
  const [tempSystemMessage, setTempSystemMessage] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [memberNotification, setMemberNotification] = useState<{
    show: boolean;
    message: string;
    type: "joined" | "removed";
  }>({ show: false, message: "", type: "joined" });

  // Typing state management
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const lastKeystrokeRef = useRef<number>(0);
  const typingCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the chatroom messages query to refetch data
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
    },
  });

  const handleStreamingAiResponse = async ({
    message,
    triggerType,
  }: {
    message: string;
    triggerType: string;
  }) => {
    // Start streaming
    setStreamingAiMessage({ content: "", isStreaming: true });
    setShouldAutoScroll(true);

    try {
      const res = await fetch(`/api/chatrooms/${chatroomId}/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, triggerType }),
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("No response body reader");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                setStreamingAiMessage((prev) => ({
                  ...prev,
                  content: prev.content + parsed.token,
                }));
              } else if (parsed.complete) {
                setStreamingAiMessage((prev) => ({
                  ...prev,
                  isStreaming: false,
                  messageId: parsed.messageId,
                }));
                // Refresh the chatroom data to get the complete message
                queryClient.invalidateQueries({
                  queryKey: ["chatroom", chatroomId],
                });
                // Clear streaming message after a delay
                setTimeout(() => {
                  setStreamingAiMessage({ content: "", isStreaming: false });
                }, 500);
              }
            } catch (e) {
              console.error("Failed to parse streaming data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming AI response error:", error);
      setStreamingAiMessage({ content: "", isStreaming: false });
      throw error;
    }
  };

  const aiResponseMutation = useMutation({
    mutationFn: handleStreamingAiResponse,
    onError: (error) => {
      console.error("AI response error:", error);
      setStreamingAiMessage({ content: "", isStreaming: false });
    },
  });

  const updateAiSettingsMutation = useMutation({
    mutationFn: async (settings: {
      aiMode?: string;
      aiEnabled?: boolean;
      aiSystemMessage?: string;
    }) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update AI settings");
      return res.json();
    },
    onSuccess: (data) => {
      setAiSettings({
        ...data.settings,
        aiSystemMessage: data.settings.aiSystemMessage || "",
      });
    },
  });

  const deleteAllMessagesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/messages`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete messages");
      }
      return res.json();
    },
    onSuccess: () => {
      // Refetch chatroom data to update the messages list
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      setIsDeleteConfirmOpen(false);
    },
    onError: (error: any) => {
      console.error("Failed to delete messages:", error);
      alert(`Failed to delete messages: ${error.message}`);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId: memberId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove member");
      }
      return res.json();
    },
    onSuccess: () => {
      // Refetch chatroom data to update the participants list
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });
      setMemberToRemove(null);
    },
    onError: (error: any) => {
      console.error("Failed to remove member:", error);
      alert(`Failed to remove member: ${error.message}`);
    },
  });

  // Modal functions for AI system message editing
  const handleOpenSystemMessageModal = () => {
    setTempSystemMessage(aiSettings.aiSystemMessage || "");
    setIsSystemMessageModalOpen(true);
  };

  const handleSaveSystemMessage = () => {
    updateAiSettingsMutation.mutate({ aiSystemMessage: tempSystemMessage });
    setIsSystemMessageModalOpen(false);
  };

  const handleCancelSystemMessage = () => {
    setTempSystemMessage("");
    setIsSystemMessageModalOpen(false);
  };

  const { user: clerkUser } = useUser();
  const displayName =
    clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.firstName ||
        clerkUser?.username ||
        clerkUser?.emailAddresses?.[0]?.emailAddress ||
        "User";

  // Check if current user is admin
  const isCurrentUserAdmin = useMemo(() => {
    if (!clerkUser || !chatroom) return false;
    const userParticipant = chatroom.participants.find(
      (p) => p.name === displayName
    );
    return userParticipant?.role === "admin";
  }, [clerkUser, chatroom, displayName]);

  // Function to render message content with highlighted @AI mentions
  const renderMessageContent = (content: string) => {
    // Split the content by @AI mentions
    const parts = content.split(/(@AI\b)/gi);

    return parts.map((part, index) => {
      if (part.toLowerCase() === "@ai") {
        return (
          <Badge
            key={index}
            variant="secondary"
            className="inline-flex items-center bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 mx-1"
          >
            @AI
          </Badge>
        );
      }
      return part;
    });
  };

  // Share link functionality
  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/chatrooms/${chatroomId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback: select and copy using document.execCommand
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle real-time settings updates
  const handleSettingsUpdate = useCallback(
    (update: any) => {
      // Update local settings state
      setAiSettings(update.settings);

      // Show notification if updated by someone else
      if (update.updatedBy.displayName !== displayName) {
        const aiModeLabel =
          update.settings.aiMode === "auto-respond"
            ? "Auto-respond"
            : "Summoned";
        const statusLabel = update.settings.aiEnabled ? "enabled" : "disabled";
        const message = `AI settings updated: ${aiModeLabel} mode, AI ${statusLabel}`;

        setSettingsNotification({
          show: true,
          message,
          updatedBy: update.updatedBy.displayName,
        });

        // Hide notification after 5 seconds
        setTimeout(() => {
          setSettingsNotification((prev) => ({ ...prev, show: false }));
        }, 5000);
      }
    },
    [displayName]
  );

  // Handle real-time member events
  const handleMemberEvent = useCallback(
    (event: MemberEventMessage) => {
      const isJoined = event.type === "member-joined";
      const message = isJoined
        ? `${event.member.name} joined the chatroom`
        : `${event.member.name} left the chatroom`;

      setMemberNotification({
        show: true,
        message,
        type: isJoined ? "joined" : "removed",
      });

      // Refresh the chatroom data to update the participants list
      queryClient.invalidateQueries({ queryKey: ["chatroom", chatroomId] });

      // Hide notification after 4 seconds
      setTimeout(() => {
        setMemberNotification((prev) => ({ ...prev, show: false }));
      }, 4000);
    },
    [queryClient, chatroomId]
  );

  // Handle real-time typing events
  const handleTypingEvent = useCallback(
    (event: TypingEventMessage) => {
      // Filter out our own typing events
      if (event.userId === clerkUser?.id) {
        return;
      }

      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (event.type === "typing-start") {
          newMap.set(event.userId, event.displayName);
        } else {
          newMap.delete(event.userId);
        }
        return newMap;
      });
    },
    [clerkUser?.id]
  );

  // Add PartyKit real-time messaging
  const {
    messages: partyMessages,
    sendMessage: sendPartyMessage,
    clearMessages,
    streamingAiMessage: partyStreamingAiMessage,
    sendTypingStart,
    sendTypingStop,
  } = usePartySocket({
    chatroomId: chatroomId || "",
    user: displayName,
    onSettingsUpdate: handleSettingsUpdate,
    onMemberEvent: handleMemberEvent,
    onTypingEvent: handleTypingEvent,
  });

  // Clear PartyKit messages when chatroom data changes (to prevent accumulation)
  useEffect(() => {
    if (chatroom) {
      // Reset PartyKit messages when we get fresh API data
      // This prevents infinite accumulation of real-time messages
      clearMessages();

      // Load AI settings if available
      if (chatroom.aiSettings) {
        setAiSettings({
          ...chatroom.aiSettings,
          aiSystemMessage: chatroom.aiSettings.aiSystemMessage || "",
        });
      }
    }
  }, [chatroom, clearMessages]);

  // Combine API and PartyKit messages with deduplication
  const messageMap = new Map<string, any>();

  // Add API messages first
  (chatroom?.messages || []).forEach((msg) => {
    const senderId = msg.isAiMessage
      ? "ai-assistant"
      : msg.sender?.id || "unknown";
    // Fix timestamp mapping - API returns createdAt
    const timestamp = msg.createdAt || msg.timestamp;
    const key = `${senderId}-${timestamp}-${msg.content}`;
    messageMap.set(key, {
      ...msg,
      timestamp: timestamp ? new Date(timestamp).toLocaleTimeString() : "",
      _source: "api",
      sender: msg.isAiMessage
        ? { id: "ai-assistant", name: "AI Assistant", avatarUrl: null }
        : msg.sender,
    });
  });

  // Add PartyKit messages, avoiding duplicates
  partyMessages.forEach((m, i) => {
    const key = `${m.userId || m.user}-${
      m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : ""
    }-${m.text}`;
    if (!messageMap.has(key)) {
      messageMap.set(key, {
        id: m.sentAt ? `realtime-${m.sentAt}` : `realtime-${i}`,
        sender: {
          id: m.userId || m.user,
          name: m.displayName || m.user || "User",
          avatarUrl: null,
        },
        timestamp: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : "",
        content: m.text,
        isAiMessage: m.isAiMessage || false,
        _source: "realtime",
      });
    }
  });

  const allMessages = Array.from(messageMap.values());

  // Add local streaming AI message if active
  if (streamingAiMessage.isStreaming && streamingAiMessage.content) {
    allMessages.push({
      id: "streaming-ai-local",
      sender: { id: "ai-assistant", name: "AI Assistant", avatarUrl: null },
      timestamp: new Date().toLocaleTimeString(),
      content: streamingAiMessage.content,
      isAiMessage: true,
      _source: "streaming-local",
      _isStreaming: true,
    });
  }

  // Add remote streaming AI message if active (from other users) and not already streaming locally
  if (
    partyStreamingAiMessage?.isActive &&
    partyStreamingAiMessage.content &&
    !streamingAiMessage.isStreaming
  ) {
    allMessages.push({
      id: "streaming-ai-remote",
      sender: { id: "ai-assistant", name: "AI Assistant", avatarUrl: null },
      timestamp: new Date(
        partyStreamingAiMessage.timestamp
      ).toLocaleTimeString(),
      content: partyStreamingAiMessage.content,
      isAiMessage: true,
      _source: "streaming-remote",
      _isStreaming: true,
    });
  }

  // Auto-scroll to bottom only when the current user sends a message or AI is streaming
  useEffect(() => {
    if (
      shouldAutoScroll ||
      streamingAiMessage.isStreaming ||
      partyStreamingAiMessage?.isActive
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (
        !streamingAiMessage.isStreaming &&
        !partyStreamingAiMessage?.isActive
      ) {
        setShouldAutoScroll(false); // Reset the flag only when not streaming
      }
    }
  }, [
    allMessages.length,
    shouldAutoScroll,
    streamingAiMessage.content,
    partyStreamingAiMessage?.content,
  ]);

  // Typing status checker - runs every 2 seconds to check if user is still typing
  useEffect(() => {
    if (isCurrentlyTyping) {
      typingCheckIntervalRef.current = setInterval(() => {
        const timeSinceLastKeystroke = Date.now() - lastKeystrokeRef.current;

        // If no keystroke in the last 2 seconds, stop typing
        if (timeSinceLastKeystroke > 2000) {
          setIsCurrentlyTyping(false);
          sendTypingStop();
        } else {
          // Send heartbeat to keep typing indicator alive
          sendTypingStart();
        }
      }, 2000);
    } else {
      // Clear interval when not typing
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
        typingCheckIntervalRef.current = null;
      }
    }

    return () => {
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
        typingCheckIntervalRef.current = null;
      }
    };
  }, [isCurrentlyTyping, sendTypingStart, sendTypingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
      }
      if (isCurrentlyTyping) {
        sendTypingStop();
      }
    };
  }, [isCurrentlyTyping, sendTypingStop]);

  // Handle input changes - simplified approach
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    lastKeystrokeRef.current = Date.now();

    if (value.length > 0) {
      // Start typing if not already typing
      if (!isCurrentlyTyping) {
        setIsCurrentlyTyping(true);
        sendTypingStart();
      }
    } else {
      // Stop typing immediately if input is cleared
      if (isCurrentlyTyping) {
        setIsCurrentlyTyping(false);
        sendTypingStop();
      }
    }
  };

  // Helper function to handle sending messages
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setShouldAutoScroll(true); // Mark for auto-scroll
      const content = messageInput.trim();

      // Stop typing when sending message
      if (isCurrentlyTyping) {
        setIsCurrentlyTyping(false);
        sendTypingStop();
      }

      // Send the user message
      sendMessageMutation.mutate(content);
      sendPartyMessage(content);
      setMessageInput("");

      // Check if AI should respond
      const hasAiMention = content.toLowerCase().includes("@ai");
      const shouldTriggerAi =
        aiSettings.aiEnabled &&
        (aiSettings.aiMode === "auto-respond" ||
          (aiSettings.aiMode === "summoned" && hasAiMention));

      if (shouldTriggerAi) {
        // Trigger AI response with a small delay to ensure user message is processed first
        setTimeout(() => {
          const triggerType = hasAiMention ? "mention" : "auto-respond";
          aiResponseMutation.mutate({
            message: content,
            triggerType,
          });
        }, 200);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading chatroom...
      </div>
    );
  }

  if (isError || !chatroom) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Failed to load chatroom or chatroom not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Settings Update Notification */}
      {settingsNotification.show && (
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              <strong>{settingsNotification.updatedBy}</strong>{" "}
              {settingsNotification.message}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSettingsNotification((prev) => ({ ...prev, show: false }))
            }
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </Button>
        </div>
      )}

      {/* Member Event Notification */}
      {memberNotification.show && (
        <div
          className={`border-b p-3 flex items-center justify-between ${
            memberNotification.type === "joined"
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {memberNotification.type === "joined" ? (
              <Users className="w-4 h-4 text-green-600" />
            ) : (
              <UserMinus className="w-4 h-4 text-orange-600" />
            )}
            <span
              className={`text-sm ${
                memberNotification.type === "joined"
                  ? "text-green-800"
                  : "text-orange-800"
              }`}
            >
              {memberNotification.message}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setMemberNotification((prev) => ({ ...prev, show: false }))
            }
            className={
              memberNotification.type === "joined"
                ? "text-green-600 hover:text-green-800"
                : "text-orange-600 hover:text-orange-800"
            }
          >
            ×
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{chatroom.name}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className={
              linkCopied ? "bg-green-50 border-green-200 text-green-700" : ""
            }
          >
            <Share2 className="w-4 h-4 mr-2" />
            {linkCopied ? "Link Copied!" : "Share Invite Link"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Content */}
        <main className="flex-1 flex flex-col bg-white border-r">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {allMessages.map((message, index) => {
              const isAiMessage =
                message.isAiMessage || message.sender?.id === "ai-assistant";
              const senderName = message.sender?.name || "Unknown User";
              const avatarInitials =
                message.sender?.firstName && message.sender?.lastName
                  ? `${message.sender.firstName[0]}${message.sender.lastName[0]}`.toUpperCase()
                  : message.sender?.firstName
                  ? message.sender.firstName[0].toUpperCase()
                  : senderName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U";

              return (
                <div
                  key={`${message._source}-${message.id}`}
                  className="flex items-start space-x-3"
                >
                  <Avatar
                    className={
                      isAiMessage
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : ""
                    }
                  >
                    <AvatarFallback
                      className={isAiMessage ? "text-white bg-transparent" : ""}
                    >
                      {isAiMessage ? "🤖" : avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center px-1 gap-2">
                      <span
                        className={`font-semibold ${
                          isAiMessage ? "text-purple-700" : "text-gray-900"
                        }`}
                      >
                        {senderName}
                      </span>
                      {isAiMessage && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                          AI Assistant
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {message.timestamp}
                      </span>
                    </div>
                    <Card
                      className={`mt-1 max-w-[60%] py-0 ${
                        isAiMessage
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 border-purple-200"
                          : "bg-gray-100"
                      }`}
                    >
                      <CardContent className="p-0 text-sm">
                        <div className="m-0 p-3 leading-tight *:my-0">
                          {renderMessageContent(message.content)}
                          {(message as any)._isStreaming && (
                            <span className="inline-flex items-center ml-1">
                              <span className="animate-pulse text-purple-600">
                                ●
                              </span>
                              <span className="ml-1 text-xs text-purple-600 animate-pulse">
                                AI typing...
                              </span>
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message"
                  className="w-full min-h-[44px] max-h-[120px] resize-none"
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                />
              </div>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-shrink-0"
                onClick={handleSendMessage}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {/* Fixed height typing indicator area to prevent jitter */}
            <div className="h-6 flex items-center space-x-2 mt-2 px-1">
              {typingUsers.size > 0 ? (
                <>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce typing-dot-1"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce typing-dot-2"></div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce typing-dot-3"></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Array.from(typingUsers.values()).length === 1
                      ? `${Array.from(typingUsers.values())[0]} is typing...`
                      : Array.from(typingUsers.values()).length === 2
                      ? `${Array.from(typingUsers.values()).join(
                          " and "
                        )} are typing...`
                      : `${Array.from(typingUsers.values())
                          .slice(0, -1)
                          .join(", ")} and ${Array.from(
                          typingUsers.values()
                        ).slice(-1)} are typing...`}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l p-6 flex flex-col space-y-6">
          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Participants ({chatroom.participants.length})
              </h2>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {chatroom.participants.map((participant) => {
                const isTyping = typingUsers.has(participant.id);
                return (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {participant.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {participant.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.role}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isTyping && (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce typing-dot-1"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce typing-dot-2"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce typing-dot-3"></div>
                          </div>
                          <span className="text-xs text-blue-500">
                            typing...
                          </span>
                        </div>
                      )}
                      {isCurrentUserAdmin &&
                        participant.name !== displayName && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setMemberToRemove({
                                id: participant.id,
                                name: participant.name,
                              })
                            }
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-6 w-6"
                            disabled={removeMemberMutation.isPending}
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Settings
              </h2>
              <Brain className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {/* AI Mode Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  AI Assistant Mode
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={updateAiSettingsMutation.isPending}
                    >
                      <span>
                        {!aiSettings.aiEnabled
                          ? "Disabled"
                          : aiSettings.aiMode === "auto-respond"
                          ? "Auto-respond Mode"
                          : "Summoned Mode (@AI only)"}
                      </span>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onClick={() =>
                        updateAiSettingsMutation.mutate({
                          aiEnabled: false,
                        })
                      }
                      className={!aiSettings.aiEnabled ? "bg-gray-50" : ""}
                    >
                      Disabled
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateAiSettingsMutation.mutate({
                          aiEnabled: true,
                          aiMode: "auto-respond",
                        })
                      }
                      className={
                        aiSettings.aiEnabled &&
                        aiSettings.aiMode === "auto-respond"
                          ? "bg-gray-50"
                          : ""
                      }
                    >
                      Auto-respond Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateAiSettingsMutation.mutate({
                          aiEnabled: true,
                          aiMode: "summoned",
                        })
                      }
                      className={
                        aiSettings.aiEnabled && aiSettings.aiMode === "summoned"
                          ? "bg-gray-50"
                          : ""
                      }
                    >
                      Summoned Mode (@AI only)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Edit System Message Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSystemMessageModal}
                className="w-full justify-start"
                disabled={updateAiSettingsMutation.isPending}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit System Message
              </Button>
            </div>
          </div>

          {/* Admin Actions */}
          {isCurrentUserAdmin && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Admin Actions
                </h2>
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  disabled={deleteAllMessagesMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Messages
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* AI System Message Modal */}
      <Dialog
        open={isSystemMessageModalOpen}
        onOpenChange={setIsSystemMessageModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit AI System Message</DialogTitle>
            <DialogDescription>
              Customize how the AI assistant behaves in this chatroom by editing
              its system message.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="system-message" className="text-sm font-medium">
                System Message
              </label>
              <Textarea
                id="system-message"
                placeholder="Enter the system message that defines how the AI assistant should behave..."
                className="min-h-[150px]"
                value={tempSystemMessage}
                onChange={(e) => setTempSystemMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This message tells the AI how to behave. For example: "You are a
                helpful coding assistant. Always provide code examples and
                explain your reasoning."
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSystemMessage}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSystemMessage}
              disabled={updateAiSettingsMutation.isPending}
            >
              {updateAiSettingsMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Messages Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete All Messages
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all messages in this chatroom?
              This action cannot be undone and will permanently remove all
              conversation history.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  This will delete all {chatroom?.messages?.length || 0}{" "}
                  messages
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteAllMessagesMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAllMessagesMutation.mutate()}
              disabled={deleteAllMessagesMutation.isPending}
            >
              {deleteAllMessagesMutation.isPending
                ? "Deleting..."
                : "Delete All Messages"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.name}</strong> from this chatroom? They
              will lose access to all messages and won't be able to participate
              unless invited again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <UserMinus className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  This action cannot be undone
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={removeMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                memberToRemove && removeMemberMutation.mutate(memberToRemove.id)
              }
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
