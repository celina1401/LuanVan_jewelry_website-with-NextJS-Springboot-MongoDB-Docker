"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, Calendar, CreditCard } from "lucide-react";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderSummary {
  orderId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    receiverName: string;
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
}

interface OrderSummaryCardProps {
  order: OrderSummary;
  showActions?: boolean;
  onViewDetails?: () => void;
  onTrackOrder?: () => void;
}

export function OrderSummaryCard({
  order,
  showActions = true,
  onViewDetails,
  onTrackOrder,
}: OrderSummaryCardProps) {
  const getStatusConfig = (status: OrderSummary["status"]) => {
    switch (status) {
      case "pending":
        return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
      case "confirmed":
        return { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
      case "shipped":
        return { label: "Đang giao", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };
      case "delivered":
        return { label: "Đã giao", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
      case "cancelled":
        return { label: "Đã hủy", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Đơn hàng #{order.orderId}</CardTitle>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Sản phẩm</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Số lượng: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Shipping Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Địa chỉ giao hàng</h4>
          </div>
          <div className="pl-6 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium">{order.shippingAddress.receiverName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.ward}, {order.shippingAddress.district}</p>
            <p>{order.shippingAddress.province}</p>
          </div>
        </div>

        <Separator />

        {/* Order Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin đơn hàng</h4>
          </div>
          <div className="pl-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Ngày đặt:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</span>
            </div>
            {order.estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dự kiến giao:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatDate(order.estimatedDelivery)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Phương thức thanh toán:</span>
              <span className="text-gray-900 dark:text-gray-100">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Price Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tổng tiền</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Tạm tính:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.shipping)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-gray-900 dark:text-gray-100">Tổng cộng:</span>
              <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-4">
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition"
              >
                Xem chi tiết
              </button>
            )}
            {onTrackOrder && order.status === "shipped" && (
              <button
                onClick={onTrackOrder}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Theo dõi đơn hàng
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 