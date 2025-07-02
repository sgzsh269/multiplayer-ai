"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pause,
  UserPlus,
  MoreHorizontal,
  Paperclip,
  Image,
  Send,
  Users,
  MessageSquare,
  FileText,
  Brain,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { usePartySocket, PartyMessage } from "@/lib/usePartySocket";
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
    avatarInitials: string;
  };
  timestamp: string;
  content: string;
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

  const { user: clerkUser } = useUser();
  const displayName =
    clerkUser?.firstName ||
    clerkUser?.username ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    "User";

  // Add PartyKit real-time messaging
  const {
    messages: partyMessages,
    sendMessage: sendPartyMessage,
    clearMessages,
  } = usePartySocket({
    chatroomId: chatroomId || "",
    user: displayName,
  });

  // Clear PartyKit messages when chatroom data changes (to prevent accumulation)
  useEffect(() => {
    if (chatroom) {
      // Reset PartyKit messages when we get fresh API data
      // This prevents infinite accumulation of real-time messages
      clearMessages();
    }
  }, [chatroom, clearMessages]);

  // Combine API and PartyKit messages with deduplication
  const messageMap = new Map<string, any>();

  // Add API messages first
  (chatroom?.messages || []).forEach((msg) => {
    const key = `${msg.sender.id}-${msg.timestamp}-${msg.content}`;
    messageMap.set(key, { ...msg, _source: "api" });
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
          avatarInitials: (m.displayName
            ? m.displayName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
            : m.user?.slice(0, 2) || "U"
          ).toUpperCase(),
        },
        timestamp: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : "",
        content: m.text,
        _source: "realtime",
      });
    }
  });

  const allMessages = Array.from(messageMap.values());

  // Auto-scroll to bottom only when the current user sends a message
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false); // Reset the flag
    }
  }, [allMessages.length, shouldAutoScroll]);

  // Helper function to handle sending messages
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setShouldAutoScroll(true); // Mark for auto-scroll
      sendMessageMutation.mutate(messageInput.trim());
      sendPartyMessage(messageInput.trim());
      setMessageInput("");
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
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{chatroom.name}</h1>
            <p className="text-sm text-gray-500">
              Started {chatroom.startedAgo} - {chatroom.participantsActive}{" "}
              participants active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Content */}
        <main className="flex-1 flex flex-col bg-white border-r">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {allMessages.map((message, index) => (
              <div
                key={`${message._source}-${message.id}`}
                className={`flex items-start space-x-3 ${
                  message.sender.id === "ai"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback>
                    {message.sender.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 ${
                    message.sender.id === "ai" ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex items-center px-1">
                    <span className="font-semibold text-gray-900">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  <Card
                    className={`mt-1 max-w-[60%] py-0 ${
                      message.sender.id === "ai"
                        ? "bg-purple-50 text-purple-800 ml-auto"
                        : "bg-gray-100"
                    }`}
                  >
                    <CardContent className="p-0 text-sm">
                      <div
                        className="m-0 p-1 leading-tight *:my-0"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-white">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message to collaborate with AI and your team..."
                className="flex-1"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon">
                <Image className="w-5 h-5 text-gray-500" />
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleSendMessage}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{chatroom.participantsActive} participants online</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
              <span>Console</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Clear Console</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {chatroom.participants.map((participant) => (
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
                    <span
                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        participant.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </p>
                    <p className="text-xs text-gray-500">{participant.role}</p>
                  </div>
                  {participant.isTyping && (
                    <span className="text-xs text-blue-500">Typing...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
