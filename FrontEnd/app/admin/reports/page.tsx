// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   DollarSign, 
//   ShoppingCart, 
//   Users, 
//   Package, 
//   BarChart3,
//   Download,
//   Filter
// } from "lucide-react";
// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import { toast } from "sonner";

// interface SalesData {
//   date: string;
//   revenue: number;
//   orders: number;
//   customers: number;
// }

// interface InventoryData {
//   category: string;
//   quantity: number;
//   value: number;
// }

// interface UserActivityData {
//   date: string;
//   newUsers: number;
//   activeUsers: number;
//   orders: number;
// }

// interface ReportStats {
//   totalRevenue: number;
//   totalOrders: number;
//   totalCustomers: number;
//   averageOrderValue: number;
//   revenueChange: number;
//   ordersChange: number;
//   customersChange: number;
// }

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// export default function ReportsPage() {
//   const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState<ReportStats>({
//     totalRevenue: 0,
//     totalOrders: 0,
//     totalCustomers: 0,
//     averageOrderValue: 0,
//     revenueChange: 0,
//     ordersChange: 0,
//     customersChange: 0
//   });

//   const [salesData, setSalesData] = useState<SalesData[]>([]);
//   const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
//   const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([]);

//   // Mock data - trong thực tế sẽ fetch từ API
//   const mockSalesData: SalesData[] = [
//     { date: "2024-01", revenue: 12500000, orders: 45, customers: 38 },
//     { date: "2024-02", revenue: 15800000, orders: 52, customers: 45 },
//     { date: "2024-03", revenue: 14200000, orders: 48, customers: 42 },
//     { date: "2024-04", revenue: 18900000, orders: 61, customers: 53 },
//     { date: "2024-05", revenue: 17500000, orders: 58, customers: 49 },
//     { date: "2024-06", revenue: 20300000, orders: 67, customers: 58 },
//   ];

//   const mockInventoryData: InventoryData[] = [
//     { category: "Nhẫn", quantity: 125, value: 45000000 },
//     { category: "Dây chuyền", quantity: 89, value: 32000000 },
//     { category: "Bông tai", quantity: 156, value: 28000000 },
//     { category: "Lắc tay", quantity: 78, value: 18000000 },
//     { category: "Vòng cổ", quantity: 45, value: 12000000 },
//   ];

//   const mockUserActivityData: UserActivityData[] = [
//     { date: "2024-01", newUsers: 12, activeUsers: 89, orders: 45 },
//     { date: "2024-02", newUsers: 18, activeUsers: 95, orders: 52 },
//     { date: "2024-03", newUsers: 15, activeUsers: 102, orders: 48 },
//     { date: "2024-04", newUsers: 22, activeUsers: 118, orders: 61 },
//     { date: "2024-05", newUsers: 19, activeUsers: 125, orders: 58 },
//     { date: "2024-06", newUsers: 25, activeUsers: 138, orders: 67 },
//   ];

//   useEffect(() => {
//     loadReportData();
//   }, [selectedPeriod]);

//   const loadReportData = async () => {
//     setLoading(true);
//     try {
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Calculate stats from mock data
//       const currentPeriod = mockSalesData[mockSalesData.length - 1];
//       const previousPeriod = mockSalesData[mockSalesData.length - 2];
      
//       const newStats: ReportStats = {
//         totalRevenue: currentPeriod.revenue,
//         totalOrders: currentPeriod.orders,
//         totalCustomers: currentPeriod.customers,
//         averageOrderValue: Math.round(currentPeriod.revenue / currentPeriod.orders),
//         revenueChange: Math.round(((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100),
//         ordersChange: Math.round(((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) * 100),
//         customersChange: Math.round(((currentPeriod.customers - previousPeriod.customers) / previousPeriod.customers) * 100)
//       };
      
//       setStats(newStats);
//       setSalesData(mockSalesData);
//       setInventoryData(mockInventoryData);
//       setUserActivityData(mockUserActivityData);
      
//     } catch (error) {
//       toast.error("Không thể tải dữ liệu báo cáo");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportReport = (type: string) => {
//     toast.info(`Đang xuất báo cáo ${type}...`);
//     // Implement export logic here
//     setTimeout(() => {
//       toast.success(`Đã xuất báo cáo ${type} thành công`);
//     }, 2000);
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND'
//     }).format(amount);
//   };

//   const formatNumber = (num: number) => {
//     return new Intl.NumberFormat('vi-VN').format(num);
//   };

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Báo cáo & Thống kê</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             Theo dõi hiệu suất kinh doanh và phân tích dữ liệu
//           </p>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//             <SelectTrigger className="w-32">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="week">Tuần</SelectItem>
//               <SelectItem value="month">Tháng</SelectItem>
//               <SelectItem value="quarter">Quý</SelectItem>
//               <SelectItem value="year">Năm</SelectItem>
//             </SelectContent>
//           </Select>
          
