// File: components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Cart } from "@/components/ui/cart";
import { useCart } from "@/contexts/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser, SignedIn } from "@clerk/nextjs";
import { AuthActions } from "@/app/components/AuthActions";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { useNotifications } from "@/contexts/notification-context";

export function Navbar() {
  // Cart state
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Clerk user + role
  const { user, isLoaded } = useUser();
  const role = isLoaded
    ? (user?.publicMetadata?.role as string | undefined)
    : undefined;

  // Lấy pathname hiện tại
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-bold text-xl">
          T&C Jewelry
        </Link>

        {/* Main nav links: switch based on role */}
        <nav className="flex items-center gap-6">
          {role === "admin" ? (
            /* Admin navigation */
            <>
              <Link href="/admin/reports" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/reports") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Báo cáo
              </Link>
              <Link href="/admin/inventory" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/inventory") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Kho hàng
              </Link>
              <Link href="/admin/products" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/products") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Quản lý sản phẩm
              </Link>
              <Link href="/admin/users" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/users") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Quản lý người dùng
              </Link>
            </>
          ) : (
            /* Customer navigation */
            <>

              <Link href="/" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Trang chủ
              </Link>
              <Link href="/products" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/products") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Sản phẩm
              </Link>
              <Link href="/about" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/about") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Giới thiệu
              </Link>
              <Link href="/contact" className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/contact") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                Liên hệ
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${pathname.startsWith("/dashboard") ? "bg-rose-300 text-black dark:bg-rose-300 dark:text-black" : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  Trang cá nhân
                </Link>

              </SignedIn>
            </>
          )}
        </nav>

        {/* Right‐hand actions */}
        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          <ThemeToggle />

          {/* Notification bell - only show for signed in users */}
          <SignedIn>
            <div className="relative">
              <NotificationBell />
            </div>
          </SignedIn>

          {/* Cart sheet */}
          {role !== "admin" && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Giỏ hàng của bạn</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Cart />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Auth buttons / user menu */}
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
