"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Truck } from "lucide-react";

// Dữ liệu mẫu đơn hàng
const mockOrders = [
  {
    id: "ORD001",
    date: "2024-06-01",
    total: 2500000,
    status: "Đang xử lý",
    items: [
      { name: "Nhẫn vàng 18K", qty: 1, price: 1500000 },
      { name: "Dây chuyền bạc", qty: 2, price: 500000 },
    ],
  },
  {
    id: "ORD002",
    date: "2024-06-03",
    total: 1500000,
    status: "Đã giao",
    items: [
      { name: "Bông tai ngọc trai", qty: 1, price: 1500000 },
    ],
  },
  {
    id: "ORD003",
    date: "2024-06-05",
    total: 3200000,
    status: "Đã hủy",
    items: [
      { name: "Lắc tay vàng", qty: 2, price: 1600000 },
    ],
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
      return { color: "destructive", icon: <XCircle className="w-4 h-4 mr-1 text-red-500" />, label: "Đã hủy" };
    case "Đang vận chuyển":
      return { color: "outline", icon: <Truck className="w-4 h-4 mr-1 text-blue-500" />, label: "Đang vận chuyển" };
    default:
      return { color: "outline", icon: <Clock className="w-4 h-4 mr-1" />, label: status };
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <Card className="max-w-xl w-full p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
          <Link href="/dashboard/orders" className="text-blue-600 hover:underline">Quay lại danh sách đơn hàng</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-2xl w-full shadow-xl border-2 border-primary/30">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Chi tiết đơn hàng
            <span className="ml-2 px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono text-lg border border-primary/20">{order.id}</span>
          </CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-muted-foreground text-sm">Ngày đặt: {order.date}</span>
            <Badge 
              variant={getStatusInfo(order.status).color as any}
              className="flex items-center gap-1 text-base px-3 py-1"
            >
              {getStatusInfo(order.status).icon}
              {getStatusInfo(order.status).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <div className="text-lg font-semibold flex items-center gap-2">
              Tổng tiền:
              <span className="text-2xl text-green-600 font-bold font-mono">{order.total.toLocaleString()}₫</span>
            </div>
          </div>
          <div className="rounded-lg border bg-white dark:bg-[#18181b] mb-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 font-semibold border-b p-4 bg-muted justify-between text-center">
              <div className="text-left w-full flex justify-start">Sản phẩm</div>
              <div className="w-full flex justify-center">Số lượng</div>
              <div className="text-right w-full flex justify-end">Giá</div>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 items-center border-b p-4 hover:bg-accent/30 transition-all">
                <div className="truncate text-left w-full flex justify-start">{item.name}</div>
                <div className="text-center w-full flex justify-center">{item.qty}</div>
                <div className="text-right text-base font-medium w-full flex justify-end">{item.price.toLocaleString()}₫</div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4 border-t">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard/orders">
              ← Quay lại danh sách đơn hàng
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 