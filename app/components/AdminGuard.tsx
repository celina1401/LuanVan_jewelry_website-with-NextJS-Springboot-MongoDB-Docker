'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== "admin")) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user || user.publicMetadata?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
} 