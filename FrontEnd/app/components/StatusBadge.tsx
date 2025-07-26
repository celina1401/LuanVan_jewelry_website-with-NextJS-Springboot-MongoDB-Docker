"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "active"
  | "inactive"
  | "processing"
  | "completed"
  | "cancelled"
  | "shipped"
  | "delivered"
  | "confirmed"
  | "draft"
  | "published";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = "md",
  variant = "default",
  className,
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
      case "completed":
      case "delivered":
        return {
          label: label || "Thành công",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          outlineColor: "border border-green-200 text-green-700 dark:border-green-700 dark:text-green-300",
        };
      case "error":
        return {
          label: label || "Lỗi",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          outlineColor: "border border-red-200 text-red-700 dark:border-red-700 dark:text-red-300",
        };
      case "warning":
        return {
          label: label || "Cảnh báo",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          outlineColor: "border border-yellow-200 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300",
        };
      case "info":
        return {
          label: label || "Thông tin",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          outlineColor: "border border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300",
        };
      case "pending":
      case "processing":
        return {
          label: label || "Đang xử lý",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          outlineColor: "border border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300",
        };
      case "active":
      case "confirmed":
      case "published":
        return {
          label: label || "Hoạt động",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
          outlineColor: "border border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300",
        };
      case "inactive":
      case "draft":
        return {
          label: label || "Không hoạt động",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          outlineColor: "border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300",
        };
      case "cancelled":
        return {
          label: label || "Đã hủy",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
          outlineColor: "border border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300",
        };
      case "shipped":
        return {
          label: label || "Đang giao",
          color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
          outlineColor: "border border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300",
        };
      default:
        return {
          label: label || "Không xác định",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          outlineColor: "border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        sizeClasses[size],
        variant === "outline" ? config.outlineColor : config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

// === Specialized Badge Components ===

type OrderStatusBadgeProps = Omit<StatusBadgeProps, "status"> & {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
};

export function OrderStatusBadge(props: OrderStatusBadgeProps) {
  return <StatusBadge {...props} />;
}

type PaymentStatusBadgeProps = Omit<StatusBadgeProps, "status"> & {
  status: "pending" | "success" | "failed" | "cancelled";
};

// export function PaymentStatusBadge(props: PaymentStatusBadgeProps) {
//   return <StatusBadge {...props} />;
// }

type UserStatusBadgeProps = Omit<StatusBadgeProps, "status"> & {
  status: "active" | "inactive";
};

export function UserStatusBadge(props: UserStatusBadgeProps) {
  return <StatusBadge {...props} />;
}

type ProductStatusBadgeProps = Omit<StatusBadgeProps, "status"> & {
  status: "draft" | "published" | "inactive";
};

export function ProductStatusBadge(props: ProductStatusBadgeProps) {
  return <StatusBadge {...props} />;
}
