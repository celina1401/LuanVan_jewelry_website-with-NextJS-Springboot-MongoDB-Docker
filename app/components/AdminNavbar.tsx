"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthActions } from "@/app/components/AuthActions";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/products", label: "Manage Products" },
    { href: "/admin/users", label: "User Management" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/admin" className="font-bold text-2xl tracking-tight text-primary">
          Admin Dashboard
        </Link>
        {/* Nav links */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthActions />
        </div>
      </div>
      {/* Mobile nav (optional) */}
      {/* Có thể thêm menu mobile ở đây nếu cần */}
    </header>
  );
} 