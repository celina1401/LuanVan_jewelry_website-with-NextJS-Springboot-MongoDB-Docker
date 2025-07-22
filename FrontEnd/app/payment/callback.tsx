"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentCallback() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    const responseCode = params.get("vnp_ResponseCode");
    if (responseCode === "00") {
      setMessage("✅ Thanh toán thành công!");
    } else {
      setMessage("❌ Thanh toán thất bại hoặc bị hủy.");
    }
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Kết quả thanh toán</h1>
      <p className="text-lg">{message}</p>
    </div>
  );
}
