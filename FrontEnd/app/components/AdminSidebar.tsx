"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Home, Box, Users, FileText, BarChart2, User, ListChecks, Calendar, Lock, LogOut, MessageCircleMore, Star, Images } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Bảng điều khiển", icon: <Home size={18} /> },
  // { href: "/admin/inventory", label: "Kho hàng", icon: <Box size={18} /> },
  { href: "/admin/users", label: "Quản lý người dùng", icon: <Users size={18} /> },
  { href: "/admin/products", label: "Quản lý sản phẩm", icon: <BarChart2 size={18} /> },
  { href: "/admin/orders", label: "Quản lý đơn hàng", icon: <FileText size={18} /> },
  { href: "/admin/reviews", label: "Quản lý đánh giá & bình luận", icon: <Star size={18} /> },
  { href: "/admin/slider", label: "Quản lý slider", icon: <Images size={18} /> },
  { href: "/admin/message", label: "Quản lý trò chuyện", icon: <MessageCircleMore size={18} /> },
  { href: "/admin/reports", label: "Báo cáo", icon: <FileText size={18} /> },
  { href: "/admin/profile", label: "Hồ sơ", icon: <User size={18} /> },
  { href: "/admin/tasks", label: "Công việc", icon: <ListChecks size={18} /> },
  { href: "/admin/calendar", label: "Lịch", icon: <Calendar size={18} /> },
  { href: "/admin/auth", label: "Xác thực", icon: <Lock size={18} /> },
];

export default function AdminSidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  return (
    <aside className="w-128 bg-white dark:bg-black border-r flex flex-col h-screen min-h-screen p-6 gap-8 shadow-lg fixed top-0 left-0 z-30">
      {/* User info */}
      <div className="flex items-center gap-3 mb-8">
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg text-primary">{user?.fullName || "Admin"}</div>
          <div className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || "admin@site.com"}</div>
        </div>
      </div>
      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors
                ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-primary"}`}
              prefetch={false}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Theme toggle + Sign Out icon */}
      <div className="flex flex-row items-center justify-center gap-4 mb-4">
        <ThemeToggle />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut(() => { window.location.href = "/"; })}
                className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut size={28} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Đăng xuất</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* Copyright */}
      <div className="mt-auto flex flex-col items-center gap-2 w-full">
        <div className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} Quản trị viên</div>
      </div>
    </aside>
  );
} 

// "use client";

// import Link from "next/link";
// import { useUser, useClerk } from "@clerk/nextjs";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Home, Box, Users, FileText, BarChart2, User, ListChecks, Calendar, Lock, LogOut, MessageCircleMore, ChevronLeft, ChevronRight } from "lucide-react";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { Tooltip } from "@/components/ui/tooltip";
// import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
// import { usePathname } from "next/navigation";
// import { useState } from "react";

// const navLinks = [
//   { href: "/admin", label: "Bảng điều khiển", icon: <Home size={18} /> },
//   // { href: "/admin/inventory", label: "Kho hàng", icon: <Box size={18} /> },
//   { href: "/admin/users", label: "Quản lý người dùng", icon: <Users size={18} /> },
//   { href: "/admin/products", label: "Quản lý sản phẩm", icon: <BarChart2 size={18} /> },
//   { href: "/admin/orders", label: "Quản lý đơn hàng", icon: <FileText size={18} /> },
//   { href: "/admin/message", label: "Quản lý trò chuyện", icon: <MessageCircleMore size={18} /> },
//   { href: "/admin/reports", label: "Báo cáo", icon: <FileText size={18} /> },
//   { href: "/admin/profile", label: "Hồ sơ", icon: <User size={18} /> },
//   { href: "/admin/tasks", label: "Công việc", icon: <ListChecks size={18} /> },
//   { href: "/admin/calendar", label: "Lịch", icon: <Calendar size={18} /> },
//   { href: "/admin/auth", label: "Xác thực", icon: <Lock size={18} /> },
// ];

// export default function AdminSidebar() {
//   const { user } = useUser();
//   const { signOut } = useClerk();
//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(false);
//   return (
//     <aside className={`relative ${collapsed ? "w-20" : "w-128"} bg-white dark:bg-muted border-r flex flex-col h-screen min-h-screen p-6 gap-8 shadow-lg fixed top-0 left-0 z-30 transition-all duration-200`}> 
//       {/* Collapse/Expand button */}
//       <button
//         className="absolute top-4 right-4 p-1 rounded hover:bg-accent"
//         onClick={() => setCollapsed((c) => !c)}
//         aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
//       >
//         {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//       </button>
//       {/* User info */}
//       <div className={`flex items-center gap-3 mb-8 transition-all ${collapsed ? "flex-col gap-0" : "flex-row"}`}>
//         <Avatar className={collapsed ? "w-10 h-10" : "w-14 h-14"}>
//           <AvatarImage src={user?.imageUrl} />
//           <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
//         </Avatar>
//         {!collapsed && (
//           <div>
//             <div className="font-bold text-lg text-primary">{user?.fullName || "Admin"}</div>
//             <div className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || "admin@site.com"}</div>
//           </div>
//         )}
//       </div>
//       {/* Nav links */}
//       <nav className="flex flex-col gap-1 flex-1">
//         {navLinks.map((link) => {
//           const isActive = pathname === link.href;
//           return (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors
//                 ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-primary"}
//                 ${collapsed ? "justify-center" : ""}`}
//               prefetch={false}
//             >
//               {link.icon}
//               {!collapsed && <span>{link.label}</span>}
//             </Link>
//           );
//         })}
//       </nav>
//       {/* Theme toggle + Sign Out icon */}
//       <div className={`flex ${collapsed ? "flex-col gap-2" : "flex-row items-center justify-center gap-4 mb-4"}`}>
//         <ThemeToggle />
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <button
//                 onClick={() => signOut(() => { window.location.href = "/"; })}
//                 className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
//                 aria-label="Sign Out"
//               >
//                 <LogOut size={28} />
//               </button>
//             </TooltipTrigger>
//             <TooltipContent>Đăng xuất</TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       </div>
//       {/* Copyright */}
//       {!collapsed && (
//         <div className="mt-auto flex flex-col items-center gap-2 w-full">
//           <div className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} Quản trị viên</div>
//         </div>
//       )}
//     </aside>
//   );
// } 