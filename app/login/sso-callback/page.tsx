"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      // Người dùng đã được xác thực, chuyển hướng đến dashboard
      router.push("/dashboard");
    } else {
      // Nếu không có userId sau khi tải, có thể chuyển hướng về trang đăng nhập hoặc trang chủ
      router.push("/login");
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">Completing login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}