"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Home, Box, Users, FileText, BarChart2, User, ListChecks, Calendar, Lock, LogOut, MessageCircleMore, Star, Images, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Bảng điều khiển", icon: <Home size={24} /> },
  // { href: "/admin/inventory", label: "Kho hàng", icon: <Box size={18} /> },
  { href: "/admin/users", label: "Quản lý người dùng", icon: <Users size={24} /> },
  { href: "/admin/products", label: "Quản lý sản phẩm", icon: <BarChart2 size={24} /> },
  { href: "/admin/orders", label: "Quản lý đơn hàng", icon: <FileText size={24} /> },
  { href: "/admin/reviews", label: "Quản lý đánh giá & bình luận", icon: <Star size={24} /> },
  { href: "/admin/slider", label: "Quản lý slider", icon: <Images size={24} /> },
  { href: "/admin/message", label: "Quản lý trò chuyện", icon: <MessageCircleMore size={24} /> },
  { href: "/admin/profile", label: "Hồ sơ", icon: <User size={24} /> },
];

export default function AdminSidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Emit custom event to notify layout
    const event = new CustomEvent('sidebarToggle', {
      detail: { isCollapsed: newState }
    });
    window.dispatchEvent(event);
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-80'} bg-white dark:bg-black border-r flex flex-col h-screen min-h-screen p-6 gap-8 shadow-lg fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out`}>
      {/* Floating Toggle Button */}
      <div className={`absolute transition-all duration-300 ease-in-out ${isCollapsed ? '-right-3' : '-right-3'} top-6 z-40`}>
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center hover:scale-110"
          aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User info */}
      <div className={`flex items-center gap-3 mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div>
            <div className="font-bold text-lg text-primary">{user?.fullName || "Admin"}</div>
            <div className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || "admin@site.com"}</div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <TooltipProvider key={link.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md font-medium transition-colors
                      ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-primary"}
                      ${isCollapsed ? 'justify-center px-2' : ''}`}
                    prefetch={false}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {link.icon}
                    </div>
                    {!isCollapsed && <span>{link.label}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {link.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* Theme toggle + Sign Out icon */}
      <div className={`flex items-center justify-center gap-3 mb-6 ${isCollapsed ? 'flex-col' : 'flex-row'}`}>
        <ThemeToggle />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut(() => { window.location.href = "/"; })}
                className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                aria-label="Sign Out"
              >
                <div className="flex-shrink-0">
                  <LogOut size={24} />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              Đăng xuất
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Copyright */}
      {!isCollapsed && (
        <div className="mt-auto flex flex-col items-center gap-2 w-full">
          <div className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} Quản trị viên</div>
        </div>
      )}
    </aside>
  );
} 