//           <Button variant="outline" onClick={() => exportReport("PDF")}>
//             <Download className="w-4 h-4 mr-2" />
//             Xuất PDF
//           </Button>
          
//           <Button variant="outline" onClick={() => exportReport("Excel")}>
//             <Download className="w-4 h-4 mr-2" />
//             Xuất Excel
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium opacity-90">Tổng doanh thu</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
//             <div className="flex items-center mt-2">
//               {stats.revenueChange >= 0 ? (
//                 <TrendingUp className="w-4 h-4 mr-1" />
//               ) : (
//                 <TrendingDown className="w-4 h-4 mr-1" />
//               )}
//               <span className="text-sm opacity-90">
//                 {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%
//               </span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium opacity-90">Tổng đơn hàng</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
//             <div className="flex items-center mt-2">
//               {stats.ordersChange >= 0 ? (
//                 <TrendingUp className="w-4 h-4 mr-1" />
//               ) : (
//                 <TrendingDown className="w-4 h-4 mr-1" />
//               )}
//               <span className="text-sm opacity-90">
//                 {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}%
//               </span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium opacity-90">Khách hàng</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
//             <div className="flex items-center mt-2">
//               {stats.customersChange >= 0 ? (
//                 <TrendingUp className="w-4 h-4 mr-1" />
//               ) : (
//                 <TrendingDown className="w-4 h-4 mr-1" />
//               )}
//               <span className="text-sm opacity-90">
//                 {stats.customersChange >= 0 ? '+' : ''}{stats.customersChange}%
//               </span>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium opacity-90">Giá trị TB/đơn</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
//             <div className="text-sm opacity-90 mt-2">Trung bình</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Sales Trend Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-blue-500" />
//               Xu hướng doanh thu
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={salesData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip 
//                   formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
//                   labelFormatter={(label) => `Tháng ${label}`}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="revenue" 
//                   stroke="#3B82F6" 
//                   strokeWidth={2}
//                   dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* User Activity Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="w-5 h-5 text-green-500" />
//               Hoạt động người dùng
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={userActivityData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="newUsers" fill="#10B981" name="Người dùng mới" />
//                 <Bar dataKey="activeUsers" fill="#3B82F6" name="Người dùng hoạt động" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Inventory Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Package className="w-5 h-5 text-purple-500" />
//             Tình trạng tồn kho theo danh mục
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={inventoryData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ category, quantity }) => `${category}: ${quantity}`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="quantity"
//                 >
//                   {inventoryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value: number) => [formatNumber(value), 'Số lượng']} />
//               </PieChart>
//             </ResponsiveContainer>
            
//             <div className="space-y-3">
//               <h4 className="font-semibold text-lg">Chi tiết tồn kho</h4>
//               {inventoryData.map((item, index) => (
//                 <div key={item.category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div 
//                       className="w-4 h-4 rounded-full" 
//                       style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                     />
//                     <span className="font-medium">{item.category}</span>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-semibold">{formatNumber(item.quantity)}</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       {formatCurrency(item.value)}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Detailed Reports */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Products */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BarChart3 className="w-5 h-5 text-orange-500" />
//               Sản phẩm bán chạy
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {[
//                 { name: "Nhẫn kim cương 18K", sales: 23, revenue: 8500000 },
//                 { name: "Dây chuyền vàng 999", sales: 18, revenue: 6200000 },
//                 { name: "Bông tai ngọc trai", sales: 15, revenue: 4500000 },
//                 { name: "Lắc tay bạc 925", sales: 12, revenue: 2800000 },
//               ].map((product, index) => (
//                 <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                   <div>
//                     <div className="font-medium">{product.name}</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       {product.sales} đơn hàng
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-semibold">{formatCurrency(product.revenue)}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Customer Insights */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Users className="w-5 h-5 text-indigo-500" />
//               Phân tích khách hàng
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span>Khách hàng mới</span>
//                 <Badge variant="default" className="bg-green-100 text-green-800">
//                   +{stats.customersChange}%
//                 </Badge>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span>Khách hàng quay lại</span>
//                 <Badge variant="default" className="bg-blue-100 text-blue-800">
//                   68%
//                 </Badge>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span>Khách hàng VIP</span>
//                 <Badge variant="default" className="bg-purple-100 text-purple-800">
//                   12%
//                 </Badge>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span>Tỷ lệ chuyển đổi</span>
//                 <Badge variant="default" className="bg-orange-100 text-orange-800">
//                   3.2%
//                 </Badge>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// } 