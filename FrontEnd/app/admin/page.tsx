"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import AdminChatInbox from "@/app/components/chatbox/AdminChatInbox";
import AdminChatDetail from "@/app/components/chatbox/AdminChatDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const statCards = [
  {
    label: "Doanh số",
    value: "2.382",
    icon: <ShoppingCart className="text-blue-500 bg-blue-100 rounded-full p-1" size={28} />,
    change: "-3.65%",
    changeType: "down",
    description: "So với tuần trước",
  },
  {
    label: "Doanh thu",
    value: "$21.300",
    icon: <DollarSign className="text-indigo-500 bg-indigo-100 rounded-full p-1" size={28} />,
    change: "+6.65%",
    changeType: "up",
    description: "So với tuần trước",
  },
  {
    label: "Khách truy cập",
    value: "14.212",
    icon: <Users className="text-green-500 bg-green-100 rounded-full p-1" size={28} />,
    change: "+5.25%",
    changeType: "up",
    description: "So với tuần trước",
  },
  {
    label: "Đơn hàng",
    value: "64",
    icon: <Package className="text-cyan-500 bg-cyan-100 rounded-full p-1" size={28} />,
    change: "-2.25%",
    changeType: "down",
    description: "So với tuần trước",
  },
];

const lineData = [
  { name: "Th1", value: 2000 },
  { name: "Th2", value: 1500 },
  { name: "Th3", value: 1600 },
  { name: "Th4", value: 1700 },
  { name: "Th5", value: 1800 },
  { name: "Th6", value: 1900 },
  { name: "Th7", value: 2100 },
  { name: "Th8", value: 2500 },
  { name: "Th9", value: 3000 },
  { name: "Th10", value: 3500 },
  { name: "Th11", value: 3200 },
  { name: "Th12", value: 3700 },
];

const pieData = [
  { name: "Chrome", value: 40, color: "#6366f1" },
  { name: "Safari", value: 30, color: "#f59e42" },
  { name: "Firefox", value: 20, color: "#10b981" },
  { name: "Edge", value: 10, color: "#f43f5e" },
];

export default function AdminDashboard() {
  const { user } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
                  <span className={`font-semibold ${card.changeType === "up" ? "text-green-600" : "text-red-500"}`}>{card.change}</span>
                  <span className="text-muted-foreground">{card.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Biến động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Trình duyệt sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
