"use client";

import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type PaymentStatus = "success" | "failed" | "pending" | "cancelled";

interface PaymentStatusCardProps {
  status: PaymentStatus;
  title?: string;
  message?: string;
  orderId?: string;
  amount?: string;
  orderDetails?: any;
  onRetry?: () => void;
  onViewOrder?: () => void;
  onContinueShopping?: () => void;
  showActions?: boolean;
}

export function PaymentStatusCard({
  status,
  title,
  message,
  orderId,
  amount,
  orderDetails,
  onRetry,
  onViewOrder,
  onContinueShopping,
  showActions = true,
}: PaymentStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          title: title || "Thanh toán thành công!",
          message: message || "Đơn hàng của bạn đã được xử lý thành công.",
        };
      case "failed":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          title: title || "Thanh toán thất bại",
          message: message || "Có lỗi xảy ra trong quá trình thanh toán.",
        };
      case "pending":
        return {
          icon: Clock,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          title: title || "Đang xử lý thanh toán",
          message: message || "Vui lòng chờ trong khi chúng tôi xử lý thanh toán.",
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800",
          title: title || "Thanh toán bị hủy",
          message: message || "Thanh toán đã bị hủy bởi người dùng.",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Card className={`w-full max-w-md mx-auto ${config.bgColor} ${config.borderColor}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <IconComponent className={`h-16 w-16 ${config.iconColor}`} />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600 dark:text-gray-300">
          {config.message}
        </p>
        
        {orderId && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng:</p>
            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
              {orderId}
            </p>
          </div>
        )}
        
        {amount && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Số tiền:</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {amount}
            </p>
          </div>
        )}

        {/* Display additional order details if available */}
        {orderDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Chi tiết đơn hàng:
            </h4>
            {orderDetails.customerInfo?.name && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Khách hàng:</span> {orderDetails.customerInfo.name}
              </p>
            )}
            {orderDetails.paymentMethod && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Phương thức:</span> {orderDetails.paymentMethod}
              </p>
            )}
            {orderDetails.orderStatus && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Trạng thái:</span> {orderDetails.orderStatus}
              </p>
            )}
            {orderDetails.paymentStatus && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Thanh toán:</span> {orderDetails.paymentStatus}
              </p>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex flex-col gap-3 pt-4">
            {status === "failed" && onRetry && (
              <Button 
                onClick={onRetry}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Thử lại thanh toán
              </Button>
            )}
            
            {status === "cancelled" && onRetry && (
              <Button 
                onClick={onRetry}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Quay lại thanh toán
              </Button>
            )}
            
            <div className="flex gap-3">
              {onViewOrder ? (
                <Button 
                  onClick={onViewOrder}
                  variant="outline" 
                  className="flex-1"
                >
                  Xem đơn hàng
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard/orders">
                    Xem đơn hàng
                  </Link>
                </Button>
              )}
              
              {onContinueShopping ? (
                <Button 
                  onClick={onContinueShopping}
                  className="flex-1"
                >
                  Tiếp tục mua sắm
                </Button>
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/products">
                    Tiếp tục mua sắm
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}