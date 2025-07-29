// app/api/orders/[orderId]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { reason } = await req.json();

  const res = await fetch(`http://localhost:9003/api/orders/${params.orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderStatus: "Đã hủy",
      cancelReason: reason,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "Lỗi hủy đơn hàng" }, { status: 500 });

  return NextResponse.json({ success: true });
}
