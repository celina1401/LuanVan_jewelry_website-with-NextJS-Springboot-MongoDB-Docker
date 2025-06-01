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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isLoaded || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Lấy JWT token từ Clerk
        const token = await getToken();
        
        if (!token) {
          setError("Không thể lấy token xác thực");
          router.push("/login");
          return;
        }

        // Gọi API để verify quyền admin
        const response = await api.get("/auth/verify-admin");
        
        if (!response.isAdmin) {
          console.log("User is not an admin");
          setError("Bạn không có quyền truy cập trang này");
          router.push("/");
          return;
        }

        setIsVerifying(false);
        setError(null);
      } catch (error: any) {
        console.error("Error verifying admin access:", error);
        setError(error.message || "Lỗi xác thực quyền truy cập");
        router.push("/login");
      }
    };

    verifyAdminAccess();
  }, [isLoaded, user, router, getToken]);

  if (isVerifying) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Đang xác thực...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    </div>;
  }

  return <>{children}</>;
} 