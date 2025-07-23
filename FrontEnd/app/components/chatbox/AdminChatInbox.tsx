"use client";
import React, { useEffect, useState } from "react";

interface ChatSummary {
  userId: string;
  lastMessage: string;
  timestamp: string;
}

export default function AdminChatInbox({ onSelect }: { onSelect: (userId: string) => void }) {
  const [inbox, setInbox] = useState<ChatSummary[]>([]);

  useEffect(() => {
    const fetchInbox = async () => {
      const res = await fetch("http://localhost:9007/inbox");
      const data = await res.json();
      setInbox(data);
    };
    fetchInbox();
  }, []);

  return (
    <div className="border-r w-1/3 overflow-y-auto h-full">
      {inbox.map((chat) => (
        <div
          key={chat.userId}
          onClick={() => onSelect(chat.userId)}
          className="cursor-pointer px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="font-semibold">{chat.userId}</div>
          <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
          <div className="text-xs text-gray-400">{new Date(chat.timestamp).toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  );
}
