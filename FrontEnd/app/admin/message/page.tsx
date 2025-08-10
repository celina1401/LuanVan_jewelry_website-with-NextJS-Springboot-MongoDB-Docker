"use client";

import { useEffect, useState } from "react";
import AdminChatDetail from "@/app/components/chatbox/AdminChatDetail";
import AdminChatInbox from "@/app/components/chatbox/AdminChatInbox";

interface ChatSummary {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function AdminMessagePage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    () => localStorage.getItem("selected_user_id") || null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (selectedUserId) {
      localStorage.setItem("selected_user_id", selectedUserId);
    }
  }, [selectedUserId]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Clear localStorage to force fresh data
    localStorage.removeItem("admin_inbox");
    localStorage.removeItem("selected_user_id");
    setSelectedUserId(null);
  };

  const handleInboxUpdate = (inbox: ChatSummary[]) => {
    const total = inbox.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setTotalUnread(total);
  };

  return (
    <div className="p-6 bg-white dark:bg-black min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📨 Tin nhắn từ khách hàng</h1>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              {totalUnread > 99 ? '99+' : totalUnread} tin nhắn chưa đọc
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        >
          <span>🔄</span>
          Làm mới
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Inbox - Left Sidebar */}
        <div className="border-r border-gray-200 dark:border-gray-700">
          <AdminChatInbox 
            key={refreshKey}
            onSelect={handleUserSelect}
            onInboxUpdate={handleInboxUpdate}
          />
        </div>

        {/* Chat Detail - Right Side */}
        <div className="lg:col-span-2 border rounded-lg shadow-sm p-4 min-h-[600px] bg-gray-50 dark:bg-gray-900">
          {selectedUserId ? (
            <>
              <div className="font-semibold mb-4 text-lg text-primary border-b pb-2">
                💬 Đang trò chuyện với: {selectedUserId}
              </div>
              <AdminChatDetail userId={selectedUserId} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-xl font-medium mb-2">Chọn một người dùng</div>
              <div className="text-sm">để bắt đầu trò chuyện</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
