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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const adminId = user?.id ?? "admin"; // Lấy ID thật từ Clerk

  // ✅ Load localStorage + fetch history
  useEffect(() => {
    const saved = localStorage.getItem(`chat_admin_${userId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }

    const fetchHistory = async () => {
      try {
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
      } catch (err) {
        console.error("❌ Lỗi khi tải lịch sử admin:", err);
        setMessages([]);
      }
    };

    fetchHistory();
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
  }, [userId]);

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

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-2">
        {messages.map((msg, idx) => {
          const isSentByMe = msg.sender === "admin";
          return (
            <div key={idx} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow ${isSentByMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
              >
                <div className="font-semibold mb-1">{isSentByMe ? "Admin" : "Khách"}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-right text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t pt-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold text-sm"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
