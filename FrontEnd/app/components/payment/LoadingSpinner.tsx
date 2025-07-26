"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-rose-500", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Variant for inline loading
export function InlineLoadingSpinner({ size = "sm", className }: Omit<LoadingSpinnerProps, "text" | "fullScreen">) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-rose-500", {
        "h-3 w-3": size === "sm",
        "h-4 w-4": size === "md",
        "h-5 w-5": size === "lg",
        "h-6 w-6": size === "xl",
      })} />
    </div>
  );
}

// Variant for button loading
export function ButtonLoadingSpinner({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <Loader2 className={cn("animate-spin", {
      "h-4 w-4": size === "sm",
      "h-5 w-5": size === "md",
    })} />
  );
}

// Variant for page loading
export function PageLoadingSpinner({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      {text && (
        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
          {text}
        </p>
      )}
    </div>
  );
} 