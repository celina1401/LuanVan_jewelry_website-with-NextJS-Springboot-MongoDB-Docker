"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

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
      <Card className="max-w-xl w-full p-8">
        <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng {order.id}</h1>
        <div className="mb-4 space-y-1">
          <div><b>Ngày đặt:</b> {order.date}</div>
          <div><b>Tổng tiền:</b> {order.total.toLocaleString()}₫</div>
          <div><b>Trạng thái:</b> {order.status}</div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-[#18181b] mb-4">
          <div className="grid grid-cols-3 gap-4 font-medium border-b p-4">
            <div>Sản phẩm</div>
            <div>Số lượng</div>
            <div>Giá</div>
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 items-center border-b p-4">
              <div>{item.name}</div>
              <div>{item.qty}</div>
              <div>{item.price.toLocaleString()}₫</div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/dashboard/orders" className="text-blue-600 hover:underline">← Quay lại danh sách đơn hàng</Link>
        </div>
      </Card>
    </div>
  );
} 