"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Modal, ModalFooter, ModalButton } from "@/components/ui/modal";
import {
  Plus,
  Users,
  Settings,
  LogOut,
  Send,
  MoreHorizontal,
  Trash2,
  UserX,
  User,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { cn, getAvatarInitials } from "@/lib/utils";
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
      if (data.chatroomId) {
        setSelectedChatroomId(data.chatroomId);
      }
    },
  });

  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);

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

      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === newNotification.id ? { ...n, isVisible: false } : n
          )
        );
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

  useEffect(() => {
    if (chatrooms.length > 0 && !selectedChatroomId) {
      setSelectedChatroomId(chatrooms[0].id);
    }
  }, [chatrooms, selectedChatroomId]);

  const selectedChatroom = chatrooms.find(
    (room: Chatroom) => room.id === selectedChatroomId
  );

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

  const currentUserParticipant = participants.find((p: any) => {
    return (
      p.user?.clerkId === user?.id ||
      p.clerkId === user?.id ||
      p.userId === user?.id ||
      (p.user?.firstName === user?.firstName &&
        p.user?.lastName === user?.lastName)
    );
  });
  const isCurrentUserAdmin = currentUserParticipant?.role === "admin";
  const currentUserDbId =
    currentUserParticipant?.userId || currentUserParticipant?.user?.id;

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

  useEffect(() => {
    if (aiSettings?.aiSystemMessage) {
      setAiSystemMessage(aiSettings.aiSystemMessage);
    }
  }, [aiSettings]);

  const onMemberEvent = useCallback(
    (event: MemberEventMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", selectedChatroomId],
      });
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

      // Create simple, clear notification content using updatedFields
      let content = "";

      // Use updatedFields to determine what was actually changed
      if (update.updatedFields?.aiSystemMessage) {
        // This was specifically a behavior update
        content = "AI Behavior updated";
      } else if (update.updatedFields?.aiDisabled) {
        // This was specifically a disable action
        content = "AI disabled";
      } else if (update.updatedFields?.aiMode) {
        // This was specifically a mode change
        const modeDisplay =
          update.settings.aiMode === "auto-respond"
            ? "Auto Respond"
            : update.settings.aiMode === "summoned"
            ? "Summoned"
            : "Disabled";
        content = `AI Mode changed to ${modeDisplay}`;
      } else if (update.updatedFields?.aiEnabled) {
        // This was specifically an enabled/disabled change
        content = `AI ${update.settings.aiEnabled ? "enabled" : "disabled"}`;
      } else {
        // Fallback for unclear updates or multiple changes
        content = "AI Settings updated";
      }

      // Add user attribution if available
      if (update.updatedBy?.displayName) {
        content += ` by ${update.updatedBy.displayName}`;
      }

      addNotification({
        type: "settings-update",
        content,
        data: update.settings,
      });
    },
    [refetchAiSettings, addNotification]
  );

  const onMessagesClear = useCallback(
    (event: MessagesClearedEvent) => {
      setInitialMessages([]);
      setStreamingMessage(null);
      addNotification({
        type: "messages-cleared",
        content: `Messages cleared by ${event.clearedBy?.name || "Admin"}`,
        data: event.clearedBy,
      });
    },
    [addNotification]
  );

  const {
    messages: partyMessages,
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

  // Add retry logic for loading messages
  const loadMessagesWithRetry = useCallback(
    async (chatroomId: string, retryCount = 0): Promise<any[]> => {
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      try {
        console.log(
          `📨 Dashboard - Loading initial messages for chatroom ${chatroomId} (attempt ${
            retryCount + 1
          })`
        );
        const res = await fetch(`/api/chatrooms/${chatroomId}/messages`);
        console.log(
          `📨 Dashboard - Messages API response status: ${res.status}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.error(`❌ Dashboard - Messages API error:`, errorData);

          // If the error is "Not a member" and we haven't exhausted retries, wait and retry
          if (
            errorData.error?.includes("Not a member") &&
            retryCount < maxRetries
          ) {
            console.log(
              `🔄 Dashboard - Retrying message load in ${retryDelay}ms (attempt ${
                retryCount + 1
              }/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return loadMessagesWithRetry(chatroomId, retryCount + 1);
          }

          throw new Error(errorData.error || "Failed to fetch messages");
        }

        const data = await res.json();
        console.log(
          `📨 Dashboard - Received ${
            data.messages?.length || 0
          } initial messages`
        );
        return data.messages || [];
      } catch (error) {
        console.error(`❌ Dashboard - Error loading messages:`, error);

        // If we haven't exhausted retries and it's a network/server error, retry
        if (
          retryCount < maxRetries &&
          !(error as Error).message.includes("Not a member")
        ) {
          console.log(
            `🔄 Dashboard - Retrying message load in ${retryDelay}ms due to error (attempt ${
              retryCount + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return loadMessagesWithRetry(chatroomId, retryCount + 1);
        }

        return [];
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedChatroomId) return;

    loadMessagesWithRetry(selectedChatroomId)
      .then((messages) => {
        setInitialMessages(messages);
      })
      .catch((error) => {
        console.error(`❌ Dashboard - Final error loading messages:`, error);
        setInitialMessages([]);
      });

    setNotifications([]);
  }, [selectedChatroomId, loadMessagesWithRetry]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(
        `/api/chatrooms/${selectedChatroomId}/messages/new`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      return res;
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [partyMessages, streamingMessage, partyStreamingMessage]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [partyMessages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatroomId) return;
    const content = newMessage.trim();

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
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

    setInitialMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setStreamingMessage({ content: "", isStreaming: false });

    try {
      await sendMessageMutation.mutateAsync(content);
    } catch (error) {
      setInitialMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingStart();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStop();
      }, 2000);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      sendTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else if (value.length > 0 && isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStop();
      }, 2000);
    }
  };

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
      setInitialMessages([]);
    },
  });

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
      queryClient.invalidateQueries({
        queryKey: ["participants", selectedChatroomId],
      });
      setRemoveMemberDialog({ isOpen: false, member: null });
    },
  });

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

  const handleClearMessages = () => {
    if (!selectedChatroomId) return;
    clearMessagesMutation.mutate(selectedChatroomId);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading</div>
      </div>
    );
  }
  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive">Error loading</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-300 ease-in-out
              ${
                notification.isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }
              bg-white border border-neutral-200 rounded-lg shadow-lg p-3 min-w-[280px] max-w-[400px]
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                w-2 h-2 rounded-full flex-shrink-0 mt-1.5
                ${
                  notification.type === "member-joined"
                    ? "bg-green-500"
                    : notification.type === "member-removed"
                    ? "bg-orange-500"
                    : notification.type === "settings-update"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }
              `}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900">
                  {notification.type === "member-joined"
                    ? "Member Joined"
                    : notification.type === "member-removed"
                    ? "Member Removed"
                    : notification.type === "settings-update"
                    ? "Settings Updated"
                    : "Messages Cleared"}
                </div>
                <div className="text-sm text-neutral-600 mt-0.5">
                  {notification.content}
                </div>
              </div>
              <button
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) =>
                      n.id === notification.id ? { ...n, isVisible: false } : n
                    )
                  );
                  setTimeout(() => {
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== notification.id)
                    );
                  }, 300);
                }}
                className="text-neutral-400 hover:text-neutral-600 flex-shrink-0"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-48 bg-neutral-50 border-r border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-2 border-b border-neutral-200">
          <div className="text-sm font-medium text-neutral-900">CHATROOMS</div>
        </div>

        {/* Chatroom List */}
        <div className="flex-1 overflow-y-auto">
          {chatrooms.map((chatroom: Chatroom) => (
            <div
              key={chatroom.id}
              onClick={() => setSelectedChatroomId(chatroom.id)}
              className={`p-2 cursor-pointer border-b border-neutral-100 ${
                selectedChatroomId === chatroom.id
                  ? "bg-green-700 text-white"
                  : "hover:bg-neutral-100"
              }`}
            >
              <div className="text-sm font-medium truncate">
                #{chatroom.name}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-2 border-t border-neutral-200 space-y-1">
          <button
            onClick={() => setIsCreateChatroomOpen(true)}
            className="w-full p-1 text-sm text-white hover:bg-green-800"
            style={{ backgroundColor: "#15803d" }}
          >
            CREATE ROOM
          </button>
          <button
            onClick={() => setIsJoinChatroomOpen(true)}
            className="w-full p-1 text-sm bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
          >
            JOIN ROOM
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-2 border-t border-neutral-200 relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 w-full hover:bg-neutral-100 p-1 rounded">
                <div className="avatar w-6 h-6 bg-neutral-400 flex items-center justify-center text-sm text-white font-medium">
                  {getAvatarInitials(
                    user?.firstName,
                    user?.lastName,
                    user?.username?.[0] || "U",
                    user?.username // Pass username as potential fullName
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              side="top"
              sideOffset={5}
            >
              <DropdownMenuItem
                onClick={() => router.push("/user/profile")}
                className="cursor-pointer"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut(() => router.push("/"))}
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedChatroom ? (
          <>
            {/* Chat Header */}
            <div className="p-2 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-neutral-900">
                  #{selectedChatroom.name}
                </div>
                {isCurrentUserAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareInvite}
                      className="px-2 py-1 text-sm bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                    >
                      {linkCopied ? "COPIED" : "SHARE INVITE"}
                    </button>
                    <button
                      onClick={() => setIsClearMessagesOpen(true)}
                      className="px-2 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      CLEAR MESSAGES
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(() => {
                const allMessages = [
                  ...initialMessages,
                  ...partyMessages.filter(
                    (msg) =>
                      !initialMessages.some((im: any) => {
                        // More robust duplicate detection
                        // First check if they have the same ID (most reliable)
                        if (im.id && msg.id && im.id === msg.id) {
                          return true;
                        }

                        // If no IDs match, check content and user with a more lenient time window
                        const contentMatch =
                          (im.content || im.text) === (msg.content || msg.text);
                        const userMatch =
                          im.userId === msg.userId ||
                          im.sender?.id === msg.userId ||
                          im.user === msg.user;

                        // More lenient time matching (10 seconds instead of 5)
                        const timeMatch =
                          Math.abs(
                            new Date(im.createdAt || im.sentAt || 0).getTime() -
                              new Date(
                                msg.createdAt || msg.sentAt || 0
                              ).getTime()
                          ) < 10000; // Within 10 seconds

                        return contentMatch && userMatch && timeMatch;
                      })
                  ),
                ];
                const sortedMessages = allMessages.sort(
                  (a, b) =>
                    new Date(a.createdAt || a.sentAt || 0).getTime() -
                    new Date(b.createdAt || b.sentAt || 0).getTime()
                );

                if (sortedMessages.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-neutral-500 text-sm">
                        No messages
                      </div>
                    </div>
                  );
                }

                return sortedMessages.map((message, index) => {
                  const isAi = message.isAiMessage;
                  const isCurrentUser =
                    !isAi &&
                    (message.userId === currentUserDbId ||
                      message.sender?.id === currentUserDbId);

                  const userName = isAi
                    ? "AI"
                    : message.sender?.name ||
                      message.sender?.firstName ||
                      message.user ||
                      message.displayName ||
                      (user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || user?.username || "Unknown User");

                  return (
                    <div
                      key={`${message.id}-${index}`}
                      className="flex gap-2 mb-3"
                    >
                      <div
                        className={`avatar w-6 h-6 flex items-center justify-center text-sm text-white font-medium flex-shrink-0 ${
                          isAi ? "bg-green-700" : "bg-neutral-400"
                        }`}
                      >
                        {isAi
                          ? "AI"
                          : getAvatarInitials(
                              message.sender?.firstName,
                              message.sender?.lastName,
                              userName[0]?.toUpperCase() || "U",
                              message.sender?.name // Pass sender's name as fullName
                            )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-medium text-neutral-900">
                            {userName}
                          </span>
                          <span className="text-sm text-neutral-500">
                            {new Date(
                              message.createdAt || message.sentAt || Date.now()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-700 break-words">
                          {isAi ? (
                            <div className="prose prose-sm max-w-none text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content || message.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            message.content || message.text
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {partyStreamingMessage?.isActive && (
                <div className="flex gap-2 mb-3">
                  <div className="avatar w-6 h-6 bg-green-700 flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-neutral-900">
                        AI
                      </span>
                      <span className="text-sm text-neutral-500">
                        {partyStreamingMessage.content
                          ? "responding..."
                          : "thinking..."}
                      </span>
                    </div>
                    {partyStreamingMessage.content && (
                      <div className="text-sm text-neutral-700 break-words">
                        <div className="prose prose-sm max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {partyStreamingMessage.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-2 border-t border-neutral-200">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 p-1 text-sm border border-neutral-200 focus:border-green-700 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-2 py-1 text-sm bg-green-700 text-white hover:bg-green-800 disabled:bg-neutral-200 disabled:text-neutral-500"
                >
                  SEND
                </button>
              </div>

              {/* Typing Indicator - Fixed height area below input */}
              <div className="h-6 flex items-center">
                {typingUsers.size > 0 && (
                  <div className="flex gap-2 items-center px-1">
                    <div className="avatar w-4 h-4 bg-neutral-400 flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-neutral-600">
                        {Array.from(typingUsers.values()).length === 1
                          ? `${Array.from(typingUsers.values())[0]} is typing`
                          : Array.from(typingUsers.values()).length === 2
                          ? `${Array.from(typingUsers.values())[0]} and ${
                              Array.from(typingUsers.values())[1]
                            } are typing`
                          : `${Array.from(typingUsers.values())
                              .slice(0, -1)
                              .join(", ")} and ${
                              Array.from(typingUsers.values()).slice(-1)[0]
                            } are typing`}
                      </span>
                      <div className="flex gap-0.5 ml-1">
                        <div
                          className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-neutral-500">
              Select a chatroom to start messaging
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      {selectedChatroom && (
        <div className="w-48 bg-neutral-50 border-l border-neutral-200 flex flex-col">
          {/* Members Section */}
          <div className="p-2 border-b border-neutral-200">
            <div className="text-sm font-medium text-neutral-900">
              MEMBERS ({participants.length})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {(() => {
              const admins = participants.filter(
                (p: any) => p.role === "admin"
              );
              const members = participants.filter(
                (p: any) => p.role !== "admin"
              );

              return (
                <>
                  {admins.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-neutral-500 px-1 pt-1">
                        ADMINS ({admins.length})
                      </div>
                      {admins.map((participant: any) => (
                        <div
                          key={participant.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="avatar w-4 h-4 bg-neutral-400 flex items-center justify-center text-sm text-white font-medium">
                              {getAvatarInitials(
                                participant.user?.firstName,
                                participant.user?.lastName,
                                "U",
                                (participant.user?.firstName && participant.user?.lastName) ? `${participant.user.firstName} ${participant.user.lastName}` : participant.user?.firstName
                              )}
                            </div>
                            <div className="text-sm text-neutral-700 truncate">
                              {participant.user?.firstName}{" "}
                              {participant.user?.lastName}
                            </div>
                          </div>
                          {isCurrentUserAdmin &&
                            participant.userId !== currentUserDbId && (
                              <button
                                className="text-neutral-500 hover:text-red-600"
                                onClick={() =>
                                  setRemoveMemberDialog({
                                    isOpen: true,
                                    member: {
                                      ...participant,
                                      name: `${participant.user?.firstName} ${participant.user?.lastName}`,
                                    },
                                  })
                                }
                              >
                                <UserX className="h-3 w-3" />
                              </button>
                            )}
                        </div>
                      ))}
                    </>
                  )}

                  {members.length > 0 && (
                    <>
                      {admins.length > 0 && (
                        <div className="border-t border-neutral-200 my-2" />
                      )}
                      <div className="text-sm font-medium text-neutral-500 px-1 pt-1">
                        MEMBERS ({members.length})
                      </div>
                      {members.map((participant: any) => (
                        <div
                          key={participant.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="avatar w-4 h-4 bg-neutral-400 flex items-center justify-center text-sm text-white font-medium">
                              {getAvatarInitials(
                                participant.user?.firstName,
                                participant.user?.lastName,
                                "U",
                                (participant.user?.firstName && participant.user?.lastName) ? `${participant.user.firstName} ${participant.user.lastName}` : participant.user?.firstName
                              )}
                            </div>
                            <div className="text-sm text-neutral-700 truncate">
                              {participant.user?.firstName}{" "}
                              {participant.user?.lastName}
                            </div>
                          </div>
                          {isCurrentUserAdmin &&
                            participant.userId !== currentUserDbId && (
                              <button
                                className="text-neutral-500 hover:text-red-600"
                                onClick={() =>
                                  setRemoveMemberDialog({
                                    isOpen: true,
                                    member: {
                                      ...participant,
                                      name: `${participant.user?.firstName} ${participant.user?.lastName}`,
                                    },
                                  })
                                }
                              >
                                <UserX className="h-3 w-3" />
                              </button>
                            )}
                        </div>
                      ))}
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* AI Settings Section */}
          <div className="border-t border-neutral-200">
            <div className="p-2 border-b border-neutral-200">
              <div className="text-sm font-medium text-neutral-900">
                AI SETTINGS
              </div>
            </div>
            <div className="p-2 space-y-2">
              <div>
                <label className="text-sm text-neutral-600 block mb-1">
                  AI Mode
                </label>
                <select
                  value={
                    aiSettings?.aiEnabled === false
                      ? "disabled"
                      : aiSettings?.aiMode || "auto-respond"
                  }
                  onChange={(e) => {
                    if (!selectedChatroomId) return;
                    updateAiSettingsMutation.mutate({
                      chatroomId: selectedChatroomId,
                      settings: { aiMode: e.target.value },
                    });
                  }}
                  className="w-full p-1 text-sm border border-neutral-200 focus:border-green-700 outline-none"
                >
                  <option value="auto-respond">Auto Respond</option>
                  <option value="summoned">Summoned (Use @AI)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <button
                onClick={() => setIsAiSettingsOpen(true)}
                className="w-full p-1 text-sm bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              >
                CHANGE AI BEHAVIOR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Modal
        isOpen={isCreateChatroomOpen}
        onClose={() => setIsCreateChatroomOpen(false)}
        title="Create New Room"
        size="sm"
      >
        <input
          type="text"
          placeholder="Room name"
          value={newChatroomName}
          onChange={(e) => setNewChatroomName(e.target.value)}
          className="w-full p-2 text-sm border border-neutral-200 focus:border-green-700 outline-none rounded"
        />
        {createError && (
          <div className="text-red-600 text-sm mt-2">{createError}</div>
        )}
        <ModalFooter>
          <ModalButton
            onClick={() => setIsCreateChatroomOpen(false)}
            variant="secondary"
          >
            Cancel
          </ModalButton>
          <ModalButton
            onClick={() => createChatroom.mutate(newChatroomName)}
            disabled={!newChatroomName.trim()}
            variant="primary"
          >
            Create
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Join Chatroom Modal */}
      <Modal
        isOpen={isJoinChatroomOpen}
        onClose={() => setIsJoinChatroomOpen(false)}
        title="Join Room"
        size="sm"
      >
        <input
          type="text"
          placeholder="Invitation link or code"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="w-full p-2 text-sm border border-neutral-200 focus:border-green-700 outline-none rounded"
        />
        {joinError && (
          <div className="text-red-600 text-sm mt-2">{joinError}</div>
        )}
        <ModalFooter>
          <ModalButton
            onClick={() => setIsJoinChatroomOpen(false)}
            variant="secondary"
          >
            Cancel
          </ModalButton>
          <ModalButton
            onClick={() => joinChatroom.mutate(joinId)}
            disabled={!joinId.trim()}
            variant="primary"
          >
            Join
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Clear Messages Modal */}
      <Modal
        isOpen={isClearMessagesOpen}
        onClose={() => setIsClearMessagesOpen(false)}
        title="Clear Messages"
        size="sm"
      >
        <div className="text-sm text-neutral-600">
          This will delete all messages permanently.
        </div>
        <ModalFooter>
          <ModalButton
            onClick={() => setIsClearMessagesOpen(false)}
            variant="secondary"
          >
            Cancel
          </ModalButton>
          <ModalButton
            onClick={handleClearMessages}
            disabled={clearMessagesMutation.isPending}
            variant="danger"
          >
            {clearMessagesMutation.isPending ? "Clearing..." : "Clear"}
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={removeMemberDialog.isOpen}
        onClose={() => setRemoveMemberDialog({ isOpen: false, member: null })}
        title="Remove Member"
        size="sm"
      >
        <div className="text-sm text-neutral-600">
          Are you sure you want to remove{" "}
          <strong>{removeMemberDialog.member?.name}</strong> from this chatroom?
        </div>
        <ModalFooter>
          <ModalButton
            onClick={() =>
              setRemoveMemberDialog({ isOpen: false, member: null })
            }
            variant="secondary"
          >
            Cancel
          </ModalButton>
          <ModalButton
            onClick={() => {
              if (removeMemberDialog.member && selectedChatroomId) {
                removeMemberMutation.mutate({
                  chatroomId: selectedChatroomId,
                  memberId: removeMemberDialog.member.userId,
                });
              }
            }}
            variant="primary"
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? "Removing..." : "Remove"}
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* AI Settings Modal */}
      <Modal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        title="Change AI Behavior"
        size="lg"
      >
        <textarea
          placeholder="AI instructions"
          value={aiSystemMessage}
          onChange={(e) => setAiSystemMessage(e.target.value)}
          rows={6}
          className="w-full p-2 text-sm border border-neutral-200 focus:border-green-700 outline-none resize-none rounded"
        />
        <ModalFooter>
          <ModalButton
            onClick={() => setIsAiSettingsOpen(false)}
            variant="secondary"
          >
            Cancel
          </ModalButton>
          <ModalButton onClick={handleSaveAiSettings} variant="primary">
            Save
          </ModalButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
