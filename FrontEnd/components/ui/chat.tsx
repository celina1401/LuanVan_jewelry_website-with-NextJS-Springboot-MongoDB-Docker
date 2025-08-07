"use client"
import { useState, useEffect } from "react";

export default function AdminChat() {
  const [userIds, setUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Lấy danh sách userId từng chat
  useEffect(() => {
    fetch("/api/chat/messages?userId=admin")
      .then(res => res.json())
      .then(data => {
        const ids = Array.from(new Set(data.map((msg: any) =>
          msg.senderId !== "admin" ? msg.senderId : msg.receiverId
        ).filter((id: string) => id !== "admin")));
        setUserIds(ids as string[]);
      });
  }, []);

  // Lấy lịch sử chat với user được chọn
  useEffect(() => {
    if (selectedUser) {
      fetch(`/api/chat/messages?userId=${selectedUser}`)
        .then(res => res.json())
        .then(setMessages);
    }
  }, [selectedUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: "admin",
        receiverId: selectedUser,
        content: input,
      }),
    });
    setInput("");
    // Lấy lại lịch sử chat
    fetch(`/api/chat/messages?userId=${selectedUser}`)
      .then(res => res.json())
      .then(setMessages);
  };

  return (
    <div className="flex h-[500px] w-full max-w-[700px] bg-white dark:bg-[#18181b] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sidebar khách hàng */}
      <div className="w-1/4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
        <h2 className="font-bold p-3 border-b bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Khách hàng</h2>
        {userIds.length === 0 && (
          <div className="p-4 text-gray-400 dark:text-gray-500 text-center">Chưa có khách hàng nào chat</div>
        )}
        {userIds.map(uid => (
          <div
            key={uid}
            className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition ${
              selectedUser === uid ? "bg-blue-100 dark:bg-blue-900 font-bold text-blue-700 dark:text-blue-300" : ""
            }`}
            onClick={() => setSelectedUser(uid)}
          >
            {uid}
          </div>
        ))}
      </div>
      {/* Khung chat */}
      <div className="flex-1 flex flex-col h-full">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#18181b]">
              {messages.length === 0 && (
                <div className="text-gray-400 dark:text-gray-500 text-center mt-10">Chưa có tin nhắn nào</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${msg.senderId === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg shadow text-sm max-w-[70%] ${
                      msg.senderId === "admin"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
                    }`}
                  >
                    <div className="font-semibold mb-1">
                      {msg.senderId === "admin" ? "Admin" : "User"}
                    </div>
                    <div>{msg.content}</div>
                    <div className="text-xs text-right text-gray-300 dark:text-gray-400 mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 flex-1 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập tin nhắn..."
              />
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition"
                type="submit"
              >
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg">
            Chọn khách hàng để xem chat
          </div>
        )}
      </div>
    </div>
  );
} 