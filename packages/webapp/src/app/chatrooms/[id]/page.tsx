"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function ChatroomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const chatroomId = params.id;

  const {
    data: chatroom,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatroom", chatroomId],
    queryFn: async () => {
      const res = await fetch(`/api/chatrooms/${chatroomId}`);
      if (!res.ok) throw new Error("Failed to fetch chatroom details");
      const json = await res.json();
      return json.chatroom;
    },
    enabled: !!chatroomId, // Only run the query if chatroomId is available
  });

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{chatroom.name}</h1>
      <p className="text-gray-600 mb-6">Chatroom ID: {chatroom.id}</p>

      <h2 className="text-2xl font-semibold mb-3">Members</h2>
      <ul className="list-disc pl-5 mb-6">
        {chatroom.members.map((member: any) => (
          <li key={member.id}>{member.displayName}</li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Messages</h2>
      <div className="space-y-4">
        {chatroom.messages.map((message: any) => (
          <div key={message.id} className="bg-gray-100 p-3 rounded-lg">
            <p className="font-medium">User {message.userId}</p>
            <p>{message.content}</p>
            <p className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* TODO: Add message input and send functionality */}
    </div>
  );
}
