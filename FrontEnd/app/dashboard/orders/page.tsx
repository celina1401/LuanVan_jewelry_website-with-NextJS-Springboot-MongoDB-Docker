'use client';
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Chưa xử lý":
        return {
          bg: "bg-gray-100 text-gray-800",
          icon: <Clock className="w-4 h-4 mr-1 text-gray-700" />,
          label: "Chưa xử lý",
        };
      case "Đã nhận đơn":
        return {
          bg: "bg-blue-100 text-blue-800",
          icon: <Clock className="w-4 h-4 mr-1 text-blue-700" />,
          label: "Đã nhận đơn",
        };
      case "Đang đóng gói":
        return {
          bg: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4 mr-1 text-yellow-700" />,
          label: "Đang đóng gói",
        };
      case "Chờ giao hàng":
        return {
          bg: "bg-green-100 text-green-800",
          icon: <Clock className="w-4 h-4 mr-1 text-green-700" />,
          label: "Chờ giao hàng",
        };
      case "Đã giao":
        return {
          bg: "bg-emerald-100 text-emerald-800",
          icon: <CheckCircle className="w-4 h-4 mr-1 text-emerald-700" />,
          label: "Đã giao",
        };
      case "Đã hủy":
        return {
          bg: "bg-red-500 text-white",
          icon: <XCircle className="w-4 h-4 mr-1 text-white" />,
          label: "Đã hủy",
        };

      default:
        return {
          bg: "bg-gray-100 text-gray-700",
          icon: <Clock className="w-4 h-4 mr-1 text-gray-500" />,
          label: status,
        };
    }
  };




  return (
    <>
      <h1 className="text-3xl text-gray-900 dark:text-white font-bold mb-8">Đơn hàng của tôi</h1>
      <Card>
        <div className="rounded-lg border bg-white dark:bg-black">
          <div className="grid grid-cols-5 gap-4 font-medium border-b p-4">
            <div>Mã đơn</div>
            <div>Ngày đặt</div>
            <div>Tổng tiền</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Bạn chưa có đơn hàng nào.</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="grid grid-cols-5 gap-4 items-center border-b p-4">
                <div className="truncate break-all min-w-[120px]">#{order.orderNumber}</div>
                <div className="whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</div>
                <div>{order.total.toLocaleString()}₫</div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusInfo(order.orderStatus).bg}`}
                  >
                    {getStatusInfo(order.orderStatus).icon}
                    {getStatusInfo(order.orderStatus).label}
                  </span>
                </div>
                <div>
                  <Link href={`/dashboard/orders/${order.orderNumber}`} className="text-blue-600 hover:underline">
                    Xem chi tiết
                  </Link>
                </div>
              </div>

            ))
          )}
        </div>
      </Card>
    </>
  );
}
