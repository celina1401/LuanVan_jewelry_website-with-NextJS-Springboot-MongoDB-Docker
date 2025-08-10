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
  onInboxUpdate?: (inbox: ChatSummary[]) => void;
}

export default function AdminChatInbox({ onSelect, onInboxUpdate }: Props) {
  const [inbox, setInbox] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchInbox = async () => {
    try {
      const res = await fetch("http://localhost:9007/api/chat/inbox");
      if (!res.ok) throw new Error(`Lỗi: ${res.statusText}`);
      const data = await res.json();
      setInbox(data);
      localStorage.setItem("admin_inbox", JSON.stringify(data));
      // Notify parent component of inbox update
      if (onInboxUpdate) {
        onInboxUpdate(data);
      }
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
    setSelectedUserId(userId);
    onSelect(userId);

    try {
      // Gọi API để đánh dấu tin nhắn đã đọc
      await fetch(`http://localhost:9007/api/chat/markAsRead/${userId}`, {
        method: "POST",
      });

      // Cập nhật UI ngay lập tức
      setInbox((prev) => {
        const newInbox = prev.map((chat) =>
          chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
        );
        localStorage.setItem("admin_inbox", JSON.stringify(newInbox));
        // Notify parent component of inbox update
        if (onInboxUpdate) {
          onInboxUpdate(newInbox);
        }
        return newInbox;
      });

      console.log("✅ Đã đánh dấu tin nhắn đã đọc cho user:", userId);
    } catch (err) {
      console.error("❌ Lỗi markAsRead:", err);
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải...</span>
    </div>
  );
  
  if (error) return (
    <div className="p-6 text-red-500 text-center">
      <div className="text-xl mb-2">⚠️</div>
      {error}
    </div>
  );

  if (inbox.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <div className="text-sm">Chưa có khách hàng nào gửi tin nhắn</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">💬 Hộp thư ({inbox.length})</h3>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {[...inbox]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((chat) => (
            <div
              key={chat.userId}
              onClick={() => handleSelectUser(chat.userId)}
              className={`cursor-pointer px-4 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                selectedUserId === chat.userId ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    👤 {chat.username || chat.userId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {chat.lastMessage}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(chat.timestamp).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  {chat.unreadCount > 0 ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  ) : (
                    <span className="text-xs text-green-500 dark:text-green-400 font-medium">
                      ✓ Đã đọc
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
