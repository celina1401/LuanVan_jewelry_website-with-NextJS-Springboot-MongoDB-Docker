"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserStatusChecker() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users/${user.id}/status`);
        if (response.ok) {
          const userData = await response.json();
          
          // Nếu user bị khóa
          if (userData.active === false) {
            alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.");
            await signOut();
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();
  }, [user, signOut, router]);

  return null; // Component không render gì
} 