"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import AdminChatInbox from "@/app/components/chatbox/AdminChatInbox";
import AdminChatDetail from "@/app/components/chatbox/AdminChatDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ShoppingCart, DollarSign, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { GoldPriceChart } from "@/components/ui/gold-price-chart";

// Force dynamic rendering for pages that use Clerk
export const dynamic = 'force-dynamic';

// Types
interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalVisitors: number;
  totalOrders: number;
  salesChange: number;
  revenueChange: number;
  visitorsChange: number;
  ordersChange: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  customerName: string;
  items?: Array<{ quantity?: number }>;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Constants
// const API_BASE_URL = "http://localhost:8080/api";

// Utility functions for time calculations
const getVietnamTime = () => {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
};

const getCurrentMonthStart = () => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), 1);
};

const getCurrentMonthEnd = () => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getPreviousMonthStart = () => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth() - 1, 1);
};

const getPreviousMonthEnd = () => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), 0, 23, 59, 59, 999);
};

const isDateInRange = (dateString: string, startDate: Date, endDate: Date) => {
  const date = new Date(dateString);
  const vietnamDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return vietnamDate >= startDate && vietnamDate <= endDate;
};

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    totalOrders: 0,
    salesChange: 0,
    revenueChange: 0,
    visitorsChange: 0,
    ordersChange: 0,
  });
  const [lineData, setLineData] = useState<ChartData[]>([]);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      
      let orders: OrderData[] = [];
      let users: UserData[] = [];
      
      // Fetch orders for revenue and sales calculations
      try {
        const token = await getToken();
        const ordersResponse = await fetch(`http://localhost:9003/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (ordersResponse.ok) {
          orders = await ordersResponse.json();
        } else {
          console.warn('Orders API failed:', ordersResponse.status);
          // Use sample data for orders
          orders = [
            {
              id: "1",
              orderNumber: "ORD001",
              total: 1500000,
              orderStatus: "completed",
              paymentStatus: "paid",
              createdAt: new Date().toISOString(),
              customerName: "Nguyễn Văn A",
              items: [{ quantity: 2 }]
            },
            {
              id: "2", 
              orderNumber: "ORD002",
              total: 2300000,
              orderStatus: "completed",
              paymentStatus: "paid",
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              customerName: "Trần Thị B",
              items: [{ quantity: 1 }]
            }
          ];
        }
      } catch (error) {
        console.warn('Orders API error:', error);
        // Use sample data
        orders = [
          {
            id: "1",
            orderNumber: "ORD001", 
            total: 1500000,
            orderStatus: "completed",
            paymentStatus: "paid",
            createdAt: new Date().toISOString(),
            customerName: "Nguyễn Văn A",
            items: [{ quantity: 2 }]
          }
        ];
      }
      
      // Fetch users for visitor count
      try {
        // Sử dụng endpoint đúng và thêm authentication
        const token = await getToken();
        const usersResponse = await fetch(`http://localhost:9001/api/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (usersResponse.ok) {
          users = await usersResponse.json();
        } else {
          console.warn('Users API failed:', usersResponse.status);
          // Use sample data for users
          users = [
            {
              id: "1",
              username: "user1",
              email: "user1@example.com",
              createdAt: new Date().toISOString()
            },
            {
              id: "2",
              username: "user2", 
              email: "user2@example.com",
              createdAt: new Date().toISOString()
            }
          ];
        }
      } catch (error) {
        console.warn('Users API error:', error);
        // Use sample data
        users = [
          {
            id: "1",
            username: "user1",
            email: "user1@example.com", 
            createdAt: new Date().toISOString()
          }
        ];
      }
      
      // Calculate current period stats (this month) - Vietnam timezone
      const currentMonthStart = getCurrentMonthStart();
      const currentMonthEnd = getCurrentMonthEnd();
      
      const currentPeriodOrders = orders.filter(order => {
        return isDateInRange(order.createdAt, currentMonthStart, currentMonthEnd);
      });
      
      // Calculate previous period stats (last month) - Vietnam timezone
      const previousMonthStart = getPreviousMonthStart();
      const previousMonthEnd = getPreviousMonthEnd();
      
      const previousPeriodOrders = orders.filter(order => {
        return isDateInRange(order.createdAt, previousMonthStart, previousMonthEnd);
      });
      
      // Calculate statistics
      const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = currentPeriodOrders.length;
      const totalSales = currentPeriodOrders.reduce((sum, order) => {
        const itemCount = order.items?.length || 1;
        return sum + itemCount;
      }, 0);
      const totalVisitors = users.length;
      
      // Calculate changes
      const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousOrders = previousPeriodOrders.length;
      const previousSales = previousPeriodOrders.reduce((sum, order) => {
        const itemCount = order.items?.length || 1;
        return sum + itemCount;
      }, 0);
      const previousVisitors = Math.floor(users.length * 0.9); // Estimate previous visitors
      
      const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersChange = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
      const salesChange = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;
      const visitorsChange = previousVisitors > 0 ? ((totalVisitors - previousVisitors) / previousVisitors) * 100 : 0;
      
      setStats({
        totalSales,
        totalRevenue,
        totalVisitors,
        totalOrders,
        salesChange,
        revenueChange,
        visitorsChange,
        ordersChange,
      });
      
      // Generate chart data
      generateChartData(orders);
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Không thể tải dữ liệu thống kê, sử dụng dữ liệu mẫu");
      
      // Set fallback stats
      setStats({
        totalSales: 5,
        totalRevenue: 5000000,
        totalVisitors: 25,
        totalOrders: 8,
        salesChange: 12.5,
        revenueChange: 8.3,
        visitorsChange: 15.2,
        ordersChange: 10.5,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate chart data from orders
  const generateChartData = (orders: OrderData[]) => {
    // Generate monthly revenue data for the last 12 months - Vietnam timezone
    const monthlyData: { [key: string]: number } = {};
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Calculate revenue for each month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const vietnamDate = new Date(orderDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const monthIndex = vietnamDate.getMonth();
      const monthName = months[monthIndex];
      monthlyData[monthName] += order.total || 0;
    });
    
    // Convert to chart format
    const chartData = months.map(month => ({
      name: month,
      value: Math.round(monthlyData[month])
    }));
    
    setLineData(chartData);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Stat cards data
  const statCards = [
    {
      label: "Doanh số",
      value: formatNumber(stats.totalSales),
      icon: <ShoppingCart className="text-blue-500 bg-blue-100 rounded-full p-1" size={28} />,
      change: formatPercentage(stats.salesChange),
      changeType: stats.salesChange >= 0 ? "up" : "down",
      description: "So với tháng trước",
    },
    {
      label: "Doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="text-indigo-500 bg-indigo-100 rounded-full p-1" size={28} />,
      change: formatPercentage(stats.revenueChange),
      changeType: stats.revenueChange >= 0 ? "up" : "down",
      description: "So với tháng trước",
    },
    {
      label: "Khách truy cập",
      value: formatNumber(stats.totalVisitors),
      icon: <Users className="text-green-500 bg-green-100 rounded-full p-1" size={28} />,
      change: formatPercentage(stats.visitorsChange),
      changeType: stats.visitorsChange >= 0 ? "up" : "down",
      description: "So với tháng trước",
    },
    {
      label: "Đơn hàng",
      value: formatNumber(stats.totalOrders),
      icon: <Package className="text-cyan-500 bg-cyan-100 rounded-full p-1" size={28} />,
      change: formatPercentage(stats.ordersChange),
      changeType: stats.ordersChange >= 0 ? "up" : "down",
      description: "So với tháng trước",
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="flex min-h-screen bg-[#f5f4fa] dark:bg-background">
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span>Bảng điều khiển</span>
          </h2>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 mb-8">
          {statCards.map((card) => (
            <Card key={card.label} className="shadow border-0">
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">{card.label}</span>
                  {card.icon}
                </div>
                <div className="text-3xl font-bold text-black dark:text-white">{card.value}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-semibold flex items-center gap-1 ${card.changeType === "up" ? "text-green-600" : "text-red-500"}`}>
                    {card.changeType === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">{card.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <div className="mt-8">
          <GoldPriceChart />
        </div>

        {/* Calendar + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="shadow border-0">
            <CardHeader className="flex flex-row items-center gap-2">
              <CalendarIcon className="text-indigo-500" />
              <CardTitle>Lịch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex items-center justify-center">
                <Calendar className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Thời gian thực</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                <span>Bản đồ thời gian thực sẽ hiển thị ở đây</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
