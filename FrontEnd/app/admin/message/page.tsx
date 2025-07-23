"use client";
import { useEffect, useState } from "react";

interface ChatLog {
  sender: string;
  role: "user" | "admin";
  content: string;
  timestamp: string;
}

export default function AdminMessagePage() {
  const [conversations, setConversations] = useState<Record<string, ChatLog[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchChatLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:9007/api/chat/filter");
      const data = await res.json();
      console.log("📦 Dữ liệu tin nhắn:", data);

      if (!Array.isArray(data)) {
        console.error("❌ Dữ liệu trả về không phải mảng:", data);
        setConversations({});
        return;
      }

      const grouped: Record<string, ChatLog[]> = {};
      data
        .filter((log: ChatLog) => log.role === "user")
        .forEach((log: ChatLog) => {
          if (!grouped[log.sender]) grouped[log.sender] = [];
          grouped[log.sender].push(log);
        });

      setConversations(grouped);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch sử:", err);
      setConversations({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📨 Tin nhắn từ khách hàng</h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : Object.keys(conversations).length === 0 ? (
        <p className="text-gray-500 italic">Chưa có khách hàng nào gửi tin nhắn.</p>
      ) : (
        <div className="grid gap-4">
          {Object.entries(conversations).map(([userId, logs]) => {
            const lastMessage = logs[logs.length - 1];
            return (
              <div
                key={userId}
                className="border p-4 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                onClick={() => window.location.href = `/admin/message/${userId}`}
              >
                <div className="font-semibold">👤 Khách hàng: {userId}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(lastMessage.timestamp).toLocaleString()}
                </div>
                <div className="text-sm mt-2 truncate">
                  {lastMessage.content || <em className="text-gray-400">[Không có nội dung]</em>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
