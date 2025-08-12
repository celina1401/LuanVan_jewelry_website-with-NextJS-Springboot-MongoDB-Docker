"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AdminGuard from "@/app/components/AdminGuard";
import AdminSidebar from "@/app/components/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Initialize sidebarWidth based on localStorage state
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('adminSidebarCollapsed');
      return savedState === 'true' ? '5rem' : '20rem';
    }
    return '20rem'; // Default to expanded
  });

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      const isCollapsed = e.detail.isCollapsed;
      setSidebarWidth(isCollapsed ? '5rem' : '20rem');
    };

    // Set initial width based on current localStorage state
    const savedState = localStorage.getItem('adminSidebarCollapsed');
    if (savedState === 'true') {
      setSidebarWidth('5rem');
    } else {
      setSidebarWidth('20rem');
    }

    window.addEventListener('sidebarToggle', handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarChange as EventListener);
    };
  }, []);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-black">
        <AdminSidebar />
        <main
          className="flex-1 bg-gray-50 dark:bg-black p-6 overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarWidth }}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </AdminGuard>
  );
}
