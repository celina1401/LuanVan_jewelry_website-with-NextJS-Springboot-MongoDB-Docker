"use client";
import React, { useState } from "react";
import AdminChatInbox from "./AdminChatInbox";
import AdminChatDetail from "./AdminChatDetail";

export default function AdminChatPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <AdminChatInbox onSelect={(userId) => setSelectedUser(userId)} />
      <div className="flex-1">
        {selectedUser ? (
          <AdminChatDetail userId={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Chọn người dùng để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}
