// "use client";
// import { Message } from "@/lib/type";
// import React, { useEffect, useRef, useState } from "react";


// export default function AdminChatDetail({ userId }: { userId: string }) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       const res = await fetch(`http://localhost:9007/filter?userId=${userId}`);
//       const data = await res.json();
//       setMessages(data);
//     };
//     if (userId) fetchMessages();
//   }, [userId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const msg: Message = {
//       sender: "admin",
//       role: "admin",
//       content: input,
//       timestamp: new Date().toISOString(),
//     };

//     await fetch("http://localhost:9007/send/admin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ...msg, toUserId: userId }),
//     });

//     setMessages((prev) => [...prev, msg]);
//     setInput("");
//   };

//   return (
//     <div className="flex flex-col flex-1 p-4">
//       <div className="flex-1 overflow-y-auto space-y-2">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`flex ${msg.role === "admin" ? "justify-end" : "justify-start"}`}>
//             <div className={`px-3 py-2 rounded-lg shadow text-sm ${msg.role === "admin" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"}`}>
//               <div>{msg.content}</div>
//               <div className="text-xs text-right text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <form onSubmit={handleSend} className="flex gap-2 mt-2">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Nhập tin nhắn..."
//           className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600">Gửi</button>
//       </form>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";

interface Message {
  sender: string;
  content: string;
  timestamp: string;
  role: "user" | "admin";
}

let stompClient: Client | null = null;

export default function AdminChatDetail({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Kết nối WebSocket khi vào chi tiết chat
  useEffect(() => {
    const socket = new SockJS("http://localhost:9007/ws");
    stompClient = over(socket);
    stompClient.connect({}, () => {
      console.log("✅ Admin WebSocket connected");

      // Subscribe kênh user để nhận phản hồi
      stompClient?.subscribe(`/topic/user/${userId}`, (message) => {
        const msg: Message = JSON.parse(message.body);
        if (msg.role === "user") {
          setMessages((prev) => [...prev, msg]);
        }
      });
    });

    return () => {
      stompClient?.disconnect(() => {
        console.log("🛑 Admin WebSocket disconnected");
      });
    };
  }, [userId]);

  // Fetch lịch sử ban đầu
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`http://localhost:9007/api/chat/filter?userId=${userId}`);
      const data = await res.json();
      setMessages(data);
    };
    if (userId) fetchMessages();
  }, [userId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !stompClient) return;

    const msg: Message = {
      sender: "admin", // Hoặc dùng Clerk ID của admin nếu muốn
      role: "admin",
      content: input,
      timestamp: new Date().toISOString(),
    };

    stompClient.send("/app/chat", { userId }, JSON.stringify(msg));
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "admin" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg shadow text-sm ${
                msg.role === "admin"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-xs text-right text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}

