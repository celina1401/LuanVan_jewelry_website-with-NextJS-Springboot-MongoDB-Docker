"use client";
import AddAddressForm, { Address } from "@/app/components/AddAddressForm";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";

// CHUA HIEN THI DUOC LICH SU DON HANG
interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  addresses?: Address[];
  imageUrl?: string;
  active?: boolean;
  purchaseCount?: number;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;

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

const getRank = (count: number = 0): string => {
  if (count >= 20) return 'Kim cương';
  if (count >= 15) return 'Vàng';
  if (count >= 10) return 'Bạc';
  if (count >= 5) return 'Đồng';
  return 'Thành viên';
};

export default function UsersPageClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [newUser, setNewUser] = useState<NewUser>(initialNewUser);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAddresses, setNewAddresses] = useState<Address[]>([]);

  // EDIT
  const [editPhone, setEditPhone] = useState("");
  const [editAddresses, setEditAddresses] = useState<Address[]>([]);
  const [editPurchaseCount, setEditPurchaseCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

// TOAST
const [openToast, setOpenToast] = useState(false);

// order
const [orders, setOrders] = useState<any[]>([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const router = useRouter();

const { user } = useUser();


  const defaultAddr = selectedUser?.addresses?.find(a => a.isDefault);
  const addressValue = defaultAddr
    ? `${defaultAddr.receiverName} — ${defaultAddr.street}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`
    : '';

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
  // Show details popup
  const handleSelectUser = async (user: User) => {
    try {
      const res = await fetch(`http://localhost:9001/api/users/users/${user.userId}`);
      if (!res.ok) throw new Error("Không lấy được chi tiết");
      const data: User = await res.json();
      setSelectedUser(data);
    } catch {
      setError("Lỗi khi tải chi tiết người dùng");
    }
  };

  useEffect(() => {
    if (selectedUser) {
      setEditPhone(selectedUser.phone || "");
      setEditAddresses(selectedUser.addresses || []);
      setEditPurchaseCount(selectedUser.purchaseCount || 0);
    }
  }, [selectedUser]);

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const payload = {
        phone: editPhone,
        addresses: editAddresses,
        purchaseCount: editPurchaseCount
      };
      const res = await fetch(
        `http://localhost:9001/api/users/update_user/${selectedUser.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const updated: User = await res.json();
      setSelectedUser(updated);
      loadUsers();
      setOpenToast(true);
    } catch {
      setError("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setOrdersLoading(true);
        const response = await fetch(`/api/orders?userId=${user.id}`);
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);
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
            <tr className="bg-gradient-to-r from-rose-100/80 to-rose-200/80 dark:from-[#23232b] dark:to-[#18181b]">
              <th className="py-4 px-4 text-left">Avatar</th>
              <th className="py-4 px-4 text-left">Tên</th>
              <th className="py-4 px-4 text-left">Email</th>
              <th className="py-4 px-4 text-left">Vai trò</th>
              <th className="py-4 px-4 text-left">SĐT</th>
              <th className="py-2 px-4 text-left">Hạng</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-4">Chi tiết</th>
              <th className="py-4 px-4">Hành động</th>
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
              users.map(user => {
                const count = user.purchaseCount || 0;
                const rank = getRank(count);
                return (
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
                    <td className="py-2 px-4 text-foreground">{rank}</td>

                    <td className="py-2 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.active ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                        {user.active ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </td>

                    <td className="py-2 px-4 text-center">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>

                    <td className="py-2 px-4 text-center">
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
                )
              })
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
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="
         border-4 border-rose-400
         bg-white dark:bg-[#18181b] dark:text-foreground
         rounded-lg shadow-lg p-8
         w-full max-w-3xl lg:max-w-3xl
         max-h-[100vh] overflow-y-auto
         relative
       "
          >
            {/* nút đóng */}
            <button
              className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedUser(null)}
            >×</button>

            {/* avatar + header */}
            <div className="text-center mb-4">
              {selectedUser.imageUrl ? (
                <img
                  src={selectedUser.imageUrl}
                  alt="avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-muted-foreground">
                  {selectedUser.firstName[0]}
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-base text-muted-foreground mt-1">
                {selectedUser.email}
              </p>
            </div>

            {/* form edit */}
            <ul className="space-y-3 text-base">
              <li>
                <strong>Mã người dùng:</strong>{" "}
                <span className="font-medium">{selectedUser.userId}</span>
              </li>

              <li>
                <strong>SĐT:</strong>{" "}
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="ml-2 border border-border rounded-lg px-2 py-1"
                />
              </li>

              <li>
                <strong>Địa chỉ hiện tại:</strong>{" "}
                <button
                  className="ml-2 text-sm text-red-600 hover:underline hover:text-red-700 transition"
                  onClick={() => setShowAddAddressForm(true)}
                >
                  + Thêm địa chỉ mới
                </button>
                {showAddAddressForm && (
                  <li>
                    <div className="mt-2">
                      <AddAddressForm
                        onAdd={addr => {
                          setEditAddresses(prev => [...prev, addr]);
                          setShowAddAddressForm(false);
                        }}
                        showCancel={true}
                        onCancel={() => setShowAddAddressForm(false)}
                      />
                    </div>
                  </li>
                )}

                <span className="font-medium">
                </span>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {editAddresses.map((a, i) => (
                    <li key={i}>
                      {a.receiverName} — {a.street}, {a.ward}, {a.district}, {a.province}{" "}
                      {a.isDefault ? "(Mặc định)" : ""}
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <strong>Số lần mua:</strong>{" "}
                <input
                  type="number"
                  min={0}
                  value={editPurchaseCount}
                  onChange={e => setEditPurchaseCount(+e.target.value)}
                  className="ml-2 w-20 border border-border rounded-lg px-2 py-1"
                />
              </li>

              <li>
                <strong>Hạng:</strong>{" "}
                <span className="font-medium">
                  {getRank(editPurchaseCount)}
                </span>
              </li>

              <li>
                <strong>Vai trò:</strong>{" "}
                <span className="font-medium">{selectedUser.role}</span>
              </li>

              <li>
                <strong>Ngày tạo:</strong>{" "}
                <span className="font-medium">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleString()
                    : "-"}
                </span>
              </li>

              <li>
                <strong>Ngày cập nhật:</strong>{" "}
                <span className="font-medium">
                  {selectedUser.updatedAt
                    ? new Date(selectedUser.updatedAt).toLocaleString()
                    : "-"}
                </span>
              </li>
            </ul>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h3>
                {ordersLoading ? (
                  <div className="text-center py-4">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Chưa có đơn hàng nào</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-rose-500">
                              {order.total?.toLocaleString()}₫
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.orderStatus === 'Đã giao' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'Chưa xử lý' ? 'bg-yellow-100 text-yellow-800' :
                              order.orderStatus === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Thanh toán: {order.paymentMethod === 'cod' ? 'Tiền mặt' : 'VNPAY'}</p>
                          <p>Giao hàng: {order.shippingStatus}</p>
                        </div>
                        <button 
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* nút cập nhật */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleUpdateUser}
                disabled={updating}
                className={`
    px-5 py-2 rounded-lg font-medium transition
    bg-primary text-white hover:bg-primary/90
    dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
    ${updating ? 'opacity-50 cursor-wait' : ''}
    
  `}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                
              </button>
              <button onClick={() => setSelectedUser(null)} className="px-5 py-2 rounded border border-border bg-muted text-foreground hover:bg-muted/80 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

<Toast
  open={openToast}
  onOpenChange={setOpenToast}
  variant="success"
  className="flex-col items-start space-y-1 p-4"
>
  <ToastTitle>Cập nhật thành công</ToastTitle>
  <ToastDescription>
    Thông tin đã được lưu vào cơ sở dữ liệu.
  </ToastDescription>
  <ToastClose />
</Toast>

    </div>

  );
}
