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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isJoinSessionOpen, setIsJoinSessionOpen] = useState(false);
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

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

  // Mock data
  const recentSessions = [
    {
      id: "sess_001",
      title: "Q4 Marketing Strategy",
      participants: ["Sarah Chen", "Mike Rodriguez", "Alex Kim"],
      lastActive: "2 hours ago",
      status: "active",
      messages: 47,
      files: 3,
    },
    {
      id: "sess_002",
      title: "Product Research Analysis",
      participants: ["Emma Wilson", "David Park"],
      lastActive: "1 day ago",
      status: "paused",
      messages: 23,
      files: 8,
    },
    {
      id: "sess_003",
      title: "Team Brainstorming Session",
      participants: ["Sarah Chen", "Mike Rodriguez", "Emma Wilson", "Alex Kim"],
      lastActive: "3 days ago",
      status: "completed",
      messages: 156,
      files: 12,
    },
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
    },
    {
      name: "Mike Rodriguez",
      role: "Designer",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "online",
    },
    {
      name: "Emma Wilson",
      role: "Developer",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "away",
    },
    {
      name: "Alex Kim",
      role: "Analyst",
      avatar: "/placeholder.svg?height=32&width=32",
      status: "offline",
    },
  ];

  const recentFiles = [
    {
      name: "Market_Analysis_Q4.pdf",
      size: "2.4 MB",
      uploadedBy: "Sarah Chen",
      uploadedAt: "2 hours ago",
    },
    {
      name: "User_Research_Data.xlsx",
      size: "1.8 MB",
      uploadedBy: "Alex Kim",
      uploadedAt: "1 day ago",
    },
    {
      name: "Design_Mockups.fig",
      size: "5.2 MB",
      uploadedBy: "Mike Rodriguez",
      uploadedAt: "2 days ago",
    },
  ];

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
                    <AvatarImage
                      src={user?.imageUrl || undefined}
                      alt={
                        user?.firstName ||
                        user?.username ||
                        user?.emailAddresses?.[0]?.emailAddress ||
                        "User"
                      }
                    />
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
                      <Input placeholder="Enter session title..." />
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
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Create Session
                    </Button>
                  </div>
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
                      <Input placeholder="sess_abc123 or https://..." />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinSessionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Join Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Active Sessions</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Recent</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Files</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Team</span>
              </a>
            </nav>

            {/* Team Members */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                Team Members
              </h3>
              <div className="space-y-2">
                {teamMembers.slice(0, 4).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === "online"
                            ? "bg-green-500"
                            : member.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome
                  {user?.firstName
                    ? `, ${user.firstName}`
                    : user?.emailAddresses?.[0]?.emailAddress
                    ? `, ${user.emailAddresses[0].emailAddress}`
                    : ""}
                  !
                </h1>
                <p className="text-gray-600 mt-1">
                  Ready to collaborate with AI and your team?
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Sessions
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">4 online now</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Files Shared
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    AI Interactions
                  </CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+89 today</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="sessions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="team">Team Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Collaborative Sessions
                  </h2>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>

                <div className="grid gap-4">
                  {recentSessions.map((session) => (
                    <Card
                      key={session.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CardTitle className="text-lg">
                              {session.title}
                            </CardTitle>
                            <Badge
                              variant={
                                session.status === "active"
                                  ? "default"
                                  : session.status === "paused"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {session.status}
                            </Badge>
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
                              {session.participants.length} participants
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {session.messages} messages
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {session.files} files
                            </span>
                            <span>Last active {session.lastActive}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {session.participants
                              .slice(0, 3)
                              .map((participant, index) => (
                                <Avatar
                                  key={index}
                                  className="h-8 w-8 border-2 border-white"
                                >
                                  <AvatarImage
                                    src="/placeholder.svg?height=32&width=32"
                                    alt={participant}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {participant
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            {session.participants.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  +{session.participants.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            {session.status === "active"
                              ? "Join Session"
                              : "Resume Session"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Files
                  </h2>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>

                <div className="grid gap-4">
                  {recentFiles.map((file, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {file.size} • Uploaded by {file.uploadedBy} •{" "}
                                {file.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Team Activity
                  </h2>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Online Team Members</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {teamMembers
                        .filter((member) => member.status === "online")
                        .map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={member.avatar || "/placeholder.svg"}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">Sarah Chen</span>{" "}
                              started a new session
                            </p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">
                                Mike Rodriguez
                              </span>{" "}
                              uploaded 3 files
                            </p>
                            <p className="text-xs text-gray-500">4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">Alex Kim</span>{" "}
                              completed analysis
                            </p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
