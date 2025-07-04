"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface InvitePageProps {
  params: { code: string };
}

export default function InvitePage({ params }: InvitePageProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "already-member"
  >("loading");
  const [error, setError] = useState<string>("");
  const [chatroomName, setChatroomName] = useState<string>("");
  const [chatroomId, setChatroomId] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Redirect to sign in with return URL
      router.replace(
        `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    // User is signed in, process the invite
    processInvite();
  }, [isLoaded, isSignedIn, params.code]);

  const processInvite = async () => {
    try {
      setStatus("loading");

      const response = await fetch(`/api/invite/${params.code}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to process invite");
        setStatus("error");
        return;
      }

      if (data.alreadyMember) {
        setChatroomName(data.chatroomName || "Chatroom");
        setChatroomId(data.chatroomId);
        setStatus("already-member");
        // Auto-redirect after a brief pause
        setTimeout(() => {
          router.push(`/chatrooms/${data.chatroomId}`);
        }, 2000);
        return;
      }

      if (data.success) {
        setChatroomName(data.chatroomName || "Chatroom");
        setChatroomId(data.chatroomId);
        setStatus("success");
        // Auto-redirect after a brief pause
        setTimeout(() => {
          router.push(`/chatrooms/${data.chatroomId}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error processing invite:", err);
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Join Chatroom</CardTitle>
          <CardDescription>
            You've been invited to join a collaborative session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Processing your invite...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">
                Welcome to {chatroomName}!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                You've successfully joined the chatroom. Redirecting...
              </p>
            </div>
          )}

          {status === "already-member" && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">
                You're already a member!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Taking you to {chatroomName}...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium text-red-900">Unable to join</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={processInvite} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
