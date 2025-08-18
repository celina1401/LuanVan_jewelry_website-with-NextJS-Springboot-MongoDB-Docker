"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { LoadingSpinner, OrdersEmptyState, ErrorBoundary, ApiErrorDisplay, StatusBadge } from "@/lib/index";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Save, Search, Eye } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";


const ORDER_TABS = [
    { label: "Tất cả đơn hàng", value: "all" },
    { label: "Chưa thanh toán", value: "unpaid" },
    { label: "Xử lý giao hàng", value: "shipping" },
    { label: "Hàng order", value: "order" },
];


interface Order {
    id: string; // orderId thực
    orderNumber: string; // mã đơn hàng để hiển thị
    customer: string;
    status: string;
    payment: string;
    shippingStatus: string;
    method: string;
    total: number;
    channel: string;
    createdAt: string;
    // Add missing properties for order details
    receiverName?: string;
    receiverAddress?: string;
    cancelReason?: string;
    items?: Array<{
        productName: string;
        productImage?: string;
        quantity: number;
        price: number;
        totalPrice?: number;
    }>;
    // Thêm các trường lấy chi tiết đơn hàng
    shippingAddress?: string;
    orderStatus?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    discount?: number;
    shippingFee?: number;
}



function getShippingStatus(order: string) {
    if (order === "Đã giao hàng") return "success";
    if (order === "Giao hàng thất bại") return "error";
    if (order === "Chưa giao hàng") return "warning";
    return "info";
}

function getPaymentBadgeClass(method?: string | null): string {
    const normalized = (method || "").toUpperCase();
    switch (normalized) {
        case "VNPAY":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
        case "COD":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-black dark:text-gray-300";
    }
}

function getOrderStatusColor(status: string): string {
    switch (status) {
        case "Chưa xử lý":
            return "bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200";
        case "Đã nhận đơn":
            return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
        case "Đang đóng gói":
            return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
        case "Chờ giao hàng":
            return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
        case "Đã hủy":
            return "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 font-semibold border border-red-300 dark:border-red-600"; // ✅ đậm hơn
        default:
            return "bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200";
    }
}




function getOrderStatusBadge(status: string): "success" | "warning" | "error" | "info" {
    switch (status) {
        case "Đã nhận đơn":
            return "info";
        case "Đang đóng gói":
            return "warning";
        case "Chờ giao hàng":
            return "success";
        case "Chưa xử lý":
            return "info";
        case "Đã hủy":
            return "error"; // ✅ dùng badge màu đỏ
        default:
            return "info";
    }
}



