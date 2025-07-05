"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  Brain,
  FileText,
  Upload,
  Clock,
  Settings,
  LogOut,
  Copy,
  ExternalLink,
  MessageSquare,
  Calendar,
  Filter,
  MoreHorizontal,
  Send,
  Hash,
  Share2,
  Link,
  Trash2,
  UserX,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePartySocket } from "@/lib/usePartySocket";
import {
  MemberEventMessage,
  SettingsUpdateMessage,
  MessagesClearedEvent,
} from "@/lib/usePartySocket";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Chatroom {
  id: string;
  name: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  participantCount: number;
  messageCount: number;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: "user" | "ai";
}

interface StatusNotification {
  id: string;
  type:
    | "member-joined"
    | "member-removed"
    | "settings-update"
    | "messages-cleared";
  content: string;
  timestamp: string;
  data?: any;
  isVisible?: boolean;
}

export default function Dashboard() {
  const [isCreateChatroomOpen, setIsCreateChatroomOpen] = useState(false);
  const [isJoinChatroomOpen, setIsJoinChatroomOpen] = useState(false);
  const [selectedChatroomId, setSelectedChatroomId] = useState<string | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    isStreaming: boolean;
  } | null>(null);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [aiSystemMessage, setAiSystemMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isClearMessagesOpen, setIsClearMessagesOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [removeMemberDialog, setRemoveMemberDialog] = useState<{
    isOpen: boolean;
    member: any | null;
  }>({ isOpen: false, member: null });
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for chatroom creation
  const [newChatroomName, setNewChatroomName] = useState("");
  const [createError, setCreateError] = useState("");
  const createChatroom = useMutation({
    mutationFn: async (name: string) => {
      setCreateError("");
      const res = await fetch("/api/chatrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCreateError(err.error || "Failed to create chatroom");
        throw new Error(err.error || "Failed to create chatroom");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsCreateChatroomOpen(false);
      setNewChatroomName("");
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      // Auto-select the newly created chatroom
      if (data?.chatroom?.id) {
        setSelectedChatroomId(data.chatroom.id);
      }
    },
  });

  // State for join
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");
  const joinChatroom = useMutation({
    mutationFn: async (input: string) => {
      setJoinError("");
      let joinUrl = input.trim();

      // Check if input is a secure invite URL
      if (joinUrl.startsWith("http")) {
        try {
          const url = new URL(joinUrl);
          const inviteMatch = url.pathname.match(/\/invite\/([a-zA-Z0-9_-]+)/);
          if (inviteMatch) {
            const inviteCode = inviteMatch[1];
            const res = await fetch(`/api/invite/${inviteCode}`, {
              method: "POST",
            });
            if (!res.ok) {
              const err = await res.json();
              setJoinError(err.error || "Failed to join via invite link");
              throw new Error(err.error || "Failed to join via invite link");
            }
            const data = await res.json();
            return { ...data, chatroomId: data.chatroomId };
          }
        } catch (error: any) {
          setJoinError("Invalid invite or chatroom URL format");
          throw new Error("Invalid URL format");
        }
      }

      // Handle direct invite codes and legacy UUIDs
      const res = await fetch(`/api/invite/${joinUrl}`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        setJoinError(err.error || "Failed to join chatroom");
        throw new Error(err.error || "Failed to join chatroom");
      }
      const data = await res.json();
      return { ...data, chatroomId: data.chatroomId };
    },
    onSuccess: (data) => {
      setIsJoinChatroomOpen(false);
      setJoinId("");
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      // Auto-select the joined chatroom
      if (data.chatroomId) {
        setSelectedChatroomId(data.chatroomId);
      }
    },
  });

  // Add state for initial message history
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);

  // Helper function to add notifications
  const addNotification = useCallback(
    (
      notification: Omit<StatusNotification, "id" | "timestamp" | "isVisible">
    ) => {
      const newNotification: StatusNotification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        isVisible: true,
      };
      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === newNotification.id ? { ...n, isVisible: false } : n
          )
        );
        // Remove from array after animation completes
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== newNotification.id)
          );
        }, 300);
      }, 4000);
    },
    []
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (user?.id) {
      fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          avatarUrl: user.imageUrl || null,
        }),
      });
    }
  }, [user]);

  const {
    data: chatrooms = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const res = await fetch("/api/chatrooms");
      if (!res.ok) throw new Error("Failed to fetch chatrooms");
      const json = await res.json();
      return json.chatrooms;
    },
  });

  // Auto-select first chatroom if none selected
  useEffect(() => {
    if (chatrooms.length > 0 && !selectedChatroomId) {
      setSelectedChatroomId(chatrooms[0].id);
    }
  }, [chatrooms, selectedChatroomId]);

  const selectedChatroom = chatrooms.find(
    (room: Chatroom) => room.id === selectedChatroomId
  );

  // Fetch participants for selected chatroom
  const { data: participants = [] } = useQuery({
    queryKey: ["participants", selectedChatroomId],
    queryFn: async () => {
      if (!selectedChatroomId) return [];
      const res = await fetch(`/api/chatrooms/${selectedChatroomId}/members`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.members || [];
    },
    enabled: !!selectedChatroomId,
  });

  // Check if current user is admin of selected chatroom
  const currentUserParticipant = participants.find((p: any) => {
    // Try multiple ways to match the current user
    return (
      p.user?.clerkId === user?.id ||
      p.clerkId === user?.id ||
      p.userId === user?.id ||
      (p.user?.firstName === user?.firstName &&
        p.user?.lastName === user?.lastName)
    );
  });
  const isCurrentUserAdmin = currentUserParticipant?.role === "admin";

  // Get current user's database ID for message filtering
  const currentUserDbId =
    currentUserParticipant?.userId || currentUserParticipant?.user?.id;

  // Fetch AI settings for selected chatroom
  const { data: aiSettings, refetch: refetchAiSettings } = useQuery({
    queryKey: ["ai-settings", selectedChatroomId],
    queryFn: async () => {
      if (!selectedChatroomId) return null;
      const res = await fetch(`/api/chatrooms/${selectedChatroomId}/settings`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.settings;
    },
    enabled: !!selectedChatroomId,
  });

  // Update AI settings mutation
  const updateAiSettingsMutation = useMutation({
    mutationFn: async ({
      chatroomId,
      settings,
    }: {
      chatroomId: string;
      settings: any;
    }) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        throw new Error("Failed to update AI settings");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchAiSettings();
      setIsAiSettingsOpen(false);
    },
  });

  const handleAiModeToggle = () => {
    if (!selectedChatroomId || !aiSettings) return;

    const newMode =
      aiSettings.aiMode === "auto-respond" ? "summoned" : "auto-respond";
    updateAiSettingsMutation.mutate({
      chatroomId: selectedChatroomId,
      settings: { aiMode: newMode },
    });
  };

  const handleSaveAiSettings = () => {
    if (!selectedChatroomId) return;

    updateAiSettingsMutation.mutate({
      chatroomId: selectedChatroomId,
      settings: { aiSystemMessage },
    });
  };

  // Set initial AI system message when settings load
  useEffect(() => {
    if (aiSettings?.aiSystemMessage) {
      setAiSystemMessage(aiSettings.aiSystemMessage);
    }
  }, [aiSettings]);

  // PartyKit WebSocket connection for real-time updates
  const onMemberEvent = useCallback(
    (event: MemberEventMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", selectedChatroomId],
      });

      // Add notification for member events
      if (event.type === "member-joined") {
        addNotification({
          type: "member-joined",
          content: `${event.member.name} joined the chatroom`,
          data: event.member,
        });
      } else if (event.type === "member-removed") {
        addNotification({
          type: "member-removed",
          content: `${event.member.name} was removed from the chatroom`,
          data: event.member,
        });
      }
    },
    [queryClient, selectedChatroomId, addNotification]
  );

  const onSettingsUpdate = useCallback(
    (update: SettingsUpdateMessage) => {
      refetchAiSettings();

      // Add notification for settings changes
      console.log("Settings update received:", update.settings);
      console.log("Current aiSettings:", aiSettings);

      // Compare with current settings to determine what actually changed
      if (aiSettings && update.settings.aiMode !== aiSettings.aiMode) {
        // AI Mode was changed
        console.log(
          "AI Mode changed:",
          aiSettings.aiMode,
          "->",
          update.settings.aiMode
        );
        const aiModeText =
          update.settings.aiMode === "auto-respond"
            ? "Auto-respond"
            : update.settings.aiMode === "summoned"
            ? "Summoned (@AI only)"
            : `Unknown mode: ${update.settings.aiMode}`;

        addNotification({
          type: "settings-update",
          content: `${update.updatedBy.displayName} changed AI mode to ${aiModeText}`,
          data: update.settings,
        });
      } else if (
        aiSettings &&
        update.settings.aiSystemMessage !== aiSettings.aiSystemMessage
      ) {
        // System message was changed
        console.log(
          "System message changed:",
          aiSettings.aiSystemMessage,
          "->",
          update.settings.aiSystemMessage
        );
        addNotification({
          type: "settings-update",
          content: `${update.updatedBy.displayName} updated the AI system prompt`,
          data: update.settings,
        });
      } else {
        // Generic settings change (or first load when aiSettings is null)
        console.log(
          "Generic settings change. aiSettings:",
          aiSettings,
          "update:",
          update.settings
        );
        addNotification({
          type: "settings-update",
          content: `${update.updatedBy.displayName} updated AI settings`,
          data: update.settings,
        });
      }
    },
    [refetchAiSettings, addNotification, aiSettings]
  );

  const onMessagesClear = useCallback(
    (event: MessagesClearedEvent) => {
      // Clear local message state when messages are cleared by admin
      setInitialMessages([]);
      setStreamingMessage(null);

      // Add notification for messages cleared
      addNotification({
        type: "messages-cleared",
        content: `${event.clearedBy.name} cleared all messages`,
        data: event.clearedBy,
      });
    },
    [addNotification]
  );
  const {
    messages: partyMessages,
    sendMessage: sendPartyMessage,
    streamingAiMessage: partyStreamingMessage,
    typingUsers,
    sendTypingStart,
    sendTypingStop,
  } = usePartySocket({
    chatroomId: selectedChatroomId || "",
    user:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.username || "User",
    onMemberEvent,
    onSettingsUpdate,
    onMessagesClear,
  });

  // Fetch initial message history when chatroom changes
  useEffect(() => {
    if (!selectedChatroomId) return;
    fetch(`/api/chatrooms/${selectedChatroomId}/messages`)
      .then((res) => res.json())
      .then((data) => setInitialMessages(data.messages || []));

    // Clear notifications when switching chatrooms
    setNotifications([]);
  }, [selectedChatroomId]);

  // Merge initial messages with real-time PartyKit messages (avoid duplicates)
  const mergedMessages = [
    // Keep ALL initial messages (including optimistic user messages)
    ...initialMessages.filter(
      (msg) =>
        !partyMessages.some((pm: any) => {
          // Only deduplicate AI messages, not user messages
          // User messages should be shown optimistically and PartyKit messages filtered out
          return (
            pm.id === msg.id ||
            // For AI messages, match by content (exact match indicates duplicate)
            (msg.isAiMessage &&
              pm.isAiMessage &&
              (pm.text || pm.content) === msg.content)
            // Remove user message deduplication - let optimistic messages show
          );
        })
    ),
    // Transform PartyKit messages to match expected format, but exclude current user's messages
    // since they should be shown optimistically
    ...partyMessages
      .filter((pm: any) => pm.userId !== currentUserDbId) // Exclude current user's messages from PartyKit
      .map((pm: any) => ({
        ...pm,
        id: pm.id || `party-${pm.sentAt || pm.receivedAt}-${pm.userId}`,
        content: pm.content || pm.text,
        createdAt: pm.createdAt || pm.sentAt || pm.receivedAt,
        sender: {
          name: pm.displayName || pm.user,
          firstName: pm.displayName?.split(" ")[0],
          lastName: pm.displayName?.split(" ")[1],
        },
        isAiMessage: pm.isAiMessage || pm.userId === "ai-assistant",
      })),
    // Notifications are now handled separately as toast notifications
  ];

  // Sort messages by timestamp to ensure proper order
  const sortedMessages = mergedMessages.sort((a, b) => {
    const timeA = new Date(
      a.createdAt || a.sentAt || a.receivedAt || 0
    ).getTime();
    const timeB = new Date(
      b.createdAt || b.sentAt || b.receivedAt || 0
    ).getTime();
    return timeA - timeB;
  });

  // No need to refresh messages from database for real-time updates
  // PartyKit handles real-time messages and we use optimistic updates for user messages

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [partyMessages, streamingMessage, partyStreamingMessage]);

  // Also scroll when new messages are optimistically added
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [partyMessages.length]);

  // Helper function to handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatroomId) return;
    const content = newMessage.trim();
    console.log("📤 Sending message:", content);

    // Optimistically add user message to local state immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      content: content,
      createdAt: new Date().toISOString(),
      isAiMessage: false,
      sender: {
        name:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.username || "User",
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
      userId: currentUserDbId,
    };

    // Add to initial messages for immediate display
    setInitialMessages((prev) => [...prev, optimisticMessage]);

    setNewMessage("");
    setStreamingMessage({ content: "", isStreaming: false });

    try {
      const res = await fetch(
        `/api/chatrooms/${selectedChatroomId}/messages/new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      console.log(
        "📡 API Response:",
        res.status,
        res.headers.get("content-type")
      );
      if (!res.ok) {
        // Remove optimistic message on error
        setInitialMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        throw new Error("Failed to send message");
      }

      // If AI is triggered, handle streaming response
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        console.log("🤖 AI streaming response detected");
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let aiContent = "";
        if (reader) {
          setStreamingMessage({ content: "", isStreaming: true });
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    aiContent += data.content;
                    setStreamingMessage({
                      content: aiContent,
                      isStreaming: true,
                    });
                  }
                  if (data.complete) {
                    setStreamingMessage({
                      content: aiContent,
                      isStreaming: false,
                    });
                  }
                } catch {}
              }
            }
          }
        }
      } else {
        console.log("✅ Message sent successfully (no AI response)");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      // Optimistic message was already removed on error above
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing start if not already typing
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      sendTypingStart();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingStop();
      }
    }, 2000);

    // If input is empty, immediately stop typing
    if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Stop typing when message is sent
  useEffect(() => {
    if (!newMessage && isTyping) {
      setIsTyping(false);
      sendTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [newMessage, isTyping, sendTypingStop]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Generate invite link mutation
  const generateInviteMutation = useMutation({
    mutationFn: async (chatroomId: string) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/invite`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to generate invite link");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      const inviteUrl = `${window.location.origin}/invite/${data.inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    },
  });

  const handleShareInvite = () => {
    if (!selectedChatroomId) return;
    generateInviteMutation.mutate(selectedChatroomId);
  };

  // Clear all messages mutation
  const clearMessagesMutation = useMutation({
    mutationFn: async (chatroomId: string) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/messages`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to clear messages");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsClearMessagesOpen(false);
      // Clear local message state
      setInitialMessages([]);
      // The PartyKit event will handle updating other clients
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async ({
      chatroomId,
      memberId,
    }: {
      chatroomId: string;
      memberId: string;
    }) => {
      const res = await fetch(`/api/chatrooms/${chatroomId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove member");
      }
      return res.json();
    },
    onSuccess: () => {
      // Refresh participants list
      queryClient.invalidateQueries({
        queryKey: ["participants", selectedChatroomId],
      });
      setRemoveMemberDialog({ isOpen: false, member: null });
    },
  });

  const handleClearMessages = () => {
    if (!selectedChatroomId) return;
    clearMessagesMutation.mutate(selectedChatroomId);
  };

  // Send typing indicator
  const sendTypingIndicator = () => {
    // Typing indicator is handled by the usePartySocket hook
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading chatrooms...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Failed to load chatrooms.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-in-out ${
              notification.isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {notification.type === "member-joined" && "👋"}
                    {notification.type === "member-removed" && "👋"}
                    {notification.type === "settings-update" && "⚙️"}
                    {notification.type === "messages-cleared" && "🧹"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.type === "member-joined" && "Member Joined"}
                    {notification.type === "member-removed" && "Member Removed"}
                    {notification.type === "settings-update" &&
                      "Settings Updated"}
                    {notification.type === "messages-cleared" &&
                      "Messages Cleared"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === notification.id
                          ? { ...n, isVisible: false }
                          : n
                      )
                    );
                    setTimeout(() => {
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notification.id)
                      );
                    }, 300);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              AI Playground
            </span>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName[0]}${user.lastName[0]}`
                        : user?.firstName
                        ? user.firstName[0]
                        : user?.username
                        ? user.username.slice(0, 2).toUpperCase()
                        : user?.emailAddresses?.[0]?.emailAddress
                        ? user.emailAddresses[0].emailAddress
                            .slice(0, 2)
                            .toUpperCase()
                        : "SS"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName
                        ? user.firstName
                        : user?.username
                        ? user.username
                        : user?.emailAddresses?.[0]?.emailAddress || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.emailAddresses?.[0]?.emailAddress || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/user/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Chatroom Navigation */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="space-y-2">
              <Dialog
                open={isCreateChatroomOpen}
                onOpenChange={setIsCreateChatroomOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 shadow-sm rounded-none">
                    <Plus className="w-4 h-4 mr-2" />
                    New Chatroom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collaborative Chatroom</DialogTitle>
                    <DialogDescription>
                      Start a new AI-powered collaborative chatroom with your
                      team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Chatroom Title
                      </label>
                      <Input
                        placeholder="Enter chatroom title..."
                        value={newChatroomName}
                        onChange={(e) => setNewChatroomName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateChatroomOpen(false)}
                      className="font-semibold px-6 py-2 rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createChatroom.mutate(newChatroomName)}
                      className="font-semibold px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                    >
                      Create Chatroom
                    </Button>
                  </div>
                  {createError && (
                    <p className="text-red-500 text-sm mt-2">{createError}</p>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog
                open={isJoinChatroomOpen}
                onOpenChange={setIsJoinChatroomOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 font-medium py-2.5 rounded-none"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Chatroom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Collaborative Chatroom</DialogTitle>
                    <DialogDescription>
                      Enter a chatroom ID or invitation link to join an existing
                      chatroom.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Invitation Link or Code
                      </label>
                      <Input
                        placeholder="e.g., https://app.com/invite/abc123 or abc123"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinChatroomOpen(false)}
                      className="font-semibold px-6 py-2 rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => joinChatroom.mutate(joinId)}
                      className="font-semibold px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                    >
                      Join Chatroom
                    </Button>
                  </div>
                  {joinError && (
                    <p className="text-red-500 text-sm mt-2">{joinError}</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Chatroom List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {chatrooms.map((chatroom: Chatroom) => (
                <button
                  key={chatroom.id}
                  onClick={() => setSelectedChatroomId(chatroom.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-l-2 transition-colors ${
                    selectedChatroomId === chatroom.id
                      ? "bg-purple-50 border-purple-600"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chatroom.name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Container - Chatroom Content */}
        <main className="flex-1 flex flex-col">
          {selectedChatroom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {selectedChatroom.name}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrentUserAdmin && (
                      <Dialog
                        open={isClearMessagesOpen}
                        onOpenChange={setIsClearMessagesOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Messages
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Clear All Messages</DialogTitle>
                            <DialogDescription>
                              This will permanently delete all messages in this
                              chatroom for all participants. This action cannot
                              be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsClearMessagesOpen(false)}
                              className="rounded-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleClearMessages}
                              disabled={clearMessagesMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-none"
                            >
                              {clearMessagesMutation.isPending
                                ? "Clearing..."
                                : "Clear All Messages"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareInvite}
                      disabled={generateInviteMutation.isPending}
                      className={cn(
                        "rounded-none transition-colors",
                        linkCopied &&
                          "bg-green-50 border-green-200 text-green-700"
                      )}
                    >
                      {linkCopied ? (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Invite Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-white p-4 overflow-y-auto">
                <div className="space-y-4">
                  {sortedMessages.length > 0 ? (
                    <>
                      {sortedMessages.map((message: any, idx: number) => {
                        // Use the first available timestamp for display
                        const timestamp =
                          message.createdAt ||
                          message.sentAt ||
                          message.receivedAt;

                        return (
                          <div
                            key={
                              message.id ||
                              message._id ||
                              message.createdAt ||
                              `msg-idx-${idx}`
                            }
                            className="flex items-start space-x-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback
                                className={`text-sm font-medium ${
                                  message.isAiMessage
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {message.isAiMessage
                                  ? "AI"
                                  : message.sender?.firstName &&
                                    message.sender?.lastName
                                  ? `${message.sender.firstName[0]}${message.sender.lastName[0]}`
                                  : message.sender?.firstName
                                  ? message.sender.firstName[0]
                                  : message.sender?.name
                                  ? message.sender.name
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {message.isAiMessage
                                    ? "AI Assistant"
                                    : message.sender?.name ||
                                      message.displayName ||
                                      message.user ||
                                      "User"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {timestamp
                                    ? new Date(timestamp).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : ""}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 mt-1 prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content || message.text}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(partyStreamingMessage?.isActive ||
                        streamingMessage?.isStreaming) &&
                        (partyStreamingMessage?.content ||
                          streamingMessage?.content) &&
                        // Don't show streaming message if there's already a complete AI message with same content
                        !sortedMessages.some(
                          (msg) =>
                            msg.isAiMessage &&
                            (msg.content === partyStreamingMessage?.content ||
                              msg.content === streamingMessage?.content)
                        ) && (
                          <div
                            key={`ai-streaming-${selectedChatroomId}-unique`}
                            className="flex items-start space-x-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-medium">
                                AI
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  AI Assistant
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="text-xs text-blue-500 font-medium">
                                  Typing...
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 mt-1 prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {partyStreamingMessage?.content ||
                                    streamingMessage?.content ||
                                    ""}
                                </ReactMarkdown>
                                <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                  {/* Invisible element to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-100 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Typing Indicator - Fixed height to prevent layout shift */}
                <div className="h-6 flex items-center">
                  {typingUsers.size > 0 && (
                    <div className="text-xs text-gray-500 mt-2 animate-pulse">
                      {(() => {
                        const displayNames = Array.from(typingUsers.values());
                        if (displayNames.length === 1) {
                          return `${displayNames[0]} is typing...`;
                        } else if (displayNames.length === 2) {
                          return `${displayNames[0]} and ${displayNames[1]} are typing...`;
                        } else {
                          return `${displayNames
                            .slice(0, -1)
                            .join(", ")} and ${displayNames.slice(
                            -1
                          )} are typing...`;
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a chatroom
                </h3>
                <p className="text-gray-500">
                  Choose a chatroom from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Participants & AI Settings - Only show when chatrooms exist */}
        {chatrooms.length > 0 && (
          <aside className="w-80 bg-white border-l border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Participants
              </h2>
            </div>

            <div className="p-4 space-y-3">
              {/* Participants List */}
              {participants.length > 0 ? (
                participants.map((participant: any) => {
                  const isCurrentUser =
                    participant.user?.clerkId === user?.id ||
                    participant.clerkId === user?.id ||
                    participant.userId === user?.id ||
                    (participant.user?.firstName === user?.firstName &&
                      participant.user?.lastName === user?.lastName);

                  const participantName =
                    participant.user?.firstName && participant.user?.lastName
                      ? `${participant.user.firstName} ${participant.user.lastName}`
                      : participant.user?.firstName
                      ? participant.user.firstName
                      : participant.firstName && participant.lastName
                      ? `${participant.firstName} ${participant.lastName}`
                      : participant.firstName || "User";

                  return (
                    <div
                      key={participant.id || participant.userId}
                      className="flex items-center space-x-3 group"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                          {participant.user?.firstName &&
                          participant.user?.lastName
                            ? `${participant.user.firstName[0]}${participant.user.lastName[0]}`
                            : participant.user?.firstName
                            ? participant.user.firstName[0]
                            : participant.firstName && participant.lastName
                            ? `${participant.firstName[0]}${participant.lastName[0]}`
                            : participant.firstName
                            ? participant.firstName[0]
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {participantName}
                          {isCurrentUser && (
                            <span className="text-xs text-gray-500 ml-1">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {participant.role === "admin" ? "Admin" : "Member"}
                        </p>
                      </div>

                      {/* Remove button - only show for admins and not for current user */}
                      {isCurrentUserAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            setRemoveMemberDialog({
                              isOpen: true,
                              member: {
                                ...participant,
                                name: participantName,
                                userId:
                                  participant.user?.id || participant.userId,
                              },
                            })
                          }
                          title="Remove member"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Loading participants...
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                AI Settings
              </h3>
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-none"
                      disabled={updateAiSettingsMutation.isPending}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Mode:{" "}
                      {aiSettings?.aiMode === "auto-respond"
                        ? "Auto-respond"
                        : "Summoned (@AI only)"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select AI Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (!selectedChatroomId || !aiSettings) return;
                        updateAiSettingsMutation.mutate({
                          chatroomId: selectedChatroomId,
                          settings: { aiMode: "auto-respond" },
                        });
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Auto-respond Mode
                      <p className="text-xs text-gray-500 mt-1">
                        AI responds to all messages automatically
                      </p>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (!selectedChatroomId || !aiSettings) return;
                        updateAiSettingsMutation.mutate({
                          chatroomId: selectedChatroomId,
                          settings: { aiMode: "summoned" },
                        });
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Summoned Mode
                      <p className="text-xs text-gray-500 mt-1">
                        AI only responds when mentioned with @AI
                      </p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog
                  open={isAiSettingsOpen}
                  onOpenChange={setIsAiSettingsOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-none"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Change AI Behavior
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure AI Assistant</DialogTitle>
                      <DialogDescription>
                        Customize how the AI assistant behaves in this chatroom.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          System Message
                        </label>
                        <Textarea
                          placeholder="Enter custom instructions for the AI..."
                          value={aiSystemMessage}
                          onChange={(e) => setAiSystemMessage(e.target.value)}
                          rows={5}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          This message defines the AI's personality and behavior
                          in this chatroom.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAiSettingsOpen(false)}
                        className="rounded-none"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveAiSettings}
                        disabled={updateAiSettingsMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                      >
                        Save Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </aside>
        )}

        {/* Remove Member Confirmation Dialog */}
        <Dialog
          open={removeMemberDialog.isOpen}
          onOpenChange={(open) =>
            setRemoveMemberDialog({ isOpen: open, member: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                {removeMemberDialog.member?.name} from this chatroom? This
                action cannot be undone and they will lose access to all
                messages and files in this chatroom.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setRemoveMemberDialog({ isOpen: false, member: null })
                }
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (removeMemberDialog.member && selectedChatroomId) {
                    removeMemberMutation.mutate({
                      chatroomId: selectedChatroomId,
                      memberId: removeMemberDialog.member.userId,
                    });
                  }
                }}
                disabled={removeMemberMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none"
              >
                {removeMemberMutation.isPending
                  ? "Removing..."
                  : "Remove Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
