"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const sender = role === "admin" ? "admin" : userId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const receiverId = "admin";
  const localKey = `chat_user_${userId}`;

  // Function to clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem(localKey);
    setMessages([]);
  };

  // Function to clear all chat data from localStorage
  const clearAllChatData = () => {
    // Clear all chat-related localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_') || key === 'admin_inbox' || key === 'selected_user_id') {
        localStorage.removeItem(key);
      }
    });
    setMessages([]);
  };

  useEffect(() => {
    if (role === "admin" || !open || !userId) return;

    const welcomeMsg: Message = {
      sender: "admin",
      receiver: userId,
      role: "admin",
      content: "Chào bạn, T&C có thể giúp gì cho bạn?",
      timestamp: new Date().toISOString(),
    };
    const thankMsg: Message = {
      sender: "admin",
      receiver: userId,
      role: "admin",
      content: "Cảm ơn bạn đã quan tâm đến T&C Jewelry, mình sẽ tranh thủ trả lời bạn sớm nhất có thể!!",
      timestamp: new Date(Date.now() + 1000).toISOString(),
    };

    const saved = localStorage.getItem(localKey);
    if (saved) {
      let msgs: Message[] = JSON.parse(saved);
      // Nếu chưa từng chat (chỉ có tin nhắn chào hoặc rỗng), đảm bảo có đủ 2 tin nhắn auto
      if (msgs.length === 0 || (msgs.length === 1 && msgs[0].sender === "admin")) {
        msgs = [welcomeMsg, thankMsg];
        setMessages(msgs);
        localStorage.setItem(localKey, JSON.stringify(msgs));
        // Gửi cả 2 tin nhắn lên backend nếu chưa có
        fetch("http://localhost:9007/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(welcomeMsg),
        }).catch(() => {});
        fetch("http://localhost:9007/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(thankMsg),
        }).catch(() => {});
      } else {
        setMessages(msgs);
      }
    } else {
      // Nếu chưa có lịch sử, chỉ hiển thị tin nhắn chào từ admin
      setMessages([welcomeMsg]);
      localStorage.setItem(localKey, JSON.stringify([welcomeMsg]));
      // Gửi tin nhắn chào lên backend để lưu vào lịch sử
      fetch("http://localhost:9007/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(welcomeMsg),
      }).catch(() => {});
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:9007/api/chat/filter/${userId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          let sorted = data.sort((a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          // Nếu là lần đầu chat, merge 2 tin nhắn auto vào đầu mảng nếu chưa có
          const hasWelcome = sorted.some((m: Message) => m.content === welcomeMsg.content && m.sender === "admin");
          const hasThank = sorted.some((m: Message) => m.content === thankMsg.content && m.sender === "admin");
          if (!hasWelcome) sorted = [welcomeMsg, ...sorted];
          if (!hasThank) sorted = [sorted[0], thankMsg, ...sorted.slice(1)];
          setMessages(sorted);
          localStorage.setItem(localKey, JSON.stringify(sorted));
        } else {
          // Nếu backend trả về rỗng (đã reset), xóa localStorage
          localStorage.removeItem(localKey);
          setMessages([welcomeMsg]);
          localStorage.setItem(localKey, JSON.stringify([welcomeMsg]));
        }
        // Nếu không có lịch sử, giữ nguyên tin nhắn chào
      } catch (err) {
        console.error("❌ Lỗi khi tải lịch sử admin:", err);
        // Không setMessages([]) ở đây!
      }
    };
    

    fetchHistory();

    const socket = new SockJS("http://localhost:9007/ws");
    const client = over(socket);
    stompClient = client;

    client.connect({userId}, () => {
      console.log("✅ WebSocket connected (User)");

      client.subscribe("/topic/admin", (message) => {
        const msg: Message = JSON.parse(message.body);
        if (msg.receiver === userId) {
          setMessages((prev) => [...prev, msg]);
        }
      });
      
      client.subscribe(`/topic/user/${userId}`, (message) => {
        const msg: Message = JSON.parse(message.body);
        // if (msg.sender !== sender) {
        //   setMessages((prev) => [...prev, msg]);
        // }
        if (msg.sender !== sender) {
          setMessages((prev) => {
            const alreadyExists = prev.some(
              (m) => m.timestamp === msg.timestamp && m.content === msg.content
            );
            if (alreadyExists) return prev;
            const updated = [...prev, msg];
            localStorage.setItem(localKey, JSON.stringify(updated));
            return updated;
          });
        }
        
      });
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => console.log("🛑 WebSocket user disconnected"));
      }
    };
  }, [open, userId, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin" || !input.trim() || !stompClient || !stompClient.connected) return;

    const welcomeMsg: Message = {
      sender: "admin",
      receiver: userId,
      role: "admin",
      content: "Chào bạn, T&C có thể giúp gì cho bạn?",
      timestamp: new Date().toISOString(),
    };
    const thankMsg: Message = {
      sender: "admin",
      receiver: userId,
      role: "admin",
      content: "Cảm ơn bạn đã quan tâm đến T&C Jewelry, mình sẽ tranh thủ trả lời bạn sớm nhất có thể!!",
      timestamp: new Date(Date.now() + 1000).toISOString(),
    };

    let updated = [...messages];
    // Nếu thiếu tin nhắn chào, thêm lại vào đầu mảng
    if (!updated.some((m: Message) => m.content === welcomeMsg.content && m.sender === "admin")) {
      updated = [welcomeMsg, ...updated];
    }
    const msg: Message = {
      sender,
      receiver: receiverId,
      role,
      content: input,
      timestamp: new Date().toISOString(),
    };
    stompClient.send("/app/chat", { userId }, JSON.stringify(msg));
    updated = [...updated, msg];
    // Nếu là tin nhắn đầu tiên từ client (sau tin nhắn chào admin), gửi tin nhắn cảm ơn từ admin
    const clientMessages = updated.filter((m: Message) => m.sender === sender);
    if (clientMessages.length === 1 && !updated.some((m: Message) => m.content === thankMsg.content && m.sender === "admin")) {
      updated = [...updated, thankMsg];
      // Gửi tin nhắn cảm ơn này lên backend để lưu vào lịch sử
      fetch("http://localhost:9007/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thankMsg),
      }).catch(() => {});
    }
    setMessages(updated);
    localStorage.setItem(localKey, JSON.stringify(updated)); // ✅ Lưu khi gửi
    setInput("");
  };

  // Không render nếu là admin
  if (role === "admin") return null;

  return (
    <>
      {!open && (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl z-50 hover:bg-blue-600 transition text-3xl"
          onClick={() => setOpen(true)}
        >
          <FaComments />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-[420px] max-h-[80vh] bg-white dark:bg-[#18181b] shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 font-bold text-lg bg-blue-500 text-white rounded-t-xl">
            <span>Hỏi đáp</span>
            <button onClick={() => setOpen(false)} className="ml-2 text-white hover:text-gray-200 text-xl">
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto h-64 min-h-[120px] space-y-2">
            {messages.map((msg, idx) => {
              const isSentByMe = msg.sender === sender;
              return (
                <div key={idx} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow ${
                      isSentByMe
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <div className="font-semibold mb-1">{isSentByMe ? "Bạn" : "Admin"}</div>
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
          <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t dark:border-gray-700">
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
