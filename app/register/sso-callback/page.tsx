"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the SSO callback by redirecting to the dashboard
    // The actual authentication will be handled by Clerk
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-center text-lg">Completing authentication...</p>
    </div>
  );
}