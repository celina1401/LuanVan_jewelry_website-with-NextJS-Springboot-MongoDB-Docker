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

export function Navbar() {
  // Cart state
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Clerk user + role
  const { user, isLoaded } = useUser();
  const role = isLoaded
    ? (user?.publicMetadata?.role as string | undefined)
    : undefined;

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
              <Link href="/admin/reports" className="text-sm font-medium hover:underline">
                Reports
              </Link>
              <Link href="/admin/inventory" className="text-sm font-medium hover:underline">
                Inventory
              </Link>
              <Link href="/admin/products" className="text-sm font-medium hover:underline">
                Manage Products
              </Link>
              <Link href="/admin/users" className="text-sm font-medium hover:underline">
                User Management
              </Link>
            </>
          ) : (
            /* Customer navigation */
            <>
              <Link href="/products" className="text-sm font-medium hover:underline">
                Products
              </Link>
              <Link href="/about" className="text-sm font-medium hover:underline">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:underline">
                Contact
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:underline"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </>
          )}
        </nav>

        {/* Right‐hand actions */}
        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          <ThemeToggle />

          {/* Cart sheet */
          role !== "admin"?(
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
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Cart />
              </div>
            </SheetContent>
          </Sheet>

          ):null}
          {/* Auth buttons / user menu */}
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
