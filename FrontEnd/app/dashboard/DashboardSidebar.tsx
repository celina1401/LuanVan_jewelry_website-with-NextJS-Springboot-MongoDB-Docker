'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package } from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Thông tin cá nhân",
    icon: <User className="w-4 h-4 mr-2" />,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/orders",
    label: "Đơn hàng của tôi",
    icon: <Package className="w-4 h-4 mr-2" />,
    match: (pathname: string) => pathname.startsWith("/dashboard/orders"),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-[300px] bg-white dark:bg-[#18181b] rounded-xl shadow p-6 flex flex-col gap-2 border">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-base mb-1
            ${link.match(pathname) ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </aside>
  );
} 