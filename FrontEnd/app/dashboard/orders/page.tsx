'use client';
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function OrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`http://localhost:9003/api/orders?userId=${user.id}`);
        const data = await res.json();
        
        // Check if the response is an error object
        if (data.error) {
          setError(data.error);
          setOrders([]);
        } else if (Array.isArray(data)) {
          // Double-check: lọc lại đơn hàng theo userId để đảm bảo an toàn
          const filteredOrders = data.filter(order => {
            const orderUserId = order.userId || order.user_id;
            const matches = orderUserId === user.id;
            return matches;
          });
          
          // console.log('✅ Filtered orders:', filteredOrders);
          setOrders(filteredOrders);
        } else {
          console.error("Unexpected data format:", data);
          setError("Unexpected data format received from server");
          setOrders([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng");
        setOrders([]);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
      </div>
      <Card>
        <div className="rounded-lg border bg-white dark:bg-[#18181b]">
          <div className="grid grid-cols-5 gap-4 font-medium border-b p-4">
            <div>Mã đơn</div>
            <div>Ngày đặt</div>
            <div>Tổng tiền</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải đơn hàng...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="font-medium">Lỗi khi tải đơn hàng</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Bạn chưa có đơn hàng nào.
              {user && (
                <div className="mt-2 text-xs text-gray-500">
                  User ID: {user.id}
                </div>
              )}
            </div>
          ) : (
            orders.map(order => {
              const orderUserId = order.userId || order.user_id;
              const isCurrentUser = orderUserId === user?.id;
              
              return (
                <div key={order.id || order.orderNumber} className={`grid grid-cols-5 gap-4 items-center border-b p-4 ${!isCurrentUser ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <div className="truncate break-all min-w-[120px]">
                    #{order.orderNumber}
                    {!isCurrentUser && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Wrong User: {orderUserId}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  </div>
                  <div>{order.total ? order.total.toLocaleString() : "0"}₫</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusInfo(order.orderStatus || order.status || "Chưa xử lý").bg}`}
                    >
                      {getStatusInfo(order.orderStatus || order.status || "Chưa xử lý").icon}
                      {getStatusInfo(order.orderStatus || order.status || "Chưa xử lý").label}
                    </span>
                  </div>
                  <div>
                    <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    
    </>
  );
}
