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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        // Get the JWT token
        const token = await getToken();
        
        // Verify admin status with backend
        const response = await api.get("/auth/verify-admin");
        setIsAdmin(response.isAdmin);
        
        if (!response.isAdmin) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        router.push("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [isLoaded, user, router, getToken, api]);

  if (isChecking || !isLoaded || !user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
} 