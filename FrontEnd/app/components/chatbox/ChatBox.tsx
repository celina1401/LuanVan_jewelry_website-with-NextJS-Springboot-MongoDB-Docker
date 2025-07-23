//   "use client";
//   import React, { useState, useRef, useEffect } from "react";
//   import { FaComments, FaTimes } from "react-icons/fa";
//   import SockJS from "sockjs-client";
//   import { Client, over } from "stompjs";
//   // import { useChat } from "@/contexts/ChatContext";
// // import { useEffect } from "react";
//   import { Message } from "@/lib/type";

//   // const SockJS = require("sockjs-client");
//   let stompClient: Client | null = null;

//   const mockAdminName = "Admin";
//   const mockUserName = "Bạn";

//   export default function ChatBox() {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [input, setInput] = useState("");
//     const [role, setRole] = useState<"user" | "admin">("user");
//     const [userId, setUserId] = useState<string>("user123"); // 👉 thay bằng Clerk ID thực tế
//     const [open, setOpen] = useState(false);
//     const messagesEndRef = useRef<HTMLDivElement | null>(null);

//     // Connect WebSocket khi mở chat
//     useEffect(() => {
//       if (open && !stompClient) {
//         const socket = new SockJS("http://localhost:9007/ws");
//         stompClient = over(socket);
//         stompClient.connect({}, () => {
//           console.log("✅ WebSocket connected");

//           stompClient?.subscribe("/topic/admin", (message) => {
//             const msg: Message = JSON.parse(message.body);
//             if (msg.role === "admin") {
//               setMessages((prev) => [...prev, msg]);
//             }
//           });

//           stompClient?.subscribe(`/topic/user/${userId}`, (message) => {
//             const msg: Message = JSON.parse(message.body);
//             if (msg.role === "user") {
//               setMessages((prev) => [...prev, msg]);
//             }
//           });
//         });
//       }
//     }, [open, userId]);

//     // Auto scroll
//     useEffect(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     const handleSend = (e: React.FormEvent) => {
//       e.preventDefault();
//       if (!input.trim() || !stompClient) return;

//       const msg: Message = {
//         sender: userId,
//         role,
//         content: input,
//         timestamp: new Date().toISOString(),
//       };

//       stompClient.send("/app/chat", { userId }, JSON.stringify(msg));
//       setMessages((prev) => [...prev, msg]);
//       setInput("");
//     };

//     return (
//       <>
//         {!open && (
//           <button
//             className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl z-50 hover:bg-blue-600 transition text-3xl"
//             onClick={() => setOpen(true)}
//             aria-label="Mở chat với admin"
//           >
//             <FaComments />
//           </button>
//         )}
//         {open && (
//           <div className="fixed bottom-6 right-6 w-[420px] max-h-[80vh] bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-fade-in">
//             <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 font-bold text-lg bg-blue-500 text-white rounded-t-xl">
//               <span>Hỏi đáp</span>
//               <button onClick={() => setOpen(false)} className="ml-2 text-white hover:text-gray-200 text-xl" aria-label="Đóng chat">
//                 <FaTimes />
//               </button>
//             </div>
//             <div className="flex-1 p-4 overflow-y-auto h-64 min-h-[120px] space-y-2">
//               {messages.map((msg, idx) => (
//                 <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//                   <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
//                     <div className="font-semibold mb-1">{msg.role === "user" ? mockUserName : mockAdminName}</div>
//                     <div>{msg.content}</div>
//                     <div className="text-xs text-right text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//             <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t dark:border-gray-700">
//               <select value={role} onChange={e => setRole(e.target.value as any)} className="rounded-md px-3 py-2 text-sm border dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
//                 <option value="user">Tôi</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <input
//                 type="text"
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 placeholder="Nhập tin nhắn..."
//                 className="flex-1 rounded-md px-3 py-2 border dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
//                 style={{ minWidth: 0 }}
//               />
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all font-semibold text-sm flex-shrink-0"
//                 style={{ height: "40px" }}
//               >
//                 Gửi
//               </button>
//             </form>
//           </div>
//         )}
//       </>
//     );
//   }

"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";
import { useUser } from "@clerk/nextjs";
import { Message } from "@/lib/type";

let stompClient: Client | null = null;

export default function ChatBox() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as "user" | "admin") || "user";
  const userId = user?.id || "anonymous";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Connect WebSocket khi mở chat
  useEffect(() => {
    if (open && !stompClient) {
      const socket = new SockJS("http://localhost:9007/ws");
      stompClient = over(socket);
      stompClient.connect({}, () => {
        console.log("✅ WebSocket connected");

        stompClient?.subscribe("/topic/admin", (message) => {
          const msg: Message = JSON.parse(message.body);
          if (msg.role === "admin") {
            setMessages((prev) => [...prev, msg]);
          }
        });

        stompClient?.subscribe(`/topic/user/${userId}`, (message) => {
          const msg: Message = JSON.parse(message.body);
          if (msg.role === "user") {
            setMessages((prev) => [...prev, msg]);
          }
        });
      });
    }
  }, [open, userId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !stompClient) return;

    const msg: Message = {
      sender: userId,
      role,
      content: input,
      timestamp: new Date().toISOString(),
    };

    stompClient.send("/app/chat", { userId }, JSON.stringify(msg));
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl z-50 hover:bg-blue-600 transition text-3xl"
          onClick={() => setOpen(true)}
          aria-label="Mở chat với admin"
        >
          <FaComments />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-[420px] max-h-[80vh] bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 font-bold text-lg bg-blue-500 text-white rounded-t-xl">
            <span>Hỏi đáp</span>
            <button onClick={() => setOpen(false)} className="ml-2 text-white hover:text-gray-200 text-xl" aria-label="Đóng chat">
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto h-64 min-h-[120px] space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
                  <div className="font-semibold mb-1">{msg.role === "user" ? "Khách" : "Admin"}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs text-right text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-md px-3 py-2 border dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
              style={{ minWidth: 0 }}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all font-semibold text-sm flex-shrink-0"
              style={{ height: "40px" }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}

