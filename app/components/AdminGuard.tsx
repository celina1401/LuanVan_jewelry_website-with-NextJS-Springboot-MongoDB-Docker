'use client';

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "../api/apiClient";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();  // Get user and loading state from Clerk
  const { getToken } = useAuth();  // Get Clerk auth methods
  const router = useRouter();  // To navigate to other pages
  const api = useApi();  // API client to interact with backend
  const [isVerifying, setIsVerifying] = useState(true);  // State to track admin verification process

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // If Clerk hasn't loaded or the user is not available, skip verification
      if (!isLoaded || !user) {
        setIsVerifying(false);  // Stop verification process
        return;
      }

      try {
        // Ensure a valid JWT token is available
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        // Make API request to verify admin access
        const data = await api.get("/admin/verify") as { isAdmin: boolean };

        if (!data.isAdmin) {
          throw new Error("You are not an admin");
        }

        // If the user is an admin, proceed to render children
        setIsVerifying(false);
      } catch (err) {
        console.error("Error verifying admin access:", err);
        // If not an admin, redirect to home page
        router.replace("/");
      }
    };

    verifyAdminAccess();
  }, [isLoaded, user, getToken, api, router]);  // Dependencies to re-run effect

  if (isVerifying) {
    // Show loading spinner while verifying admin access
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4">Đang xác thực quyền admin...</p>
        </div>
      </div>
    );
  }

  // If verification is complete, render the children (protected content)
  return <>{children}</>;
}
