'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "../api/apiClient";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const api = useApi();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isLoaded || !user) {
        setIsVerifying(false);
        return;
      }

      const role = user?.publicMetadata.role;
      const isAdminRoute = pathname.startsWith("/admin");

      if (isAdminRoute && role !== "admin") {
        router.replace("/"); // hoặc "/unauthorized"
      } else {
        setIsVerifying(false);
      }
    };

    verifyAdminAccess();
  }, [isLoaded, user, pathname, getToken, api, router]);

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
