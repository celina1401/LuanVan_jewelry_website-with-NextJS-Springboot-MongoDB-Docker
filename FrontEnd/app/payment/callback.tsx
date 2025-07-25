"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentCallback() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    // Xử lý cho nhiều phương thức thanh toán nếu cần
    const responseCode = params.get("vnp_ResponseCode");
    // Có thể mở rộng thêm các tham số khác nếu cần
    if (responseCode === "00") {
      setMessage("✅ Thanh toán thành công!");
    } else if (responseCode) {
      setMessage("❌ Thanh toán thất bại hoặc bị hủy.");
    } else {
      // Trường hợp không có responseCode (có thể là phương thức khác)
      setMessage("Đang xử lý kết quả thanh toán hoặc phương thức không xác định.");
    }
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Kết quả thanh toán</h1>
      <p className="text-lg">{message}</p>
    </div>
  );
}
