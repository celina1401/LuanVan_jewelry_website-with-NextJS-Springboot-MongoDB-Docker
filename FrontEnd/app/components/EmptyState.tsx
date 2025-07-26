"use client";

import { Package, ShoppingCart, Heart, Search, FileText, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

type EmptyStateType = 
  | "products" 
  | "cart" 
  | "orders" 
  | "favorites" 
  | "search" 
  | "reports" 
  | "users"
  | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  showAction?: boolean;
  className?: string;
}

export function EmptyState({
  type = "custom",
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  showAction = true,
  className,
}: EmptyStateProps) {
  const getDefaultConfig = () => {
    switch (type) {
      case "products":
        return {
          icon: <Package className="h-12 w-12 text-gray-400" />,
          title: title || "Không tìm thấy sản phẩm",
          description: description || "Vui lòng điều chỉnh bộ lọc để tìm sản phẩm phù hợp.",
          actionLabel: actionLabel || "Xem tất cả sản phẩm",
          actionHref: actionHref || "/products",
        };
      case "cart":
        return {
          icon: <ShoppingCart className="h-12 w-12 text-gray-400" />,
          title: title || "Giỏ hàng trống",
          description: description || "Bạn chưa có sản phẩm nào trong giỏ hàng.",
          actionLabel: actionLabel || "Tiếp tục mua sắm",
          actionHref: actionHref || "/products",
        };
      case "orders":
        return {
          icon: <FileText className="h-12 w-12 text-gray-400" />,
          title: title || "Chưa có đơn hàng nào",
          description: description || "Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!",
          actionLabel: actionLabel || "Mua sắm ngay",
          actionHref: actionHref || "/products",
        };
      case "favorites":
        return {
          icon: <Heart className="h-12 w-12 text-gray-400" />,
          title: title || "Chưa có sản phẩm yêu thích",
          description: description || "Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.",
          actionLabel: actionLabel || "Khám phá sản phẩm",
          actionHref: actionHref || "/products",
        };
      case "search":
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: title || "Không tìm thấy kết quả",
          description: description || "Không có sản phẩm nào phù hợp với từ khóa tìm kiếm của bạn.",
          actionLabel: actionLabel || "Thử từ khóa khác",
          actionHref: actionHref || "/products",
        };
      case "reports":
        return {
          icon: <BarChart3 className="h-12 w-12 text-gray-400" />,
          title: title || "Chưa có báo cáo nào",
          description: description || "Hiện tại chưa có dữ liệu báo cáo để hiển thị.",
          actionLabel: actionLabel || "Tạo báo cáo mới",
        };
      case "users":
        return {
          icon: <Users className="h-12 w-12 text-gray-400" />,
          title: title || "Chưa có người dùng nào",
          description: description || "Hiện tại chưa có người dùng nào trong hệ thống.",
          actionLabel: actionLabel || "Thêm người dùng",
        };
      default:
        return {
          icon: icon || <Package className="h-12 w-12 text-gray-400" />,
          title: title || "Không có dữ liệu",
          description: description || "Không có dữ liệu để hiển thị.",
          actionLabel: actionLabel || "Thêm mới",
        };
    }
  };

  const config = getDefaultConfig();

  const renderAction = () => {
    if (!showAction || (!actionHref && !onAction)) return null;

    if (actionHref) {
      return (
        <Button asChild className="mt-4">
          <Link href={actionHref}>
            {config.actionLabel}
          </Link>
        </Button>
      );
    }

    if (onAction) {
      return (
        <Button onClick={onAction} className="mt-4">
          {config.actionLabel}
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-sm">
          {config.description}
        </p>
        {renderAction()}
      </CardContent>
    </Card>
  );
}

// Specialized empty state components
export function ProductsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="products" {...props} />;
}

export function CartEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="cart" {...props} />;
}

export function OrdersEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="orders" {...props} />;
}

export function FavoritesEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="favorites" {...props} />;
}

export function SearchEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="search" {...props} />;
}

export function ReportsEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="reports" {...props} />;
}

export function UsersEmptyState(props: Omit<EmptyStateProps, "type">) {
  return <EmptyState type="users" {...props} />;
} 