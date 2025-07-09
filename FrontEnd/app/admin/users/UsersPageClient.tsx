"use client";
import { useState } from "react";
import AdminChat from '../../../components/ui/chat';

export default function UsersPageClient() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Thêm người dùng mới
        </button>
      </div>
      <div className="grid gap-6">
        {/* Filters */}
        <div className="flex gap-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select className="px-3 py-2 border rounded-md">
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
          <select className="px-3 py-2 border rounded-md">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
        {/* Users Table */}
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="grid grid-cols-6 gap-4 font-medium border-b pb-2">
              <div>User</div>
              <div>Email</div>
              <div>Vai trò</div>
              <div>Trạng thái</div>
              <div>Hoạt động gần nhất</div>
              <div>Thao tác</div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              Người dùng sẽ được hiển thị tại đây
            </div>
          </div>
        </div>
      </div>
      {/* Nút mở chat */}
      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
        onClick={() => setShowChat(true)}
      >
        Hỗ trợ khách hàng
      </button>
      {/* Popup chat */}
      {showChat && (
        <div className="fixed bottom-24 right-8 w-[500px] max-w-full bg-white rounded-xl shadow-2xl border z-50">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-bold">Chat khách hàng</span>
            <button onClick={() => setShowChat(false)} className="text-xl font-bold px-2">×</button>
          </div>
          <div className="p-2">
            <AdminChat />
          </div>
        </div>
      )}
    </div>
  );
} 