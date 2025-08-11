"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, CreditCard, Truck, CheckCircle, X, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { toast } from "sonner";
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
  invoiceUrl?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

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
        console.error("Error fetching order:", error);
        setError("Có lỗi xảy ra khi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId]);

  const handleGenerateInvoice = async () => {
    if (!order) return;

    try {
      // Chuẩn bị dữ liệu cho hóa đơn
      const invoiceData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        receiverName: order.receiverName,
        shippingAddress: order.shippingAddress,
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          wage: item.wage ? parseFloat(item.wage) : 0, // Thêm trường wage
          totalPrice: item.totalPrice,
          weight: item.weight
        })),
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        note: order.note
      };

      // Tạo và tải xuống PDF
      await generateInvoicePDF(invoiceData);
      toast.success("Hóa đơn đã được tạo và tải xuống thành công!");
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn:', error);
      toast.error("Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Không tìm thấy đơn hàng"}</p>
          <Button onClick={() => window.location.href = "/dashboard/orders"}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Đã giao":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Đang giao":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "Chưa xử lý":
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      // Trạng thái đơn hàng
      case "Chưa xử lý":
        return "text-gray-800 bg-gray-200 dark:text-gray-100 dark:bg-black";
      case "Đã nhận đơn":
        return "text-blue-800 bg-blue-200 dark:text-blue-100 dark:bg-blue-900";
      case "Đang đóng gói":
        return "text-yellow-800 bg-yellow-200 dark:text-yellow-100 dark:bg-yellow-900";
      case "Chờ giao hàng":
        return "text-green-800 bg-green-200 dark:text-green-100 dark:bg-green-900";
      case "Đã hủy":
        return "text-white bg-red-500 dark:bg-red-600"; // ✅ Màu đậm, chữ trắng
      case "Đã giao":
        return "text-emerald-700 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-900";
  
      // Trạng thái giao hàng
      case "Giao hàng thành công":
        return "text-emerald-700 bg-emerald-100 dark:text-emerald-100 dark:bg-emerald-900";
      case "Đang giao":
        return "text-blue-700 bg-blue-100 dark:text-blue-100 dark:bg-blue-900";
      case "Chưa giao hàng":
        return "text-yellow-700 bg-yellow-100 dark:text-yellow-100 dark:bg-yellow-900";
      case "Giao hàng thất bại":
        return "text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-900";
  
      default:
        return "text-gray-700 bg-gray-100 dark:text-white dark:bg-black";
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard/orders"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.orderNumber}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Đặt hàng ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          {/* Nút tải hóa đơn - hiển thị nếu có invoiceRequest hoặc đã thanh toán */}
          {(order.invoiceRequest || order.paymentStatus === "Đã thanh toán") && (
            <Button
              className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleGenerateInvoice}
            >
              Tạo hóa đơn PDF
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.orderStatus)}
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Trạng thái đơn hàng:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trạng thái giao hàng:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.shippingStatus)}`}>
                      {order.shippingStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Thanh toán:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === "Đã thanh toán" 
                        ? "text-green-600 bg-green-100 dark:bg-green-900"
                        : "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.orderStatus === "Đã hủy" && order.cancelReason && (
                    <div className="text-sm text-gray-500 italic">
                      Lý do hủy: {order.cancelReason}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
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
                        //  onError={(e) => {
                        //    const img = e.currentTarget as HTMLImageElement;
                        //    if (!img.src.includes("default-avatar.png")) {
                        //      img.src = "/default-avatar.png";
                        //    }
                        //  }}
                       />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.productName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Số lượng: {item.quantity} x {item.price.toLocaleString()}₫
                        </p>
                        {item.weight && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Trọng lượng: {item.weight}
                          </p>
                        )}
                        {item.goldAge && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tuổi vàng: {item.goldAge}
                          </p>
                        )}
                        {item.category && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Loại: {item.category}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-rose-500">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Người nhận:</strong> {order.receiverName}</p>
                  <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                  <p><strong>Số điện thoại:</strong> {order.customerPhone}</p>
                  {order.note && (
                    <p><strong>Ghi chú:</strong> {order.note}</p>
                  )}
                  {order.orderStatus === "Đã hủy" && order.cancelReason && (
                    <p><strong>Lý do hủy:</strong> <span className="text-red-600">{order.cancelReason}</span></p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{order.subtotal.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span>{order.shippingFee === 0 ? "Miễn phí" : order.shippingFee.toLocaleString() + "₫"}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{order.discount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-rose-500">{order.total.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Phương thức:</strong> {order.paymentMethod === "COD" ? "Tiền mặt khi nhận hàng" : "VNPAY"}</p>
                  <p><strong>Trạng thái:</strong> {order.paymentStatus}</p>
                  {order.transactionId && (
                    <p><strong>Mã giao dịch:</strong> {order.transactionId}</p>
                  )}
                  {order.paidAt && (
                    <p><strong>Ngày thanh toán:</strong> {new Date(order.paidAt).toLocaleDateString("vi-VN")}</p>
                  )}
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
                  <p><strong>Tạo đơn:</strong> {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <p><strong>Cập nhật:</strong> {new Date(order.updatedAt).toLocaleString("vi-VN")}</p>
                  )}
                  {order.paidAt && (
                    <p><strong>Thanh toán:</strong> {new Date(order.paidAt).toLocaleString("vi-VN")}</p>
                  )}
                  {order.shippedAt && (
                    <p><strong>Giao hàng:</strong> {new Date(order.shippedAt).toLocaleString("vi-VN")}</p>
                  )}
                  {order.deliveredAt && (
                    <p><strong>Hoàn thành:</strong> {new Date(order.deliveredAt).toLocaleString("vi-VN")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {order.orderStatus === "Chưa xử lý" && (
        <Button
          variant="destructive"
          onClick={() => setShowCancelDialog(true)}
        >
          Hủy đơn hàng
        </Button>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md rounded-xl p-6 animate-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center text-xl font-bold">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Hủy đơn hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-base text-gray-700">
              Vui lòng nhập lý do hủy đơn hàng của bạn:
            </p>
            <textarea
              placeholder="Nhập lý do hủy đơn hàng (ví dụ: Đổi ý, đặt nhầm, giá cao...)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[100px] w-full rounded-lg border border-gray-300 focus:border-rose-500 focus:outline-none text-base p-3 resize-none"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="rounded-lg px-6 py-2"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!cancelReason.trim()) {
                    alert("Vui lòng nhập lý do hủy đơn");
                    return;
                  }
                  setIsCancelling(true);
                  try {
                    const response = await fetch(`http://localhost:9003/api/orders/${order.id}/cancel`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ reason: cancelReason.trim() }),
                    });
                    if (response.ok) {
                      setShowCancelDialog(false);
                      setCancelReason("");
                      window.location.reload();
                    } else {
                      alert("Có lỗi xảy ra khi hủy đơn hàng");
                    }
                  } catch (error) {
                    console.error("Error cancelling order:", error);
                    alert("Có lỗi xảy ra khi hủy đơn hàng");
                  } finally {
                    setIsCancelling(false);
                  }
                }}
                disabled={isCancelling || !cancelReason.trim()}
                className="rounded-lg px-6 py-2 font-semibold bg-rose-500 hover:bg-rose-600"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 