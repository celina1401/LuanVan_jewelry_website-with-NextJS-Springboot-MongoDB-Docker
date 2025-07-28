"use client";

import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

interface ChatSummary {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Props {
  onSelect: (userId: string) => void;
}

export default function AdminChatInbox({ onSelect }: Props) {
  const [inbox, setInbox] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<any>(null);

  const fetchInbox = async () => {
    try {
      const res = await fetch("http://localhost:9007/api/chat/inbox");
      if (!res.ok) throw new Error(`Lỗi: ${res.statusText}`);
      const data = await res.json();
      setInbox(data);
      localStorage.setItem("admin_inbox", JSON.stringify(data));
    } catch (err: any) {
      console.error("❌ Lỗi khi tải hộp thư:", err);
      setError("Không thể tải hộp thư");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedInbox = localStorage.getItem("admin_inbox");
    if (savedInbox) {
      setInbox(JSON.parse(savedInbox));
    }
    fetchInbox();
  }, []);

  useEffect(() => {
    const socket = new SockJS("http://localhost:9007/ws");
    const client = over(socket);

    client.connect({ userId: "admin" }, () => {
      console.log("✅ WebSocket connected to /topic/admin");

      client.subscribe("/topic/admin", (message: any) => {
        const msg = JSON.parse(message.body);
        console.log("📥 WebSocket message:", msg);

        if (msg.type === "new-message" || msg.type === "read-update") {
          fetchInbox();
        }
      });

      setStompClient(client);
    });

    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("🛑 WebSocket disconnected"));
      }
    };
  }, []);

  const handleSelectUser = async (userId: string) => {
    onSelect(userId);

    try {
      await fetch(`http://localhost:9007/api/chat/markAsRead/${userId}`, {
        method: "POST",
      });

      setInbox((prev) => {
        const newInbox = prev.map((chat) =>
          chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
        );
        localStorage.setItem("admin_inbox", JSON.stringify(newInbox));
        return newInbox;
      });
    } catch (err) {
      console.error("❌ Lỗi markAsRead:", err);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="border-r w-1/3 overflow-y-auto h-full">
      {[...inbox]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((chat) => (
          <div
            key={chat.userId}
            onClick={() => handleSelectUser(chat.userId)}
            className="cursor-pointer px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">👤 {chat.username}</div>
              <div className="text-sm text-gray-500 mt-1 truncate">
                {chat.lastMessage}
              </div>
            </div>
            {chat.unreadCount > 0 ? (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {chat.unreadCount}
              </span>
            ) : (
              <span className="text-xs text-gray-400">✓ Đã đọc</span>
            )}
          </div>
        ))}
    </div>
  );
}
