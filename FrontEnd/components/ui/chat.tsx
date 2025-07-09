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
    <div className="flex h-[500px] w-full max-w-[700px] bg-white rounded-xl shadow-lg border overflow-hidden">
      {/* Sidebar khách hàng */}
      <div className="w-1/4 bg-gray-50 border-r h-full overflow-y-auto">
        <h2 className="font-bold p-3 border-b bg-gray-100 text-gray-700">Khách hàng</h2>
        {userIds.length === 0 && (
          <div className="p-4 text-gray-400 text-center">Chưa có khách hàng nào chat</div>
        )}
        {userIds.map(uid => (
          <div
            key={uid}
            className={`p-3 cursor-pointer border-b hover:bg-blue-50 transition ${
              selectedUser === uid ? "bg-blue-100 font-bold text-blue-700" : ""
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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-gray-400 text-center mt-10">Chưa có tin nhắn nào</div>
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
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold mb-1">
                      {msg.senderId === "admin" ? "Admin" : "User"}
                    </div>
                    <div>{msg.content}</div>
                    <div className="text-xs text-right text-gray-300 mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t bg-white">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                className="border flex-1 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Chọn khách hàng để xem chat
          </div>
        )}
      </div>
    </div>
  );
} 