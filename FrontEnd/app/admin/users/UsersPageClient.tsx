"use client";
import { useEffect, useState } from "react";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
  active?: boolean;
}

const initialNewUser = {
  firstName: "",
  lastName: "",
  email: "",
  role: "user",
  phone: "",
  address: "",
};

type NewUser = typeof initialNewUser;

export default function UsersPageClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [newUser, setNewUser] = useState<NewUser>(initialNewUser);

  // Fetch users from backend
  const loadUsers = () => {
    setLoading(true);
    fetch("http://localhost:9001/api/users/all")
      .then(res => res.json())
      .then((data: User[]) => setUsers(data))
      .catch(() => setError("Không thể tải danh sách người dùng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Delete user handler
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`http://localhost:9001/api/users/del_user/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Xóa người dùng thất bại!");
      } else {
        setUsers(users => users.filter(u => u.userId !== userId));
      }
    } catch {
      setError("Lỗi hệ thống khi xóa!");
    } finally {
      setDeletingId(null);
    }
  };

  // Add user handler
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
        setNewUser(initialNewUser);
        loadUsers();
      }
    } catch {
      setAddError("Lỗi hệ thống khi thêm!");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/80 transition"
          onClick={() => setShowAdd(true)}
        >
          Thêm người dùng
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-card rounded-lg shadow overflow-x-auto border border-border">
        <table className="min-w-full">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="py-3 px-4 text-left">Avatar</th>
              <th className="py-3 px-4 text-left">Tên</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Vai trò</th>
              <th className="py-3 px-4 text-left">SĐT</th>
              <th className="py-3 px-4 text-left">Địa chỉ</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">Đang tải...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">Không có người dùng nào.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr
                  key={user.userId}
                  className="border-b border-border hover:bg-muted/60 transition"
                >
                  <td className="py-2 px-4">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-lg">{user.firstName?.[0] || "?"}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 text-foreground">{user.firstName} {user.lastName}</td>
                  <td className="py-2 px-4 text-foreground">{user.email}</td>
                  <td className="py-2 px-4 text-foreground">{user.role}</td>
                  <td className="py-2 px-4 text-foreground">{user.phone || "-"}</td>
                  <td className="py-2 px-4 text-foreground">{user.address || "-"}</td>
                  <td className="py-2 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.active ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                      {user.active ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-600 dark:text-red-400 hover:underline mr-2"
                    >
                      {user.active ? "Khóa" : "Mở"}
                    </button>
                    <button
                      className="text-gray-500 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400"
                      onClick={() => handleDelete(user.userId)}
                      disabled={deletingId === user.userId}
                    >
                      {deletingId === user.userId ? "Đang xóa..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card text-foreground rounded-2xl shadow-2xl p-8 w-full max-w-lg border-2 border-rose-400 relative">
            <button
              className="absolute top-3 right-3 text-2xl text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdd(false)}
              aria-label="Đóng"
              type="button"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Thêm người dùng mới</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="flex gap-4">
                <input
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                  placeholder="Họ"
                  value={newUser.firstName}
                  onChange={e => setNewUser(u => ({ ...u, firstName: e.target.value }))}
                  required
                />
                <input
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                  placeholder="Tên"
                  value={newUser.lastName}
                  onChange={e => setNewUser(u => ({ ...u, lastName: e.target.value }))}
                  required
                />
              </div>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                required
              />
              <div className="flex gap-4">
                <input
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                  placeholder="SĐT"
                  value={newUser.phone}
                  onChange={e => setNewUser(u => ({ ...u, phone: e.target.value }))}
                />
                <input
                  className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                  placeholder="Địa chỉ"
                  value={newUser.address}
                  onChange={e => setNewUser(u => ({ ...u, address: e.target.value }))}
                />
              </div>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                value={newUser.role}
                onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {addError && <div className="text-red-500 text-sm text-center">{addError}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 border border-border"
                  onClick={() => setShowAdd(false)}
                  disabled={addLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 border border-primary shadow-sm"
                  disabled={addLoading}
                >
                  {addLoading ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
