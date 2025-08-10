"use client";

import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { Message } from "@/lib/type";
import { useUser } from "@clerk/nextjs"; 

let stompClient: any = null;

export default function AdminChatDetail({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const adminId = user?.id ?? "admin"; // Lấy ID thật từ Clerk

  // ✅ Load localStorage + fetch history + username
  useEffect(() => {
    const saved = localStorage.getItem(`chat_admin_${userId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }

    const fetchData = async () => {
      try {
        // Fetch chat history
        const res = await fetch(`http://localhost:9007/api/chat/filter/${userId}`);
        const data = await res.json();

        if (data && data.length > 0) {
          const sorted = data.sort(
            (a: Message, b: Message) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          setMessages(sorted);
          localStorage.setItem(`chat_admin_${userId}`, JSON.stringify(sorted));
        } else {
          // Nếu backend trả về rỗng (đã reset), xóa localStorage
          localStorage.removeItem(`chat_admin_${userId}`);
          setMessages([]);
        }

        // Fetch username from inbox data
        const inboxRes = await fetch("http://localhost:9007/api/chat/inbox");
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          const userChat = inboxData.find((chat: any) => chat.userId === userId);
          if (userChat) {
            setUsername(userChat.username || userId);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu chat:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // ✅ WebSocket connect + subscribe sau khi userId thay đổi
  useEffect(() => {
    // Ngắt kết nối cũ nếu có
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log("🛑 Disconnected old WebSocket before reconnecting");
      });
    }

    const socket = new SockJS("http://localhost:9007/ws");
    const client = over(socket);
    stompClient = client;

    client.connect({  userId: adminId }, () => {
      console.log("✅ WebSocket connected (Admin)");

      client.subscribe("/topic/admin", (message: any) => {
        const msg: Message = JSON.parse(message.body);

        // Chỉ xử lý nếu là tin nhắn từ đúng user
        if (msg.sender === userId && msg.role === "user") {
          setMessages((prev) => {
            // Kiểm tra xem đã có tin này chưa (dựa vào timestamp + content)
            const alreadyExists = prev.some(
              (m) => m.timestamp === msg.timestamp && m.content === msg.content
            );
            if (alreadyExists) return prev;

            const updated = [...prev, msg];
            localStorage.setItem(`chat_admin_${userId}`, JSON.stringify(updated));
            return updated;
          });
        }
      });
    });

    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("🛑 WebSocket admin disconnected"));
      }
    };
  }, [userId, adminId]);

  // ✅ Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !stompClient || !stompClient.connected) return;

    const msg: Message = {
      sender: "admin",
      receiver: userId,
      role: "admin",
      content: input,
      timestamp: new Date().toISOString(),
    };

    stompClient.send("/app/chat", {}, JSON.stringify(msg));
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(`chat_admin_${userId}`, JSON.stringify(updated));
    setInput("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải tin nhắn...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{username}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {messages.length > 0 ? `${messages.length} tin nhắn` : 'Chưa có tin nhắn'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">💬</div>
            <div>Chưa có tin nhắn nào</div>
            <div className="text-sm">Bắt đầu cuộc trò chuyện với khách hàng</div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByMe = msg.sender === "admin";
            return (
              <div key={idx} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    isSentByMe
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
                  }`}
                >
                  <div className="font-semibold mb-1 text-xs opacity-80">
                    {isSentByMe ? "Admin" : username}
                  </div>
                  <div className="leading-relaxed">{msg.content}</div>
                  <div className={`text-xs mt-2 ${
                    isSentByMe ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
