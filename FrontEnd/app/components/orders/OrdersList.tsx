"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/lib";
import { Package, Calendar, CreditCard, Truck } from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface Order {
  orderId: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
  updatedAt: string;
}

export function OrdersList() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        
        const response = await fetch(`/api/orders?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if the response is an error object
        if (data.error) {
          setError(data.error);
          setOrders([]);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Unexpected orders data format:", data);
          setError("Unexpected data format received from server");
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, getToken]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'đã giao':
        return 'default';
      case 'chờ xác nhận':
      case 'chờ thanh toán':
      case 'đang giao':
        return 'secondary';
      case 'đã hủy':
      case 'thất bại':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Đang tải đơn hàng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Có lỗi xảy ra: {error}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
        </p>
        <Button asChild>
          <a href="/products">Bắt đầu mua sắm</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Đơn hàng của tôi
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orders.length} đơn hàng
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.orderId} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    #{order.orderNumber}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Status and Payment Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái đơn hàng</p>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)} className="text-xs">
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thanh toán</p>
                    <Badge variant={getStatusBadgeVariant(order.paymentStatus)} className="text-xs">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vận chuyển</p>
                    <Badge variant={getStatusBadgeVariant(order.shippingStatus)} className="text-xs">
                      {order.shippingStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/orders/${order.orderId}`}>Chi tiết</a>
                </Button>
                
                {order.paymentStatus === 'Chờ thanh toán' && (
                  <Button size="sm" asChild>
                    <a href={`/payment?orderId=${order.orderId}`}>Thanh toán</a>
                  </Button>
                )}
                
                {order.orderStatus === 'Chờ xác nhận' && (
                  <Button variant="destructive" size="sm">
                    Hủy đơn
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}