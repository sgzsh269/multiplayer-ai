"use client";

import { useState, useEffect } from "react";
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
  Search,
  Bell,
  LogOut,
  Copy,
  ExternalLink,
  MessageSquare,
  Calendar,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Chatroom {
  id: string;
  name: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  participantCount: number;
  messageCount: number;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isJoinSessionOpen, setIsJoinSessionOpen] = useState(false);
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

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
      setIsCreateSessionOpen(false);
      setNewChatroomName("");
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      // Navigate to the newly created chatroom
      if (data?.chatroom?.id) {
        router.push(`/chatrooms/${data.chatroom.id}`);
      }
    },
  });

  // State for join
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");
  const joinChatroom = useMutation({
    mutationFn: async (input: string) => {
      setJoinError("");

      // Extract chatroom ID from input (could be full URL or just ID)
      let chatroomId = input.trim();

      // Check if input is a URL and extract ID from it
      try {
        if (chatroomId.startsWith("http")) {
          const url = new URL(chatroomId);
          const pathMatch = url.pathname.match(/\/chatrooms\/(\d+)/);
          if (pathMatch) {
            chatroomId = pathMatch[1];
          } else {
            throw new Error("Invalid chatroom URL format");
          }
        }
        // If not a URL, assume it's already an ID
      } catch (error) {
        if (chatroomId.startsWith("http")) {
          setJoinError("Invalid chatroom URL format");
          throw new Error("Invalid chatroom URL format");
        }
        // If not a URL but parsing failed, continue with original input
      }

      // Validate that we have a numeric ID
      if (!/^\d+$/.test(chatroomId)) {
        setJoinError("Please enter a valid chatroom ID or URL");
        throw new Error("Invalid chatroom ID format");
      }

      const res = await fetch(`/api/chatrooms/${chatroomId}/join`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        setJoinError(err.error || "Failed to join chatroom");
        throw new Error(err.error || "Failed to join chatroom");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      setIsJoinSessionOpen(false);
      setJoinId("");
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });

      // Extract the chatroom ID and navigate to it
      let chatroomId = variables.trim();
      if (chatroomId.startsWith("http")) {
        try {
          const url = new URL(chatroomId);
          const pathMatch = url.pathname.match(/\/chatrooms\/(\d+)/);
          if (pathMatch) {
            chatroomId = pathMatch[1];
          }
        } catch (error) {
          // If extraction fails, don't navigate
          return;
        }
      }

      // Navigate to the joined chatroom
      router.push(`/chatrooms/${chatroomId}`);
    },
  });

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
          displayName:
            user.firstName ||
            user.username ||
            user.emailAddresses?.[0]?.emailAddress ||
            "User",
          avatarUrl: user.imageUrl || null,
        }),
      });
    }
  }, [user]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const res = await fetch("/api/chatrooms");
      if (!res.ok) throw new Error("Failed to fetch chatrooms");
      const json = await res.json();
      return json.chatrooms;
    },
  });

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                AI Playground
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sessions, files, or team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
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
                        : "U"}
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Dialog
                open={isCreateSessionOpen}
                onOpenChange={setIsCreateSessionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collaborative Session</DialogTitle>
                    <DialogDescription>
                      Start a new AI-powered collaborative session with your
                      team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Session Title
                      </label>
                      <Input
                        placeholder="Enter session title..."
                        value={newChatroomName}
                        onChange={(e) => setNewChatroomName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Input placeholder="Brief description of the session..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Invite Team Members
                      </label>
                      <Input placeholder="Enter email addresses..." />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateSessionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => createChatroom.mutate(newChatroomName)}
                    >
                      Create Session
                    </Button>
                  </div>
                  {createError && (
                    <p className="text-red-500 text-sm mt-2">{createError}</p>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog
                open={isJoinSessionOpen}
                onOpenChange={setIsJoinSessionOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Collaborative Session</DialogTitle>
                    <DialogDescription>
                      Enter a session ID or invitation link to join an existing
                      session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Session ID or Invitation Link
                      </label>
                      <Input
                        placeholder="123 or http://localhost:3000/chatrooms/123"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinSessionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => joinChatroom.mutate(joinId)}
                    >
                      Join Session
                    </Button>
                  </div>
                  {joinError && (
                    <p className="text-red-500 text-sm mt-2">{joinError}</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Navigation */}
            <nav className="space-y-2"></nav>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid gap-4">
              {data.map((session: Chatroom) => (
                <Card
                  key={session.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">
                          {session.name}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Session
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {session.participantCount || 0} participants
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {session.messageCount || 0} messages
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {/* Display participant avatars removed for MVP list view, only count is shown */}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => router.push(`/chatrooms/${session.id}`)}
                      >
                        {"Open Session"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
