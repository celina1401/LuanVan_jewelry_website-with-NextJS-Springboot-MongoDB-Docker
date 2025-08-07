'use client';

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VietMapAddressPicker from "@/components/VietMapAddressPicker";
import React, { useRef } from "react";

// Định nghĩa kiểu Address
export type Address = {
  receiverName: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
};

// Thêm form nhập địa chỉ mới
function AddAddressForm({ onAdd, onCancel, showCancel }: { onAdd: (addr: Address) => void, onCancel?: () => void, showCancel?: boolean }) {
  const [receiverName, setReceiverName] = useState("");
  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!receiverName || !street || !ward || !district || !province) return;
    onAdd({ receiverName, street, ward, district, province, isDefault });
    setReceiverName(""); setStreet(""); setWard(""); setDistrict(""); setProvince(""); setIsDefault(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-white">Tên người nhận</label>
        <input
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          value={receiverName}
          onChange={e => setReceiverName(e.target.value)}
          placeholder="Nhập tên người nhận"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-white">Địa chỉ (số nhà, đường)</label>
        <input
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Nhập địa chỉ (số nhà, đường)"
          required
        />
      </div>
      <VietMapAddressPicker
        onChange={({ province, ward }) => {
          setProvince(province?.name_with_type || "");
          setDistrict(ward?.path?.split(", ")[1] || "");
          setWard(ward?.name_with_type || "");
        }}
      />
      <label className="flex items-center gap-2 text-gray-900 dark:text-white mt-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
          className="accent-rose-500"
        />
        Địa chỉ mặc định
      </label>
      <div className="flex gap-3 mt-2">
        {showCancel && (
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-400 bg-transparent text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={onCancel}
          >
            Hủy
          </button>
        )}
        <button
          type="button"
          className="flex-1 px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow transition"
          onClick={handleAdd}
        >
          Thêm địa chỉ
        </button>
      </div>
    </div>
  );
}

function getAvatarSrc(avatarUrl?: string, clerkImageUrl?: string) {
  if (clerkImageUrl) return clerkImageUrl;
  if (avatarUrl && avatarUrl.startsWith("/uploads/")) {
    return `http://localhost:9001${avatarUrl}`;
  }
  if (avatarUrl) return avatarUrl;
  return "/default-avatar.png";
}

