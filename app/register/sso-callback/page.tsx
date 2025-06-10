"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // Người dùng đã được xác thực, chuyển hướng đến dashboard
    router.push("/");
  }, [isLoaded, userId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-center text-lg">Completing authentication...</p>
    </div>
  );
}