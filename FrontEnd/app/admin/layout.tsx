// File: app/admin/layout.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-[#f5f6fa] dark:bg-background p-6 overflow-y-auto" style={{ paddingLeft: '20rem' }}>
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
