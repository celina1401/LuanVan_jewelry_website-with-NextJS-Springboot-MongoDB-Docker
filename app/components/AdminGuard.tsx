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
        const response = await api.get("/api/admin/verify");
        
        // Check if the response is valid and indicates admin status
        if (response && typeof response === 'object' && response.isAdmin === true) {
          setIsVerifying(false);
          setError(null);
        } else {
          // If the response is not as expected (e.g., not JSON, missing isAdmin), treat as not authorized
          console.log("User is not an admin or unexpected response format.");
          setError("Bạn không có quyền truy cập trang này.");
          router.push("/");
        }
      } catch (error: any) {
        console.error("Error verifying admin access:", error);
        // Any error during this specific API call implies unauthorized access or a critical issue preventing verification.
        setError("Không có quyền truy cập hoặc lỗi xác thực.");
        router.push("/"); // Redirect on any error during verification
      }
    };

    verifyAdminAccess();
  }, [isLoaded, user, router, getToken, api]);

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