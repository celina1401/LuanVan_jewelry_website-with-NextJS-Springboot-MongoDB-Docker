"use client";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

//lịch sử giao dịch: đơn hàng hủy, không thành công và thành công

export default function HistoryPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    getToken().then(token => {
      fetch(`http://localhost:9003/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể tải lịch sử giao dịch.");
          setLoading(false);
        });
    });
  }, [user, getToken]);

  if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập để xem lịch sử giao dịch.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử giao dịch</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div>Chưa có giao dịch nào.</div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-base text-left text-gray-700 dark:text-gray-200 border rounded-lg overflow-hidden">
  <thead className="text-base text-white bg-slate-800 dark:bg-slate-800">
    <tr>
      <th className="px-6 py-4 font-medium">Mã đơn</th>
      <th className="px-6 py-4 font-medium">Ngày đặt</th>
      <th className="px-6 py-4 font-medium">Tổng tiền</th>
      <th className="px-6 py-4 font-medium">Trạng thái</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 text-base">
    {orders.map((order: any) => (
      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
        <td className="px-6 py-4">{Number(order.total || order.amount).toLocaleString()}₫</td>
        <td className="px-6 py-4">{order.status || order.paymentStatus}</td>
      </tr>
    ))}
  </tbody>
</table>

        </div>
      )}
    </div>
  );
} 