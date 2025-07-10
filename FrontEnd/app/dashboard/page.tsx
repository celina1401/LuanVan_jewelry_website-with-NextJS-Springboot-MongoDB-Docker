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

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteClerkConfirm, setShowDeleteClerkConfirm] = useState(false);
  const [deleteClerkLoading, setDeleteClerkLoading] = useState(false);

  // ✅ Đồng bộ và load user từ backend sau khi đăng nhập
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const token = await getToken();

        // // 🟢 Sync user về backend nếu chưa có
        // await fetch("http://localhost:9001/api/users/sync_user", {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     userId: user.id,
        //     username: user.username,
        //     email: user.emailAddresses[0]?.emailAddress,
        //   }),
        // });

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
          setAddress(data.address || "");
          if (!data.phone || !data.address) {
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
        body: JSON.stringify({ phone, address }),
      });

      if (res.ok) {
        const data = await res.json();
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setMessage("✅ Cập nhật thành công!");
        setShowModal(false);
        if (data.phone && data.address) setForceUpdate(false);
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
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="User Avatar"
                  className="w-28 h-28 rounded-full mb-6 border-2 border-rose-300 mx-auto shadow object-cover"
                />
              )}
              <p><b>Mã người dùng:</b> {user.id}</p>
              <p><b>Tên đăng nhập:</b> {username || user.username}</p>
              <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>
              <p><b>Vai trò:</b> {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : "user"}</p>
              <p><b>Số điện thoại:</b> {phone || "Chưa cập nhật"}</p>
              <p><b>Địa chỉ:</b> {address || "Chưa cập nhật"}</p>

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

              {/* Modal cập nhật */}
              <Dialog open={showModal} onOpenChange={forceUpdate ? () => {} : setShowModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cập nhật hồ sơ</DialogTitle>
                    <DialogDescription>Thay đổi số điện thoại và địa chỉ của bạn.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdate} className="space-y-4 text-left">
                    <div>
                      <label className="block font-medium mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Địa chỉ</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ"
                        required
                      />
                    </div>
                    {message && <div className="text-sm text-rose-600 text-center">{message}</div>}
                    <DialogFooter>
                      {!forceUpdate && (
                        <button
                          type="button"
                          className="bg-white text-gray-500 font-semibold px-4 py-2 rounded border border-gray-200 hover:bg-gray-100 mr-2"
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
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

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
