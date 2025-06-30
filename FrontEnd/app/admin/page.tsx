"use client"

import { Navbar } from "@/components/navbar";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { UserButton } from "@clerk/nextjs";
import { Calendar as CalendarIcon, ShoppingCart, DollarSign, Users, Package } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const statCards = [
  {
    label: "Sales",
    value: "2.382",
    icon: <ShoppingCart className="text-blue-500 bg-blue-100 rounded-full p-1" size={28} />,
    change: "-3.65%",
    changeType: "down",
    description: "Since last week",
  },
  {
    label: "Earnings",
    value: "$21.300",
    icon: <DollarSign className="text-indigo-500 bg-indigo-100 rounded-full p-1" size={28} />,
    change: "+6.65%",
    changeType: "up",
    description: "Since last week",
  },
  {
    label: "Visitors",
    value: "14.212",
    icon: <Users className="text-green-500 bg-green-100 rounded-full p-1" size={28} />,
    change: "+5.25%",
    changeType: "up",
    description: "Since last week",
  },
  {
    label: "Orders",
    value: "64",
    icon: <Package className="text-cyan-500 bg-cyan-100 rounded-full p-1" size={28} />,
    change: "-2.25%",
    changeType: "down",
    description: "Since last week",
  },
];

const lineData = [
  { name: "Jan", value: 2000 },
  { name: "Feb", value: 1500 },
  { name: "Mar", value: 1600 },
  { name: "Apr", value: 1700 },
  { name: "May", value: 1800 },
  { name: "Jun", value: 1900 },
  { name: "Jul", value: 2100 },
  { name: "Aug", value: 2500 },
  { name: "Sep", value: 3000 },
  { name: "Oct", value: 3500 },
  { name: "Nov", value: 3200 },
  { name: "Dec", value: 3700 },
];

const pieData = [
  { name: "Chrome", value: 40, color: "#6366f1" },
  { name: "Safari", value: 30, color: "#f59e42" },
  { name: "Firefox", value: 20, color: "#10b981" },
  { name: "Edge", value: 10, color: "#f43f5e" },
];

export default function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="flex min-h-screen bg-[#f5f4fa] dark:bg-background">

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span>Dashboard</span>
          </h2>
          {/* <div className="flex gap-2">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Download Free Version</button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Upgrade To Pro</button>
          </div> */}
        </div>
        {/* Stat cards */}
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
        {/* Main grid: line chart, pie chart, calendar, map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Line chart */}
          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Recent Movement</CardTitle>
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
          {/* Pie chart */}
          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Browser Usage</CardTitle>
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
        {/* Calendar & Real-time map row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Calendar */}
          <Card className="shadow border-0">
            <CardHeader className="flex flex-row items-center gap-2">
              <CalendarIcon className="text-indigo-500" />
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex items-center justify-center">
                <Calendar className="w-full" />
              </div>
            </CardContent>
          </Card>
          {/* Real-time map */}
          <Card className="shadow border-0">
            <CardHeader>
              <CardTitle>Real-Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                {/* Placeholder for real-time map */}
                <span>Real-time map will be here</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 