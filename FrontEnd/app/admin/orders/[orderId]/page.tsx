"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, CreditCard, Truck, CheckCircle } from "lucide-react";
import { getProductImageUrl } from "@/lib/utils";

interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
    weight?: string;
    goldAge?: string;
    wage?: string;
    category?: string;
    brand?: string;
}

interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    receiverName: string;
    street: string;
    ward: string;
    district: string;
    province: string;
    shippingAddress: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
    paymentUrl?: string;
    orderStatus: string;
    shippingStatus: string;
    codStatus: string;
    note?: string;
    channel: string;
    smsNotification: boolean;
    invoiceRequest: boolean;
    promoCode?: string;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelReason?: string;
}

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/orders/${params.orderId}`);
                if (response.ok) {
                    const orderData = await response.json();
                    setOrder(orderData);
                } else {
                    setError("Không thể tải thông tin đơn hàng");
                }
            } catch (error) {
                setError("Có lỗi xảy ra khi tải đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        if (params.orderId) {
            fetchOrder();
        }
    }, [params.orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <Button 
                        onClick={() => router.back()} 
                        className="mt-4"
                        variant="outline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Không tìm thấy đơn hàng</p>
                    <Button 
                        onClick={() => router.back()} 
                        className="mt-4"
                        variant="outline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Button 
                    onClick={() => router.back()} 
                    variant="outline"
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.orderNumber}</h1>
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Thông tin đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                <p className="font-medium">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ngày đặt</p>
                                <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                <p className="font-medium">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                                <p className="font-medium">{order.paymentStatus}</p>
                            </div>
                            {order.orderStatus === "Đã hủy" && order.cancelReason && (
                                <div>
                                    <p className="text-sm text-gray-500">Lý do hủy</p>
                                    <p className="font-medium text-red-600">{order.cancelReason}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Tên khách hàng</p>
                            <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p className="font-medium">{order.customerPhone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{order.customerEmail}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                            <p className="font-medium">{order.shippingAddress}</p>
                        </div>
                        {order.note && (
                            <div>
                                <p className="text-sm text-gray-500">Ghi chú</p>
                                <p className="font-medium">{order.note}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sản phẩm đã đặt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <img 
                                        src={getProductImageUrl(item)} 
                                        alt={item.productName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.productName}</h3>
                                        <p className="text-sm text-gray-500">
                                            Số lượng: {item.quantity} x {formatCurrency(item.price)}
                                        </p>
                                        {item.weight && (
                                            <p className="text-sm text-gray-500">
                                                Trọng lượng: {item.weight}
                                            </p>
                                        )}
                                        {item.goldAge && (
                                            <p className="text-sm text-gray-500">
                                                Tuổi vàng: {item.goldAge}
                                            </p>
                                        )}
                                        {item.category && (
                                            <p className="text-sm text-gray-500">
                                                Loại: {item.category}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tổng cộng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(order.shippingFee)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Tổng cộng:</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin thời gian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><strong>Tạo đơn:</strong> {formatDate(order.createdAt)}</p>
                            {order.updatedAt && order.updatedAt !== order.createdAt && (
                                <p><strong>Cập nhật:</strong> {formatDate(order.updatedAt)}</p>
                            )}
                            {order.paidAt && (
                                <p><strong>Thanh toán:</strong> {formatDate(order.paidAt)}</p>
                            )}
                            {order.shippedAt && (
                                <p><strong>Giao hàng:</strong> {formatDate(order.shippedAt)}</p>
                            )}
                            {order.deliveredAt && (
                                <p><strong>Hoàn thành:</strong> {formatDate(order.deliveredAt)}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}