function AvatarUpload({ userId, avatarUrl, clerkImageUrl, onUploaded }: { userId: string, avatarUrl?: string, clerkImageUrl?: string, onUploaded?: (url: string) => void }) {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setPreview(undefined);
  }, [userId, avatarUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = await getToken();
      const res = await fetch(`http://localhost:9001/api/users/${userId}/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPreview(data.avatarUrl ? `http://localhost:9001${data.avatarUrl}` : undefined);
        if (onUploaded) onUploaded(data.avatarUrl || "");
        // Upload trực tiếp lên Clerk profile
        if (user) {
          await user.setProfileImage({ file });
          await user.reload(); // Đồng bộ avatar Clerk ngay lập tức
        }
        alert("Cập nhật ảnh đại diện thành công!");
      } else {
        const err = await res.text();
        alert("Upload thất bại! " + err);
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi upload avatar!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative group">
        <img
          src={preview || getAvatarSrc(avatarUrl, clerkImageUrl)}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border border-zinc-700 shadow"
        />
        <button
          type="button"
          className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow group-hover:opacity-100 opacity-80 border border-gray-300 hover:bg-rose-100 transition"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Chỉnh sửa ảnh đại diện"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-rose-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.5 18.79l-4 1 1-4 12.362-12.303z" />
          </svg>
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      {loading && <span className="text-sm text-gray-500 mt-2">Đang tải lên...</span>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]); // Danh sách địa chỉ
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteClerkConfirm, setShowDeleteClerkConfirm] = useState(false);
  const [deleteClerkLoading, setDeleteClerkLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ✅ Đồng bộ và load user từ backend sau khi đăng nhập
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const token = await getToken();

        // 🟢 Lấy thông tin đầy đủ từ backend
        const res = await fetch(`http://localhost:9001/api/users/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || "");
          setPhone(data.phone || "");
          setAddresses(data.addresses || []);
          setAvatarUrl(data.avatarUrl || data.imageUrl || undefined);
          if (!data.phone || !data.addresses || data.addresses.length === 0) {
            setShowModal(true);
            setForceUpdate(true);
          } else {
            setForceUpdate(false);
          }
        } else {
          console.warn("Không lấy được thông tin người dùng từ backend.");
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ dữ liệu:", err);
      }
    };

    fetchUserData();
  }, [user, getToken]);

  // Fetch user orders
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

  useEffect(() => {
    if (addresses.length === 0) setShowAddForm(true);
    else setShowAddForm(false);
  }, [addresses]);

  // ✅ Gửi yêu cầu cập nhật số điện thoại / địa chỉ
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:9001/api/users/update_user/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, addresses }),
      });

      if (res.ok) {
        const data = await res.json();
        setPhone(data.phone || "");
        setAddresses(data.addresses || []);
        setMessage("✅ Cập nhật thành công!");
        setShowModal(false);
        if (data.phone && data.addresses && data.addresses.length > 0) setForceUpdate(false);
      } else {
        const data = await res.json();
        setMessage(data.message || "❌ Cập nhật thất bại!");
      }
    } catch (err) {
      setMessage("❌ Có lỗi xảy ra khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa tài khoản vĩnh viễn: Clerk + CSDL
  const handlePermanentDelete = async () => {
    if (!user) return;
    setDeleteClerkLoading(true);
    setMessage("");
    try {
      const token = await getToken();
      // 1. Xóa Clerk
      const resClerk = await fetch(`/api/users/${user.id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resClerk.ok) {
        const data = await resClerk.json();
        setMessage(data.error || "❌ Xóa tài khoản Clerk thất bại!");
        setDeleteClerkLoading(false);
        return;
      }
      // 2. Xóa user trong CSDL
      const resDb = await fetch(`http://localhost:9001/api/users/del_user/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resDb.ok) {
        const data = await resDb.json();
        setMessage(data.message || "❌ Xóa tài khoản trong CSDL thất bại!");
        setDeleteClerkLoading(false);
        return;
      }
      setMessage("✅ Đã xóa tài khoản vĩnh viễn!");
      setTimeout(async () => {
        await signOut();
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setMessage("❌ Có lỗi xảy ra khi xóa tài khoản!");
    } finally {
      setDeleteClerkLoading(false);
      setShowDeleteClerkConfirm(false);
    }
  };

  const handleAddAddress = (newAddress: Address) => {
    let updatedAddresses = addresses;
    if (newAddress.isDefault) {
      updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }
    setAddresses([...updatedAddresses, newAddress]);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 border border-rose-300 shadow-xl bg-background">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-xl font-bold mb-2">Thông tin người dùng</CardTitle>
          <CardDescription className="text-sm">Chi tiết về người dùng đã xác thực</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center w-full">
          {user ? (
            <div className="space-y-4 text-base w-full text-left">
              {/* Avatar và nút sửa avatar */}
              <AvatarUpload userId={user?.id} avatarUrl={avatarUrl} clerkImageUrl={user?.imageUrl} onUploaded={setAvatarUrl} />
              <p><b>Mã người dùng:</b> {user.id}</p>
              <p><b>Tên đăng nhập:</b> {username || user.username}</p>
              <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>
              <p><b>Vai trò:</b> {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : "user"}</p>
              <p><b>Số điện thoại:</b> {phone || "Chưa cập nhật"}</p>
              <p><b>Địa chỉ:</b></p>
              {addresses.length === 0 ? (
                <span>Chưa cập nhật</span>
              ) : (
                <ul className="list-disc ml-6">
                  {addresses.map((addr, idx) => (
                    <li key={idx}>
                      {addr.receiverName} - {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                      {addr.isDefault && <span className="ml-2 text-green-600 font-semibold">(Mặc định)</span>}
                    </li>
                  ))}
                </ul>
              )}

              {/* Hai nút nằm cùng một hàng */}
              <div className="flex flex-row gap-4 w-full justify-center mt-4">
                <button
                  className="flex-1 bg-gray-100 text-rose-500 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowModal(true)}
                >
                  Cập nhật
                </button>
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 border border-red-700 transition-colors"
                  onClick={() => { setShowDeleteClerkConfirm(true); setMessage(""); }}
                  disabled={deleteClerkLoading}
                >
                  {deleteClerkLoading ? "Đang xóa..." : "Xóa tài khoản vĩnh viễn"}
                </button>
              </div>

              {/* Orders Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h3>
                {ordersLoading ? (
                  <div className="text-center py-4">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Chưa có đơn hàng nào</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-black">
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
                          onClick={() => router.push(`/dashboard/orders/${order.orderNumber}`)}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal cập nhật */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-full max-w-xl mx-auto bg-background p-8 rounded-xl shadow-2xl border border-rose-300 max-h-[90vh] overflow-y-auto card-scrollbar">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-2">Cập nhật hồ sơ</h2>
                      <p className="text-sm text-zinc-400">Thay đổi số điện thoại và địa chỉ của bạn.</p>
                    </div>
                    <form onSubmit={handleUpdate} className="space-y-4 text-left">
                      <div>
                        <label className="block font-medium mb-1 text-gray-900 dark:text-white">Số điện thoại</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Danh sách địa chỉ</label>
                        {addresses.length === 0 && <div className="text-gray-500">Chưa có địa chỉ nào</div>}
                        <ul className="mb-2">
                          {addresses.map((addr, idx) => (
                            <li key={idx} className="mb-1 flex items-center gap-2">
                              <span>{addr.receiverName} - {addr.street}, {addr.ward}, {addr.district}, {addr.province}</span>
                              {addr.isDefault && <span className="ml-2 text-green-600 font-semibold">(Mặc định)</span>}
                              <button type="button" className="ml-2 text-red-500 hover:underline" onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))}>Xóa</button>
                            </li>
                          ))}
                        </ul>
                        {addresses.length > 0 && !showAddForm && (
                          <button
                            type="button"
                            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold mb-2"
                            onClick={() => setShowAddForm(true)}
                          >
                            <span className="text-2xl">+</span> Thêm địa chỉ
                          </button>
                        )}
                        {showAddForm && (
                          <AddAddressForm
                            onAdd={addr => { handleAddAddress(addr); setShowAddForm(false); }}
                            onCancel={() => setShowAddForm(false)}
                            showCancel={addresses.length > 0}
                          />
                        )}
                      </div>
                      {message && <div className="text-sm text-rose-600 text-center">{message}</div>}
                      <div className="flex justify-end gap-2 mt-4">
                        {!forceUpdate && (
                          <button
                            type="button"
                            className="bg-white text-gray-500 font-semibold px-4 py-2 rounded border border-gray-200 hover:bg-gray-100"
                            onClick={() => setShowModal(false)}
                            disabled={loading}
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          type="submit"
                          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 disabled:opacity-60"
                          disabled={loading}
                        >
                          {loading ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal xác nhận xóa tài khoản */}
              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                    <DialogDescription>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <button
                      type="button"
                      className="bg-gray-200 px-4 py-2 rounded mr-2"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteLoading}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 disabled:opacity-60"
                      onClick={() => setShowDeleteClerkConfirm(true)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
                    </button>
                  </DialogFooter>
                  {message && <div className="text-sm text-rose-600 text-center mt-2">{message}</div>}
                </DialogContent>
              </Dialog>

              {/* Modal xác nhận xóa tài khoản vĩnh viễn */}
              <Dialog open={showDeleteClerkConfirm} onOpenChange={setShowDeleteClerkConfirm}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận xóa tài khoản vĩnh viễn</DialogTitle>
                    <DialogDescription>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <button
                      type="button"
                      className="bg-white text-gray-700 font-semibold px-4 py-2 rounded border border-gray-200 hover:bg-gray-100 mr-2"
                      onClick={() => setShowDeleteClerkConfirm(false)}
                      disabled={deleteClerkLoading}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60"
                      onClick={handlePermanentDelete}
                      disabled={deleteClerkLoading}
                    >
                      {deleteClerkLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
                    </button>
                  </DialogFooter>
                  {message && <div className="text-sm text-red-600 text-center mt-2">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <p>Đang tải dữ liệu người dùng...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