function getShippingTriggerClass(status: string): string {
    switch (status) {
        case "Đã giao hàng":
            return "bg-green-100 dark:bg-green-900 ";
        case "Chưa giao hàng":
            return "bg-yellow-100 dark:bg-yellow-900 ";
        case "Giao hàng thất bại":
            return "bg-red-100 dark:bg-red-900 ";
        case "Đang giao":
            return "bg-blue-100 dark:bg-blue-900 ";
        default:
            return "bg-gray-100 dark:bg-black ";
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<string[]>([]);


    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetail, setShowDetail] = useState(false);


    async function handleViewDetail(orderNumber: string) {
        try {
            const res = await fetch(`http://localhost:9003/api/orders/number/${orderNumber}`);
            if (!res.ok) throw new Error("Không thể lấy chi tiết đơn hàng");
            const data = await res.json();
            // Đảm bảo selectedOrder có id là orderId thực
            // setSelectedOrder(prev => ({ ...data, id: data.id }));
            setSelectedOrder(prev => ({
                ...data,
                id: data.id,
                discount: data.discount || 0,
                shippingFee: data.shippingFee || 0
            }));

            setShowDetail(true);
        } catch (err) {
            console.error("❌ Lỗi khi lấy chi tiết đơn hàng", err);
        }
    }

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("http://localhost:9003/api/orders");

                if (!res.ok) {
                    throw new Error("Lỗi khi gọi API lấy đơn hàng");
                }

                const data = await res.json();

                const mappedOrders: Order[] = data.map((order: any) => ({
                    id: order.id, // orderId thực
                    orderNumber: order.orderNumber, // mã đơn hàng
                    customer: order.receiverName || "Không rõ",
                    status: order.orderStatus === "Chưa xử lý" ? "Chưa xử lý" : order.orderStatus,
                    payment: order.paymentStatus,
                    shippingStatus: order.shippingStatus || "Chưa giao hàng",
                    method: order.paymentMethod,
                    total: order.total,
                    channel: order.channel,
                    createdAt: order.createdAt,
                    receiverName: order.receiverName,
                    receiverAddress: order.receiverAddress,
                    cancelReason: order.cancelReason,
                    items: order.items,
                    shippingAddress: order.shippingAddress,
                    orderStatus: order.orderStatus,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                }));


                setOrders(mappedOrders);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách đơn hàng.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [tab, search, filters]);

    const filteredOrders = orders.filter(order => {
        if (tab !== "all" && order.status !== tab) return false;
        if (search && !order.customer.toLowerCase().includes(search.toLowerCase()) && !order.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    useEffect(() => {
        if (showDetail) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [showDetail]);


    return (
        <>
            <ErrorBoundary>
                <div className="p-6">
                    <PageHeader
                        title="Danh sách đơn hàng"
                        description="Quản lý, tìm kiếm và lọc các đơn hàng của khách hàng."
                        actions={[{ label: "Tạo đơn hàng", icon: "plus", variant: "default", onClick: () => alert("Tạo đơn hàng mới") }]}
                    />
                    <div className="flex flex-wrap gap-2 mt-6 mb-4">
                        {ORDER_TABS.map((t) => (
                            <Button
                                key={t.value}
                                variant={tab === t.value ? "default" : "outline"}
                                size="sm"
                                className={`rounded-full px-4 transition-colors ${tab === t.value ? '' : 'hover:bg-primary/10 dark:hover:bg-primary/20'}`}
                                onClick={() => setTab(t.value)}
                            >
                                {t.label}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Button variant="outline" size="sm" className="gap-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setFilters([...filters, "Bộ lọc mẫu"])}>
                            <Filter className="h-4 w-4" /> Thêm điều kiện lọc
                        </Button>
                        {filters.map((f, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-200 rounded px-2 py-1 text-xs flex items-center gap-1">
                                {f}
                                <button onClick={() => setFilters(filters.filter((_, i) => i !== idx))} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                            </span>
                        ))}
                        <Input placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)} className="w-64 max-w-full ml-2" />
                        <Button variant="outline" size="sm" className="ml-auto gap-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                            <Save className="h-4 w-4" /> Lưu bộ lọc
                        </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border bg-white dark:bg-muted">
                        {loading ? (
                            <LoadingSpinner text="Đang tải danh sách đơn hàng..." />
                        ) : error ? (
                            <ApiErrorDisplay error={error} onRetry={() => window.location.reload()} />
                        ) : filteredOrders.length === 0 ? (
                            <OrdersEmptyState />
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className=" bg-gradient-to-r from-rose-100/80 to-rose-200/80 dark:from-[#23232b] dark:to-[#18181b] border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Mã</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Ngày tạo</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Khách hàng</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Trạng thái đơn hàng</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Thanh toán</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Giao hàng</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Phương thức thanh toán</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-white">Tổng tiền</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-white">Thao tác</th>
                                    </tr>

                                </thead>
                                <tbody className="bg-white dark:bg-black">
                                    {filteredOrders.map((order, idx) => (
                                        <tr key={order.id} className="transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                            <td className="px-4 py-2 font-mono text-sm text-blue-600 hover:underline cursor-pointer">#{order.orderNumber}</td>
                                            <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                                            <td className="px-4 py-2 text-sm text-black dark:text-white">{order.customer}</td>
                                            <td className="px-4 py-2 min-w-[160px]">
                                                <Select
                                                    disabled={order.status === "Đã hủy"}
                                                    onValueChange={async (value) => {
                                                        const previousStatus = order.status;
                                                        setOrders((prev) =>
                                                            prev.map((o, i) => (i === idx ? { ...o, status: value } : o))
                                                        );

                                                        try {
                                                            const res = await fetch(`/api/orders/${order.orderNumber}/update`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'status', orderStatus: value }),
                                                            });

                                                            if (!res.ok) {
                                                                console.error('❌ Lỗi khi cập nhật trạng thái đơn hàng');
                                                                toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
                                                                // Revert the change if failed
                                                                setOrders((prev) =>
                                                                    prev.map((o, i) => (i === idx ? { ...o, status: previousStatus } : o))
                                                                );
                                                            } else {
                                                                console.log('✅ Đã cập nhật trạng thái đơn hàng');
                                                                toast.success(`Đã cập nhật trạng thái đơn hàng #${order.orderNumber} thành "${value}"`);
                                                            }
                                                        } catch (err) {
                                                            console.error('❌ Lỗi network khi cập nhật trạng thái đơn hàng:', err);
                                                            toast.error('Lỗi kết nối khi cập nhật trạng thái đơn hàng');
                                                            // Revert the change if failed
                                                            setOrders((prev) =>
                                                                prev.map((o, i) => (i === idx ? { ...o, status: previousStatus } : o))
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        className={cn(
                                                            "w-full h-8 rounded-md px-2",
                                                            getOrderStatusColor(order.status), // 💡 Nền theo trạng thái
                                                            "border border-gray-300 dark:border-zinc-600 shadow-sm",
                                                            "focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                                                        )}
                                                    >
                                                        <div className="w-full flex items-center justify-between gap-2 truncate">
                                                            <span
                                                                className={cn(
                                                                    "text-xs font-medium px-2 py-1 rounded-full truncate",
                                                                    getOrderStatusColor(order.status)
                                                                )}
                                                            >
                                                                {order.status}
                                                            </span>

                                                        </div>
                                                    </SelectTrigger>

                                                    <SelectContent className="rounded-md shadow-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 z-50">
                                                        {[
                                                            "Chưa xử lý",
                                                            "Đã nhận đơn",
                                                            "Đang đóng gói",
                                                            "Chờ giao hàng",
                                                        ].map((status) => (
                                                            <SelectItem
                                                                key={status}
                                                                value={status}
                                                                className="text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                                            >
                                                                <StatusBadge
                                                                    status={getOrderStatusBadge(status)}
                                                                    label={status}
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="truncate"
                                                                />
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>

                                                </Select>
                                            </td>

                                            <td className="px-4 py-2">
                                                <StatusBadge
                                                    status={
                                                        order.payment === "Lỗi thanh toán"
                                                            ? "error"
                                                            : order.payment === "Chưa xử lý"
                                                                ? "pending"
                                                                : order.payment === "Thanh toán một phần"
                                                                    ? "warning"
                                                                    : "success"
                                                    }
                                                    label={order.payment}
                                                    size="sm"
                                                    className="truncate"
                                                />

                                            </td>
                                            <td className="px-4 py-2 min-w-[140px]">
                                                {order.status === "Đã hủy" ? (
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                                                        Đơn hàng bị hủy
                                                    </span>
                                                ) : (
                                                <Select
                                                    disabled={order.status !== "Chờ giao hàng"}
                                                    onValueChange={async (value) => {
                                                        const previousShippingStatus = order.shippingStatus;
                                                        setOrders((prev) =>
                                                            prev.map((o, i) => (i === idx ? { ...o, shippingStatus: value } : o))
                                                        );

                                                        try {
                                                            const res = await fetch(`/api/orders/${order.orderNumber}/update`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'shipping', shippingStatus: value }),
                                                            });

                                                            if (!res.ok) {
                                                                console.error('❌ Lỗi khi cập nhật trạng thái giao hàng');
                                                                toast.error('Lỗi khi cập nhật trạng thái giao hàng');
                                                                // Revert the change if failed
                                                                setOrders((prev) =>
                                                                    prev.map((o, i) => (i === idx ? { ...o, shippingStatus: previousShippingStatus } : o))
                                                                );
                                                            } else {
                                                                console.log('✅ Đã cập nhật trạng thái giao hàng');
                                                                toast.success(`Đã cập nhật trạng thái giao hàng đơn hàng #${order.orderNumber} thành "${value}"`);
                                                            }
                                                        } catch (err) {
                                                            console.error('❌ Lỗi network khi cập nhật giao hàng:', err);
                                                            toast.error('Lỗi kết nối khi cập nhật trạng thái giao hàng');
                                                            // Revert the change if failed
                                                            setOrders((prev) =>
                                                                prev.map((o, i) => (i === idx ? { ...o, shippingStatus: previousShippingStatus } : o))
                                                            );
                                                        }
                                                    }}
                                                >

                                                    <SelectTrigger className={cn("w-full h-8 rounded-md px-2", getShippingTriggerClass(order.shippingStatus), "border border-gray-300 dark:border-zinc-600 shadow-sm", "focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors")}>
                                                        <div className="w-full flex items-center justify-between gap-2 truncate">
                                                            <StatusBadge status={
                                                                getShippingStatus(order.shippingStatus)}
                                                                label={order.shippingStatus}
                                                                size="sm" className="truncate"
                                                                variant="default" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-md shadow-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 z-50">
                                                        {[
                                                            "Đã giao hàng",
                                                            "Chưa giao hàng",
                                                            "Giao hàng thất bại",
                                                            "Đang giao"
                                                        ].map((status) => (
                                                            <SelectItem key={status} value={status} className="text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                                                <StatusBadge status={
                                                                    getShippingStatus(status)}
                                                                    label={status} size="sm"
                                                                    className="truncate"
                                                                    variant="default" />
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPaymentBadgeClass(order.method)}`}>
                                                    {order.method === "COD" ? "Tiền mặt" : order.method}
                                                </span>
                                            </td>

                                            <td className="px-4 py-2 text-right text-sm text-rose-500 font-medium">
                                                {order.total.toLocaleString()}₫
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={() => handleViewDetail(order.orderNumber)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        )}
                    </div>

                </div>
            </ErrorBoundary>
            {showDetail && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    {/* <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-3xl w-full shadow-xl relative"> */}
                    <div className="bg-white dark:bg-black p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">

                        <button className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold" onClick={() => setShowDetail(false)}>
                            ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
                        <div className="mb-4 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                            <p><strong>Khách hàng:</strong> {selectedOrder.receiverName || '-'}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || '-'}</p>
                            <p><strong>Trạng thái:</strong>
                                {/* {selectedOrder.orderStatus || '-'} */}
                                <select
                                    value={selectedOrder.orderStatus}
                                    onChange={e => setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value })}
                                    className="border rounded px-2 py-1 ml-2"
                                >
                                    <option value="Chưa xử lý">Chưa xử lý</option>
                                    <option value="Đã nhận đơn">Đã nhận đơn</option>
                                    <option value="Đang đóng gói">Đang đóng gói</option>
                                    <option value="Chờ giao hàng">Chờ giao hàng</option>
                                    {/* <option value="Đã hủy">Đã hủy</option> */}
                                </select>
                            </p>
                            <p><strong>Trạng thái giao hàng:</strong> {selectedOrder.orderStatus === "Đã hủy" ? (
                                <span className="text-red-600 font-semibold">Đơn hàng bị hủy</span>
                              ) : (selectedOrder.shippingStatus || '-')}
                            </p>
                            {selectedOrder.orderStatus === "Đã hủy" && selectedOrder.cancelReason && (
                              <p className="mt-1"><strong>Lý do hủy:</strong> <span className="text-red-600">{selectedOrder.cancelReason}</span></p>
                            )}
                            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng' : selectedOrder.paymentMethod || '-'}</p>
                            <p><strong>Trạng thái thanh toán:</strong>{" "}
                                {selectedOrder.paymentStatus === "Lỗi thanh toán" || selectedOrder.paymentStatus === "Chưa xử lý"
                                    ? <span className="text-red-500 font-semibold">Chưa thanh toán</span>
                                    : selectedOrder.paymentStatus === "Đã thanh toán"
                                        ? <span className="text-green-600 font-semibold">Đã thanh toán</span>
                                        : selectedOrder.paymentStatus || "-"}
                                {selectedOrder.paymentMethod === "COD" && selectedOrder.paymentStatus !== "Đã thanh toán" && (
                                    <button
                                        className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/orders/${selectedOrder.orderNumber}/update`, {
                                                    method: "PUT",
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'payment', paymentStatus: 'Đã thanh toán' }),
                                                });
                                                
                                                if (!res.ok) {
                                                    toast.error('Lỗi khi cập nhật trạng thái thanh toán');
                                                } else {
                                                    setSelectedOrder({ ...selectedOrder, paymentStatus: "Đã thanh toán" });
                                                    setOrders((prev) =>
                                                        prev.map((o) =>
                                                            o.id === selectedOrder.id
                                                                ? { ...o, payment: "Đã thanh toán" }
                                                                : o
                                                        )
                                                    );
                                                    toast.success(`Đã xác nhận thanh toán cho đơn hàng #${selectedOrder.orderNumber}`);
                                                }
                                            } catch (error) {
                                                console.error('❌ Lỗi khi cập nhật trạng thái thanh toán:', error);
                                                toast.error('Lỗi kết nối khi cập nhật trạng thái thanh toán');
                                            }
                                        }}
                                    >
                                        Xác nhận đã thanh toán
                                    </button>
                                )}
                            </p>
                            {/* <p><strong>Thành tiền:</strong> {Number(selectedOrder.total).toLocaleString()}₫</p> */}
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="text-base font-semibold mb-2">Sản phẩm đã đặt</h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {selectedOrder.items?.map((item: { productName: string; productImage?: string; quantity: number; price: number; totalPrice?: number }, index: number) => (
                                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                        {item.productImage && (
                                            <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.productName}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Số lượng: {item.quantity} x {item.price.toLocaleString()}₫
                                            </p>
                                        </div>
                                        <div className="text-right font-semibold text-rose-500">
                                            {(item.totalPrice ?? item.price * item.quantity).toLocaleString()}₫
                                        </div>

                                    </div>

                                ))}
                            </div>

                            <div className="mt-6 border-t pt-4 text-right space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div>
                                    Giảm giá:{" "}
                                    <span className="text-rose-500 font-medium">
                                        {Number(selectedOrder.discount || 0).toLocaleString()}₫
                                    </span>
                                </div>

                                <div>
                                    Phí vận chuyển:{" "}
                                    {Number(selectedOrder.shippingFee || 0) === 0 ? (
                                        <span className="text-emerald-500 font-medium">Freeship</span>
                                    ) : (
                                        <span className="text-emerald-500 font-medium">
                                            {Number(selectedOrder.shippingFee).toLocaleString()}₫
                                        </span>
                                    )}
                                </div>

                                <div className="text-lg font-bold text-rose-600">
                                    Tổng cộng:{" "}
                                    {(
                                        Number(selectedOrder.total || 0) -
                                        Number(selectedOrder.discount || 0) +
                                        Number(selectedOrder.shippingFee || 0)
                                    ).toLocaleString()}
                                    ₫
                                </div>
                            </div>



                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={async () => {
                                    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
                                        try {
                                            const response = await fetch(`/api/orders/${selectedOrder.orderNumber}`, { 
                                                method: "DELETE" 
                                            });
                                            
                                            if (response.ok) {
                                                // Xóa đơn hàng khỏi state
                                                setOrders(prev => prev.filter(order => order.orderNumber !== selectedOrder.orderNumber));
                                                
                                                // Đóng modal
                                                setShowDetail(false);
                                                
                                                // Hiển thị thông báo thành công
                                                toast.success(`Đơn hàng #${selectedOrder.orderNumber} đã được xóa.`);
                                            } else {
                                                // Thử parse JSON response, nếu không được thì dùng text
                                                let errorMessage = "Lỗi khi xóa đơn hàng";
                                                try {
                                                    const errorData = await response.json();
                                                    errorMessage = errorData.message || errorData.error || errorMessage;
                                                } catch {
                                                    // Nếu không parse được JSON, thử lấy text
                                                    try {
                                                        const errorText = await response.text();
                                                        errorMessage = errorText || errorMessage;
                                                    } catch {
                                                        // Nếu không lấy được text, dùng status text
                                                        errorMessage = response.statusText || errorMessage;
                                                    }
                                                }
                                                throw new Error(errorMessage);
                                            }
                                        } catch (error) {
                                            console.error("❌ Lỗi khi xóa đơn hàng:", error);
                                            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra trong quá trình xóa đơn hàng.");
                                        }
                                    }
                                }}
                            >
                                Xóa đơn hàng
                            </button>

                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={async () => {
                                    const original = orders.find(o => o.id === selectedOrder.id);
                                    try {
                                        let hasUpdate = false;

                                        if (selectedOrder.orderStatus && selectedOrder.orderStatus !== original?.status) {
                                            await fetch(`/api/orders/${selectedOrder.orderNumber}/update`, {
                                                method: "PUT",
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ action: 'status', orderStatus: selectedOrder.orderStatus }),
                                            });
                                            hasUpdate = true;
                                        }

                                        if (selectedOrder.shippingStatus && selectedOrder.shippingStatus !== original?.shippingStatus) {
                                            await fetch(`/api/orders/${selectedOrder.orderNumber}/update`, {
                                                method: "PUT",
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ action: 'shipping', shippingStatus: selectedOrder.shippingStatus }),
                                            });
                                            hasUpdate = true;
                                        }

                                        if (selectedOrder.paymentStatus && selectedOrder.paymentStatus !== original?.payment) {
                                            await fetch(`/api/orders/${selectedOrder.orderNumber}/update`, {
                                                method: "PUT",
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ action: 'payment', paymentStatus: selectedOrder.paymentStatus }),
                                            });
                                            hasUpdate = true;
                                        }

                                        if (hasUpdate) {
                                            toast.success(`Thông tin đơn hàng #${selectedOrder.id} đã được cập nhật.`);
                                        } else if (!hasUpdate) {
                                            toast.warning("Bạn chưa chỉnh sửa gì để cập nhật.");
                                        } else {
                                            toast.error("Vui lòng kiểm tra lại kết nối.");
                                        }


                                        // Cập nhật lại state
                                        setOrders(prev => prev.map(o =>
                                            o.id === selectedOrder.id
                                                ? {
                                                    ...o,
                                                    status: selectedOrder.orderStatus ?? o.status,
                                                    shippingStatus: selectedOrder.shippingStatus ?? o.shippingStatus,
                                                    payment: selectedOrder.paymentStatus ?? o.payment,
                                                }
                                                : o
                                        ));

                                        // Đóng popup
                                        setShowDetail(false);
                                    } catch (error) {
                                        console.error("❌ Lỗi khi cập nhật đơn hàng:", error);
                                        toast.error("Có lỗi xảy ra trong quá trình cập nhật đơn hàng.");
                                    }
                                }}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );


}
