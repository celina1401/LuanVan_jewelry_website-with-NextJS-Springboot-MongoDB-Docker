"use client";

import { ArrowLeft, Plus, Search, Filter, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
    icon?: "plus" | "search" | "filter" | "download" | "upload";
    disabled?: boolean;
  }[];
  search?: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Quay lại",
  actions = [],
  search,
  className,
}: PageHeaderProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "plus":
        return <Plus className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "filter":
        return <Filter className="h-4 w-4" />;
      case "download":
        return <Download className="h-4 w-4" />;
      case "upload":
        return <Upload className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search?.onChange?.(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search?.onSearch?.(e.currentTarget.value);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Back button */}
      {backHref && (
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actions.map((action, index) => {
              const button = (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="gap-2"
                >
                  {getIcon(action.icon)}
                  {action.label}
                </Button>
              );

              if (action.href) {
                return (
                  <Button key={index} asChild variant={action.variant || "default"} size="sm" className="gap-2">
                    <Link href={action.href}>
                      {getIcon(action.icon)}
                      {action.label}
                    </Link>
                  </Button>
                );
              }

              return button;
            })}
          </div>
        )}
      </div>

      {/* Search bar */}
      {search && (
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={search.placeholder || "Tìm kiếm..."}
              value={search.value || ""}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className="pl-10"
            />
          </div>
          {search.onSearch && (
            <Button
              onClick={() => search.onSearch?.(search.value || "")}
              size="sm"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized page headers
export function ProductsPageHeader(props: Omit<PageHeaderProps, "title">) {
  return (
    <PageHeader
      title="Quản lý sản phẩm"
      description="Thêm, chỉnh sửa và quản lý sản phẩm trong hệ thống"
      {...props}
    />
  );
}

export function OrdersPageHeader(props: Omit<PageHeaderProps, "title">) {
  return (
    <PageHeader
      title="Quản lý đơn hàng"
      description="Xem và quản lý tất cả đơn hàng của khách hàng"
      {...props}
    />
  );
}

export function UsersPageHeader(props: Omit<PageHeaderProps, "title">) {
  return (
    <PageHeader
      title="Quản lý người dùng"
      description="Quản lý thông tin và quyền truy cập của người dùng"
      {...props}
    />
  );
}

export function ReportsPageHeader(props: Omit<PageHeaderProps, "title">) {
  return (
    <PageHeader
      title="Báo cáo"
      description="Xem các báo cáo và thống kê của hệ thống"
      {...props}
    />
  );
} 