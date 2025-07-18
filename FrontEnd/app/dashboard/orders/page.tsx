'use client';
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

// Dữ liệu mẫu đơn hàng
const mockOrders = [
  {
    id: "ORD001",
    date: "2024-06-01",
    total: 2500000,
    status: "Đang xử lý",
  },
  {
    id: "ORD002",
    date: "2024-06-03",
    total: 1500000,
    status: "Đã giao",
  },
  {
    id: "ORD003",
    date: "2024-06-05",
    total: 3200000,
    status: "Đã hủy",
  },
];

// Hàm helper cho trạng thái
function getStatusInfo(status: string) {
  switch (status) {
    case "Đang xử lý":
      return { color: "secondary", icon: <Clock className="w-4 h-4 mr-1 text-yellow-500" />, label: "Đang xử lý" };
    case "Đã giao":
      return { color: "success", icon: <CheckCircle className="w-4 h-4 mr-1 text-white" />, label: "Đã giao" };
    case "Đã hủy":
      return { color: "destructive", icon: <XCircle className="w-4 h-4 mr-1 text-white stroke-2" />, label: "Đã hủy" };
    default:
      return { color: "outline", icon: <Clock className="w-4 h-4 mr-1" />, label: status };
  }
}

export default function OrdersPage() {
  const [orders] = useState(mockOrders);
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
      <Card>
        <div className="rounded-lg border bg-white dark:bg-[#18181b]">
          <div className="grid grid-cols-5 gap-4 font-medium border-b p-4">
            <div>Mã đơn</div>
            <div>Ngày đặt</div>
            <div>Tổng tiền</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="grid grid-cols-5 gap-4 items-center border-b p-4">
                <div>{order.id}</div>
                <div>{order.date}</div>
                <div>{order.total.toLocaleString()}₫</div>
                <div>
                  <Badge variant={getStatusInfo(order.status).color as any} className="flex items-center gap-1 px-2 py-1 text-sm">
                    {getStatusInfo(order.status).icon}
                    {getStatusInfo(order.status).label}
                  </Badge>
                </div>
                <div>
                  <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
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