"use client";
import { useEffect, useState } from "react";
import AdminChat from '../../../components/ui/chat';

export default function UsersPageClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [showChat, setShowChat] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    phone: "",
    address: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetch("http://localhost:9001/api/users/all")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("http://localhost:9001/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.message || "Thêm người dùng thất bại");
      } else {
        setShowAdd(false);
        setNewUser({ firstName: "", lastName: "", email: "", role: "user", phone: "", address: "" });
        setLoading(true);
        fetch("http://localhost:9001/api/users/all")
          .then(res => res.json())
          .then(data => {
            setUsers(data);
            setLoading(false);
          });
      }
    } catch {
      setAddError("Có lỗi xảy ra!");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={() => setShowAdd(true)}
        >
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
            <div className="grid grid-cols-5 gap-4 font-medium border-b pb-2">
              <div className="text-center">Tên người dùng</div>
              <div className="text-center">Email</div>
              <div className="text-center">Vai trò</div>
              <div className="text-center">SĐT</div>
              <div className="text-center">Địa chỉ</div>
              {/* <div>Trạng thái</div> */}
            </div>
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có người dùng nào.
              </div>
            ) : (
              users.map((user: any) => (
                <div key={user.userId} className="grid grid-cols-5 gap-4 py-2 border-b text-center">
                  <div className="text-center">{(user.firstName || "") + " " + (user.lastName || "")}</div>
                  <div className="text-center">{user.email || user.emailAddress}</div>
                  <div className="text-center">{user.role }</div>
                  <div className="text-center">{user.phone}</div>
                  <div className="text-center">{user.address}</div>
                  {/* <div>{user.active !== undefined ? (user.active ? "Đang hoạt động" : 
                  "Ngừng hoạt động") : "-"}</div> */}
                  {/* <div>{user.lastActive || "-"}</div> */}
                  {/* <div>Thêm nút thao tác nếu cần</div> */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#111113] p-8 rounded-2xl shadow-2xl w-full max-w-lg border-2 border-rose-400 relative text-white">
            <button
              type="button"
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white font-bold focus:outline-none"
              onClick={() => setShowAdd(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Thêm người dùng mới</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Họ</label>
                  <input className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" placeholder="Họ" value={newUser.firstName} onChange={e => setNewUser(u => ({ ...u, firstName: e.target.value }))} required />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Tên</label>
                  <input className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" placeholder="Tên" value={newUser.lastName} onChange={e => setNewUser(u => ({ ...u, lastName: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">SĐT</label>
                  <input className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" placeholder="SĐT" value={newUser.phone} onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Địa chỉ</label>
                  <input className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" placeholder="Địa chỉ" value={newUser.address} onChange={e => setNewUser(u => ({ ...u, address: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Vai trò</label>
                <select className="w-full border border-rose-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              {addError && <div className="text-red-500 text-sm text-center">{addError}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 border border-gray-200" onClick={() => setShowAdd(false)} disabled={addLoading}>Hủy</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 border border-rose-400 shadow-sm" disabled={addLoading}>{addLoading ? "Đang thêm..." : "Thêm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 