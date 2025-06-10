'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "../api/apiClient";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const api = useApi();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Nếu Clerk chưa load xong hoặc chưa có user → tạm dừng verify
      if (!isLoaded || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Đảm bảo có JWT
        const token = await getToken();
        if (!token) {
          throw new Error("Không có token xác thực");
        }

        // Gọi đúng endpoint (useApi sẽ prepend "/api")
        const data = (await api.get("/admin/verify")) as { isAdmin: boolean };

        if (!data.isAdmin) {
          throw new Error("Không phải admin");
        }

        // Nếu là admin, cho phép tiếp tục
        setIsVerifying(false);
      } catch (err) {
        console.error("Error verifying admin access:", err);
        // Redirect về trang home nếu không có quyền
        router.replace("/");
      }
    };

    verifyAdminAccess();
  }, [isLoaded, user, getToken, api, router]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4">Đang xác thực quyền admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
