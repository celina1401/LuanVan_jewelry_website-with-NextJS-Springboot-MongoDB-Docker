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
    shipping: string;
    cod: string;
    total: number;
    channel: string;
    createdAt: string;
}

function getShippingStatus(order: string) {
    if (order === "Đã giao") return "success";
    if (order === "Hủy") return "error";
    if (order === "Chưa giao hàng") return "warning";
    return "info";
}

function getShippingTriggerClass(status: string): string {
    switch (status) {
        case "Đã giao":
            return "bg-green-100 dark:bg-green-900 ";
        case "Chưa giao hàng":
            return "bg-yellow-100 dark:bg-yellow-900 ";
        case "Hủy":
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
                await new Promise((res) => setTimeout(res, 800));
                setOrders([
                    { id: "M103578", customer: "Lan", status: "Tự giao", payment: "Chờ xử lý", shipping: "Đã giao", cod: "Đã nhận", total: 1150000, channel: "Web", createdAt: "2022-04-01T16:31:00" },
                    { id: "M103577", customer: "TRÂM ĐẶNG", status: "Hủy", payment: "Chờ xử lý", shipping: "Hủy", cod: "Chưa nhận", total: 1150000, channel: "Web", createdAt: "2022-04-01T16:30:00" },
                    { id: "M103576", customer: "fff", status: "Tự giao", payment: "Chờ xử lý", shipping: "Đã giao", cod: "Đã nhận", total: 1150000, channel: "Web", createdAt: "2022-04-01T16:29:00" },
                    { id: "M103575", customer: "Khánh", status: "Tự giao", payment: "Thanh toán một phần", shipping: "Đã giao", cod: "Đã nhận", total: 600000, channel: "Web", createdAt: "2022-04-01T15:40:00" },
                    { id: "M103571", customer: "H", status: "Chờ xử lý", payment: "Chờ xử lý", shipping: "Chưa giao hàng", cod: "Chưa nhận", total: 900000, channel: "Web", createdAt: "2022-04-01T10:48:00" },
                ]);
            } catch (err) {
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
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">COD</th>
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
                                        <td className="px-4 py-2">
                                            <StatusBadge status={order.status === "Hủy" ? "error" : order.status === "Tự giao" ? "info" : order.status === "Chờ xử lý" ? "pending" : "success"} label={order.status} size="sm" className="truncate" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={order.payment === "Chờ xử lý" ? "pending" : order.payment === "Thanh toán một phần" ? "warning" : "success"} label={order.payment} size="sm" className="truncate" />
                                        </td>
                                        <td className="px-4 py-2 min-w-[140px]">
                                            <Select value={order.shipping} onValueChange={(value) => setOrders((prev) => prev.map((o, i) => (i === idx ? { ...o, shipping: value } : o)))}>
                                                <SelectTrigger className={cn("w-full h-8 rounded-md px-2", getShippingTriggerClass(order.shipping), "border border-gray-300 dark:border-zinc-600 shadow-sm", "focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors")}>                                                
                                                    <div className="w-full flex items-center justify-between gap-2 truncate">
                                                        <StatusBadge status={getShippingStatus(order.shipping)} label={order.shipping} size="sm" className="truncate" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-md shadow-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 z-50">
                                                    {[
                                                        "Đã giao",
                                                        "Chưa giao hàng",
                                                        "Hủy",
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
                                            <StatusBadge status={order.cod === "Đã nhận" ? "success" : order.cod === "Chưa nhận" ? "warning" : "info"} label={order.cod} size="sm" className="truncate" />
                                        </td>
                                        <td className="px-4 py-2 text-right font-semibold text-rose-500">
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
