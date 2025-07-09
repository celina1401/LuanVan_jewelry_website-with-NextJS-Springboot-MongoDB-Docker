'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 border border-rose-300 shadow-xl bg-background">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-xl font-bold mb-2">Thông tin người dùng</CardTitle>
          <CardDescription className="text-sm">Chi tiết về người dùng đã xác thực</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center w-full">
          {user ? (
            <div className="space-y-4 text-base text-center w-full">
              <p><b>Mã người dùng:</b> {user.id}</p>
              <p><b>Tên đăng nhập:</b> {username || user.username}</p>
              <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>
              <p><b>Vai trò:</b> {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : "user"}</p>
              <p><b>Số điện thoại:</b> {phone || "Chưa cập nhật"}</p>
              <p><b>Địa chỉ:</b> {address || "Chưa cập nhật"}</p>

              <button
                className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600"
                onClick={() => setShowModal(true)}
              >
                Cập nhật
              </button>

              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="User Avatar"
                  className="w-28 h-28 rounded-full mt-6 border-2 border-rose-300 mx-auto shadow object-cover"
                />
              )}

              {/* Modal cập nhật */}
              <Dialog open={showModal} onOpenChange={setShowModal}>
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
                      <button
                        type="button"
                        className="bg-gray-200 px-4 py-2 rounded mr-2"
                        onClick={() => setShowModal(false)}
                        disabled={loading}
                      >
                        Hủy
                      </button>
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
            </div>
          ) : (
            <p>Đang tải dữ liệu người dùng...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
