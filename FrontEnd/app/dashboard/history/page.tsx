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
      fetch(`http://localhost:9002/api/orders/user/${user.id}`, {
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
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2">Mã đơn</th>
                <th className="px-4 py-2">Ngày</th>
                <th className="px-4 py-2">Tổng tiền</th>
                <th className="px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2 text-center">{order.id}</td>
                  <td className="px-4 py-2 text-center">{order.date || order.createdAt}</td>
                  <td className="px-4 py-2 text-center">{order.total || order.amount}</td>
                  <td className="px-4 py-2 text-center">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 