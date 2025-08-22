"use client";
import AddAddressForm, { Address } from "@/app/components/AddAddressForm";
import { Eye, Lock, Unlock, Trash2, CheckCircle, XCircle, RefreshCw, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

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
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: ""
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
  const [lockingId, setLockingId] = useState<string | null>(null);

  // ROLE FILTER
  const [roleFilter, setRoleFilter] = useState<string>("user");

  // order
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
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

  // Filter users based on selected role
  const filteredUsers = roleFilter === "all" 
    ? users 
    : users.filter(user => user.role === roleFilter);

  // Toggle user lock/unlock handler
  const handleToggleLock = async (userId: string, currentActive: boolean) => {
    const action = currentActive ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) return;
    
    setLockingId(userId);
    try {
      const response = await fetch(`http://localhost:9001/api/users/${userId}/toggle-lock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        // Cập nhật trạng thái trong danh sách
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.userId === userId 
              ? { ...user, active: !currentActive }
              : user
          )
        );
        toast.success("Cập nhật trạng thái người dùng thành công!", {
          description: `Đã ${currentActive ? 'khóa' : 'mở khóa'} tài khoản người dùng`
        });
      } else {
        alert(`Không thể ${action} người dùng. Vui lòng thử lại.`);
      }
    } catch (error) {
      console.error('Error toggling user lock:', error);
      alert(`Có lỗi xảy ra khi ${action} người dùng.`);
    } finally {
      setLockingId(null);
    }
  };

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
    
    // Validate required fields
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      setAddError("Vui lòng điền đầy đủ thông tin bắt buộc");
      setAddLoading(false);
      return;
    }

    // Validate phone number (must be exactly 10 digits if provided)
    if (newUser.phone && newUser.phone.length !== 10) {
      setAddError("Số điện thoại phải có đúng 10 chữ số");
      setAddLoading(false);
      return;
    }

    // Validate password fields
    if (!newUser.password || !newUser.confirmPassword) {
      setAddError("Vui lòng nhập mật khẩu");
      setAddLoading(false);
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setAddError("Mật khẩu xác nhận không khớp");
      setAddLoading(false);
      return;
    }
    
    try {
      // Tạo user qua Clerk API
      const clerkUserData = {
        emailAddress: [newUser.email],
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        publicMetadata: {
          role: newUser.role
        }
      };

      // Gọi Clerk API để tạo user
      const clerkResponse = await fetch('/api/clerk/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clerkUserData),
      });

      if (!clerkResponse.ok) {
        const clerkError = await clerkResponse.json();
        setAddError(`Lỗi tạo tài khoản Clerk: ${clerkError.message || 'Không thể tạo tài khoản'}`);
        setAddLoading(false);
        return;
      }

      const clerkUser = await clerkResponse.json();
      
      // Đồng bộ với backend
      const syncData = {
        userId: clerkUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phone: newUser.phone,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        provider: "clerk"
      };

      const syncResponse = await fetch("http://localhost:9001/api/users/sync-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      });

      if (!syncResponse.ok) {
        setAddError("Tạo tài khoản Clerk thành công nhưng đồng bộ backend thất bại");
      } else {
        setShowAdd(false);
        setNewUser(initialNewUser);
        loadUsers();
        toast.success("Tài khoản đã được tạo thành công!", {
          description: "Người dùng có thể đăng nhập ngay với thông tin đã cung cấp"
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
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
    
    // Validate phone number (must be exactly 10 digits if provided)
    if (editPhone && editPhone.length !== 10) {
      setError("Số điện thoại phải có đúng 10 chữ số");
      return;
    }
    
    // Check if there are any changes
    const hasChanges = 
      editPhone !== (selectedUser.phone || "") ||
      editPurchaseCount !== (selectedUser.purchaseCount || 0) ||
      JSON.stringify(editAddresses) !== JSON.stringify(selectedUser.addresses || []);
    
    if (!hasChanges) {
      toast.info("Không có thay đổi nào để cập nhật!", {
        description: "Thông tin người dùng không có sự thay đổi"
      });
      return;
    }
    
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
      
      // Close popup and show success toast
      setSelectedUser(null);
      toast.success("Cập nhật thông tin người dùng thành công!", {
        description: "Thông tin đã được lưu và cập nhật trong hệ thống"
      });
    } catch {
      setError("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const fetchOrders = async () => {
    if (!selectedUser) return;
    
    try {
      setOrdersLoading(true);
      const response = await fetch(`/api/orders?userId=${selectedUser.userId}`);
      if (response.ok) {
        const ordersData = await response.json();
        // Check if the response is an error object
        if (ordersData.error) {
          console.error('Orders API error:', ordersData.error);
          setOrders([]);
        } else if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.error("Unexpected orders data format:", ordersData);
          setOrders([]);
        }
      } else {
        console.error('Failed to fetch orders:', response.status);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedUser]);

  // Handle viewing order details
  const handleViewOrderDetail = async (order: any) => {
    try {
      // Fetch detailed order information using the Next.js API route
      const response = await fetch(`/api/orders?orderNumber=${order.orderNumber}`);
      if (response.ok) {
        const orderDetail = await response.json();
        // Check if the response is an error object
        if (orderDetail.error) {
          console.error('Order detail API error:', orderDetail.error);
          return;
        }
        setSelectedOrder(orderDetail);
        setShowOrderDetail(true);
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  return (
    <div className="w-full max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Quản lý người dùng</h1>
        <button
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors"
          onClick={() => setShowAdd(true)}
        >
          Thêm người dùng
        </button>
      </div>

      {/* Role Filter */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Lọc theo vai trò:</span>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        >
          <option value="all">Tất cả</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredUsers.length} người dùng
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-x-auto border border-border">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-rose-100/80 to-rose-200/80 dark:from-[#23232b] dark:to-[#18181b]">
              <th className="py-4 px-4 text-left text-gray-900 dark:text-white">Avatar</th>
              <th className="py-4 px-4 text-left text-gray-900 dark:text-white">Tên</th>
              <th className="py-4 px-4 text-left text-gray-900 dark:text-white">Email</th>
              <th className="py-4 px-4 text-left text-gray-900 dark:text-white">Vai trò</th>
              <th className="py-4 px-4 text-left text-gray-900 dark:text-white">SĐT</th>
              {/* <th className="py-2 px-4 text-left text-gray-900 dark:text-white">Hạng</th> */}
              <th className="py-4 px-4 text-center text-gray-900 dark:text-white">Trạng thái</th>
              <th className="py-4 px-4 text-gray-900 dark:text-white">Chi tiết</th>
              <th className="py-4 px-4 text-gray-900 dark:text-white">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted-foreground">Đang tải...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted-foreground">
                  {roleFilter === 'all' 
                    ? 'Không có người dùng nào trong hệ thống.'
                    : `Không có người dùng nào với vai trò ${roleFilter === 'user' ? 'User' : 'Admin'}.`
                  }
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
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
                    {/* <td className="py-2 px-4 text-foreground">{rank}</td> */}

                                         <td className="py-2 px-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                         {user.active ? (
                           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                             <CheckCircle className="w-4 h-4" />
                             <span className="text-xs font-medium">Đang hoạt động</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                             <XCircle className="w-4 h-4" />
                             <span className="text-xs font-medium">Đã khóa</span>
                           </div>
                         )}
                       </div>
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
                      <div className="flex justify-center gap-2">
                        <button
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            user.active 
                              ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" 
                              : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                          onClick={() => handleToggleLock(user.userId, user.active || false)}
                          disabled={lockingId === user.userId}
                          title={user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {lockingId === user.userId 
                            ? (
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            )
                            : user.active 
                              ? <Lock className="w-5 h-5" />
                              : <Unlock className="w-5 h-5" />
                          }
                        </button>
                        <button
                          className="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-500 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(user.userId)}
                          disabled={deletingId === user.userId}
                          title="Xóa người dùng"
                        >
                          {deletingId === user.userId 
                            ? (
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            )
                            : <Trash2 className="w-5 h-5" />
                          }
                        </button>
                      </div>
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
           <div className="bg-card text-foreground rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-rose-400 relative">
             <button
               className="absolute top-3 right-3 text-2xl text-muted-foreground hover:text-foreground"
               onClick={() => setShowAdd(false)}
               aria-label="Đóng"
               type="button"
             >
               ×
             </button>
             <h2 className="text-2xl font-bold mb-6 text-center">Thêm người dùng mới</h2>
             <form onSubmit={handleAddUser} className="space-y-6">
               {/* Basic Information */}
               <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Thông tin cơ bản</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">Họ *</label>
                     <input
                       className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                       placeholder="Nhập họ"
                       value={newUser.firstName}
                       onChange={e => setNewUser(u => ({ ...u, firstName: e.target.value }))}
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Tên *</label>
                     <input
                       className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                       placeholder="Nhập tên"
                       value={newUser.lastName}
                       onChange={e => setNewUser(u => ({ ...u, lastName: e.target.value }))}
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Email *</label>
                     <input
                       className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                       placeholder="example@email.com"
                       type="email"
                       value={newUser.email}
                       onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                     <input
                       className={`w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400 ${
                         newUser.phone && newUser.phone.length !== 10 ? 'border-red-500' : ''
                       }`}
                       placeholder="0123456789"
                       maxLength={10}
                       value={newUser.phone}
                       onChange={e => setNewUser(u => ({ ...u, phone: e.target.value.slice(0, 10) }))}
                     />
                     {newUser.phone && newUser.phone.length !== 10 && (
                       <p className="text-red-500 text-xs mt-1">Số điện thoại phải có đúng 10 chữ số</p>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                     <input
                       className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                       type="date"
                       value={newUser.dateOfBirth}
                       onChange={e => setNewUser(u => ({ ...u, dateOfBirth: e.target.value }))}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">Giới tính</label>
                     <select
                       className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                       value={newUser.gender}
                       onChange={e => setNewUser(u => ({ ...u, gender: e.target.value }))}
                     >
                       <option value="">Chọn giới tính</option>
                       <option value="male">Nam</option>
                       <option value="female">Nữ</option>
                       <option value="other">Khác</option>
                     </select>
                   </div>
                 </div>
               </div>



               {/* Authentication Settings */}
               <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Xác thực tài khoản</h3>
                 <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                     ✅ Tài khoản sẽ được tạo với xác thực Clerk, người dùng có thể đăng nhập ngay
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div>
                        <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
                        <input
                          type="password"
                          className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                          placeholder="Nhập mật khẩu"
                          value={newUser.password}
                          onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                        </p>
                      </div>
                     <div>
                       <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu *</label>
                       <input
                         type="password"
                         className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                         placeholder="Nhập lại mật khẩu"
                         value={newUser.confirmPassword}
                         onChange={e => setNewUser(u => ({ ...u, confirmPassword: e.target.value }))}
                         required
                       />
                     </div>
                   </div>
                 </div>
               </div>

               {/* Account Settings */}
               <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Cài đặt tài khoản</h3>
                 <div>
                   <label className="block text-sm font-medium mb-1">Vai trò *</label>
                   <select
                     className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-0 focus:border-rose-400"
                     value={newUser.role}
                     onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                     required
                   >
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                     {/* <option value="moderator">Moderator</option> */}
                   </select>
                 </div>
               </div>



               {addError && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{addError}</div>}
               
               <div className="flex justify-end gap-3 pt-4">
                 <button
                   type="button"
                   className="px-6 py-2 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 border border-border"
                   onClick={() => setShowAdd(false)}
                   disabled={addLoading}
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 border border-primary shadow-sm"
                   disabled={addLoading}
                 >
                   {addLoading ? "Đang thêm..." : "Thêm người dùng"}
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
                  maxLength={10}
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value.slice(0, 10))}
                  className={`ml-2 border border-border rounded-lg px-2 py-1 ${
                    editPhone && editPhone.length !== 10 ? 'border-red-500' : ''
                  }`}
                />
                {editPhone && editPhone.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1 ml-2">Số điện thoại phải có đúng 10 chữ số</p>
                )}
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

              {/* <li>
                <strong>Số lần mua:</strong>{" "}
                <input
                  type="number"
                  min={0}
                  value={editPurchaseCount}
                  onChange={e => setEditPurchaseCount(+e.target.value)}
                  className="ml-2 w-20 border border-border rounded-lg px-2 py-1"
                />
              </li> */}

              {/* <li>
                <strong>Hạng:</strong>{" "}
                <span className="font-medium">
                  {getRank(editPurchaseCount)}
                </span>
              </li> */}

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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lịch sử đơn hàng</h3>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Làm mới danh sách đơn hàng"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>
              
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang tải đơn hàng...
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">📦</div>
                  <div className="text-gray-500 font-medium">Chưa có đơn hàng nào</div>
                  <div className="text-sm text-gray-400 mt-1">Người dùng này chưa thực hiện đơn hàng nào</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-rose-500 text-lg">
                            {order.total?.toLocaleString()}₫
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.orderStatus === 'Đã giao' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            order.orderStatus === 'Chưa xử lý' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            order.orderStatus === 'Đã hủy' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>💳 Thanh toán: {order.paymentMethod === 'cod' ? 'Tiền mặt' : 'VNPAY'}</p>
                        <p>🚚 Giao hàng: {order.shippingStatus}</p>
                      </div>
                                             <button 
                         onClick={() => handleViewOrderDetail(order)}
                         className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
                       >
                         👁️ Xem chi tiết
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

             {/* Order Detail Popup */}
       {showOrderDetail && selectedOrder && (
         <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
           <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-xl relative">
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold" 
              onClick={() => setShowOrderDetail(false)}
            >
              ×
            </button>
                         <h2 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
             
             <div className="mb-6 space-y-2 text-base text-gray-700 dark:text-gray-200">
              <p><strong>Khách hàng:</strong> {selectedOrder.receiverName || '-'}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || '-'}</p>
              <p><strong>Trạng thái:</strong> {selectedOrder.orderStatus || '-'}</p>
              <p><strong>Trạng thái giao hàng:</strong> {selectedOrder.shippingStatus || '-'}</p>
              <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng' : selectedOrder.paymentMethod || '-'}</p>
              <p><strong>Trạng thái thanh toán:</strong>{" "}
                {selectedOrder.paymentStatus === "Lỗi thanh toán" || selectedOrder.paymentStatus === "Chưa xử lý"
                  ? <span className="text-red-500 font-semibold">Chưa thanh toán</span>
                  : selectedOrder.paymentStatus === "Đã thanh toán"
                    ? <span className="text-green-600 font-semibold">Đã thanh toán</span>
                    : selectedOrder.paymentStatus || "-"}
              </p>
            </div>
            
                         <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h3>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                 {selectedOrder.items?.map((item: { productName: string; productImage?: string; quantity: number; price: number; totalPrice?: number }, index: number) => (
                   <div key={index} className="flex items-center gap-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                     {item.productImage && (
                       <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
                     )}
                     <div className="flex-1">
                       <h4 className="font-semibold text-lg">{item.productName}</h4>
                       <p className="text-base text-gray-600 dark:text-gray-400">
                         Số lượng: {item.quantity} x {item.price.toLocaleString()}₫
                       </p>
                     </div>
                     <div className="text-right font-bold text-rose-500 text-lg">
                       {(item.totalPrice ?? item.price * item.quantity).toLocaleString()}₫
                     </div>
                   </div>
                 ))}
               </div>

                             <div className="mt-8 border-t pt-6 text-right space-y-3 text-base text-gray-700 dark:text-gray-300">
                 <div>
                   Giảm giá:{" "}
                   <span className="text-rose-500 font-semibold text-lg">
                     {Number(selectedOrder.discount || 0).toLocaleString()}₫
                   </span>
                 </div>

                 <div>
                   Phí vận chuyển:{" "}
                   {Number(selectedOrder.shippingFee || 0) === 0 ? (
                     <span className="text-emerald-500 font-semibold text-lg">Freeship</span>
                   ) : (
                     <span className="text-emerald-500 font-semibold text-lg">
                       {Number(selectedOrder.shippingFee).toLocaleString()}₫
                     </span>
                   )}
                 </div>

                 <div className="text-2xl font-bold text-rose-600">
                   Tổng cộng:{" "}
                   {(
                     Number(selectedOrder.total || 0) -
                     Number(selectedOrder.discount || 0) +
                     Number(selectedOrder.shippingFee || 0)
                   ).toLocaleString()}
                   ₫
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowOrderDetail(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
