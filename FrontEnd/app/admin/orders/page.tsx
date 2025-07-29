"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { LoadingSpinner, OrdersEmptyState, ErrorBoundary, ApiErrorDisplay, StatusBadge } from "@/lib/index";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Save, Search } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const ORDER_TABS = [
    { label: "Tất cả đơn hàng", value: "all" },
    { label: "Chưa thanh toán", value: "unpaid" },
    // { label: "momo", value: "momo" },
    // { label: "web", value: "web" },
    { label: "Xử lý giao hàng", value: "shipping" },
    // { label: "test", value: "test" },
    { label: "Hàng order", value: "order" },
    // { label: "SENDO", value: "sendo" },
    // { label: "Shopee", value: "shopee" },
];

interface Order {
    id: string;
    customer: string;
    status: string;
    payment: string;
    shippingStatus: string;
    method: string;
    total: number;
    channel: string;
    createdAt: string;
}

function getShippingStatus(order: string) {
    if (order === "Đã giao hàng") return "success";
    if (order === "Giao hàng thất bại") return "error";
    if (order === "Chưa giao hàng") return "warning";
    return "info";
}

function getPaymentBadgeClass(method: string): string {
    switch (method.toUpperCase()) {
        case "VNPAY":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
        case "COD":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

function getOrderStatusColor(status: string): string {
    switch (status) {
        case "Chưa xử lý":
            return "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200";
        case "Đã nhận đơn":
            return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
        case "Đang đóng gói":
            return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
        case "Chờ giao hàng":
            return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
        case "Đã hủy":
            return "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 font-semibold border border-red-300 dark:border-red-600"; // ✅ đậm hơn
        default:
            return "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200";
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
            return "bg-gray-100 dark:bg-zinc-800 ";
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<string[]>([]);

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
                    id: order.orderNumber,
                    customer: order.receiverName || "Không rõ",
                    status: order.orderStatus === "Chờ xử lý" ? "Chưa xử lý" : order.orderStatus,
                    payment: order.paymentStatus,
                    shippingStatus: order.shippingStatus || "Chưa giao hàng", // ✅ fix ở đây
                    method: order.paymentMethod,
                    total: order.total,
                    channel: order.channel,
                    createdAt: order.createdAt,
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
        if (search && !order.customer.toLowerCase().includes(search.toLowerCase()) && !order.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
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
                        <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded px-2 py-1 text-xs flex items-center gap-1">
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
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái đơn hàng</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thanh toán</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giao hàng</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phương thức thanh toán</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-muted divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order, idx) => (
                                    <tr key={order.id} className="transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80">
                                        <td className="px-4 py-2 font-mono text-sm text-blue-600 hover:underline cursor-pointer">#{order.id}</td>
                                        <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                                        <td className="px-4 py-2 text-sm text-black dark:text-white">{order.customer}</td>
                                        <td className="px-4 py-2 min-w-[160px]">
                                            <Select
                                                disabled={order.status === "Đã hủy"}
                                                onValueChange={async (value) => {
                                                    setOrders((prev) =>
                                                        prev.map((o, i) => (i === idx ? { ...o, status: value } : o))
                                                    );

                                                    try {
                                                        const res = await fetch(`http://localhost:9003/api/orders/${order.id}/status?orderStatus=${encodeURIComponent(value)}`, {
                                                            method: 'PUT',
                                                        });

                                                        if (!res.ok) {
                                                            console.error('❌ Lỗi khi cập nhật trạng thái đơn hàng');
                                                        } else {
                                                            console.log('✅ Đã cập nhật trạng thái đơn hàng');
                                                        }
                                                    } catch (err) {
                                                        console.error('❌ Lỗi network khi cập nhật trạng thái đơn hàng:', err);
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
                                                        <StatusBadge
                                                            status="info"
                                                            label={order.status}
                                                            size="sm"
                                                            className="truncate bg-transparent shadow-none"
                                                        />
                                                    </div>
                                                </SelectTrigger>

                                                <SelectContent className="rounded-md shadow-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 z-50">
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
                                                                className="truncate"
                                                            />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>

                                            </Select>
                                        </td>

                                        <td className="px-4 py-2">
                                            <StatusBadge status={order.payment === "Chờ xử lý" ? "pending" : order.payment === "Thanh toán một phần" ? "warning" : "success"} label={order.payment} size="sm" className="truncate" />
                                        </td>
                                        <td className="px-4 py-2 min-w-[140px]">
                                            <Select
                                                onValueChange={async (value) => {
                                                    setOrders((prev) =>
                                                        prev.map((o, i) => (i === idx ? { ...o, shippingStatus: value } : o))
                                                    );

                                                    try {
                                                        const res = await fetch(`http://localhost:9003/api/orders/${order.id}/shipping?shippingStatus=${encodeURIComponent(value)}`, {
                                                            method: 'PUT',
                                                        });

                                                        if (!res.ok) {
                                                            console.error('❌ Lỗi khi cập nhật trạng thái giao hàng');
                                                        } else {
                                                            console.log('✅ Đã cập nhật trạng thái giao hàng');
                                                        }
                                                    } catch (err) {
                                                        console.error('❌ Lỗi network khi cập nhật giao hàng:', err);
                                                    }
                                                }}
                                            >

                                                <SelectTrigger className={cn("w-full h-8 rounded-md px-2", getShippingTriggerClass(order.shippingStatus), "border border-gray-300 dark:border-zinc-600 shadow-sm", "focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors")}>
                                                    <div className="w-full flex items-center justify-between gap-2 truncate">
                                                        <StatusBadge status={getShippingStatus(order.shippingStatus)} label={order.shippingStatus} size="sm" className="truncate" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md shadow-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 z-50">
                                                    {[
                                                        "Đã giao hàng",
                                                        "Chưa giao hàng",
                                                        "Giao hàng thất bại",
                                                        "Đang giao"
                                                    ].map((status) => (
                                                        <SelectItem key={status} value={status} className="text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                                            <StatusBadge status={getShippingStatus(status)} label={status} size="sm" className="truncate" />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                            <button className="text-blue-600 hover:underline text-sm">Xem chi tiết</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
