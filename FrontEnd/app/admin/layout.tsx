"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import AdminSidebar from "@/app/components/AdminSidebar";

// ✅ Thêm ToastProvider
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

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
      {/* ✅ Bao toàn bộ layout trong ToastProvider */}
      <ToastProvider
        swipeDirection="right"
        duration={3000} // 👈 3s = 3000ms
      >
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
          <AdminSidebar />
          <main
            className="flex-1 bg-gray-50 dark:bg-black p-6 overflow-y-auto"
            style={{ paddingLeft: '20rem' }}
          >
            {children}
          </main>
        </div>

        {/* ✅ Viewport để toast hiển thị đúng vị trí */}
        <ToastViewport />
      </ToastProvider>
    </AdminGuard>
  );
}
