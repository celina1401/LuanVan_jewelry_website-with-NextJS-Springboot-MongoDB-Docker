"use client";

import { useEffect, useState } from "react";
import AdminChatDetail from "@/app/components/chatbox/AdminChatDetail";

interface ChatSummary {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function AdminMessagePage() {
  const [inbox, setInbox] = useState<ChatSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    () => localStorage.getItem("selected_user_id") || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedInbox = localStorage.getItem("admin_inbox");
    if (savedInbox) {
      setInbox(JSON.parse(savedInbox));
    }

    const fetchInbox = async () => {
      try {
        const res = await fetch("http://localhost:9007/api/chat/inbox");
        if (!res.ok) throw new Error(`Lỗi: ${res.statusText}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setInbox(data);
          localStorage.setItem("admin_inbox", JSON.stringify(data));
        } else {
          // Nếu backend trả về rỗng (đã reset), xóa localStorage
          localStorage.removeItem("admin_inbox");
          localStorage.removeItem("selected_user_id");
          setInbox([]);
        }
      } catch (err: any) {
        console.error("❌ Lỗi khi tải hộp thư:", err);
        setError("Không thể tải hộp thư");
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      localStorage.setItem("selected_user_id", selectedUserId);
    }
  }, [selectedUserId]);

  return (
    <div className="p-6 bg-white dark:bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📨 Tin nhắn từ khách hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border-r w-full overflow-y-auto max-h-[80vh]">
          {loading ? (
            <p className="p-4">Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : inbox.length === 0 ? (
            <p className="p-4 text-gray-500 italic">Chưa có khách hàng nào gửi tin nhắn.</p>
          ) : (
            inbox
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((chat) => (
                <div
                  key={chat.userId}
                  onClick={() => setSelectedUserId(chat.userId)}
                  className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center ${
                    selectedUserId === chat.userId ? "bg-blue-100 dark:bg-blue-800" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">👤 {chat.username}</div>
                    <div className="text-sm text-gray-500 mt-1 truncate">{chat.lastMessage}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(chat.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              ))
          )}
        </div>

        <div className="lg:col-span-2 border rounded shadow p-4 min-h-[400px]">
          {selectedUserId ? (
            <>
              <div className="font-semibold mb-2 text-lg text-primary">
                💬 Đang trò chuyện với: {inbox.find(c => c.userId === selectedUserId)?.username || selectedUserId}
              </div>
              <AdminChatDetail userId={selectedUserId} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
              Chọn một người dùng để bắt đầu trò chuyện
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
