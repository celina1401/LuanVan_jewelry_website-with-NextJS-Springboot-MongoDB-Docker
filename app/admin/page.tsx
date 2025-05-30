"use client"

import { useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700">Total Products</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-700">Total Users</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-700">Total Orders</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
} 