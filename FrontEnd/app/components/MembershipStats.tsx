'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Crown, 
  TrendingUp, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { MembershipStats as MembershipStatsType } from '@/app/types/membership';

interface MembershipStatsProps {
  className?: string;
}

export default function MembershipStats({ className = '' }: MembershipStatsProps) {
  const [stats, setStats] = useState<MembershipStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:9001/api/users/membership/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Không thể tải thống kê');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getTotalMembershipUsers = () => {
    if (!stats) return 0;
    return stats.bronzeUsers + stats.silverUsers + stats.goldUsers + stats.diamondUsers;
  };

  const getMembershipPercentage = (count: number) => {
    if (!stats || stats.totalUsers === 0) return 0;
    return ((count / stats.totalUsers) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>❌ {error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>Không có dữ liệu thống kê</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Thống kê hạng thành viên
        </CardTitle>
        <button
          onClick={fetchStats}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
        </button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Users */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
          <p className="text-sm text-blue-600">Tổng số người dùng</p>
        </div>

        {/* Membership Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Bronze */}
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl mb-1">🥉</div>
            <p className="text-lg font-semibold text-amber-700">{stats.bronzeUsers}</p>
            <p className="text-xs text-amber-600">Đồng</p>
            <p className="text-xs text-amber-500">
              {getMembershipPercentage(stats.bronzeUsers)}%
            </p>
          </div>

          {/* Silver */}
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">🥈</div>
            <p className="text-lg font-semibold text-gray-700">{stats.silverUsers}</p>
            <p className="text-xs text-gray-600">Bạc</p>
            <p className="text-xs text-gray-500">
              {getMembershipPercentage(stats.silverUsers)}%
            </p>
          </div>

          {/* Gold */}
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl mb-1">🥇</div>
            <p className="text-lg font-semibold text-yellow-700">{stats.goldUsers}</p>
            <p className="text-xs text-yellow-600">Vàng</p>
            <p className="text-xs text-yellow-500">
              {getMembershipPercentage(stats.goldUsers)}%
            </p>
          </div>

          {/* Diamond */}
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-1">💎</div>
            <p className="text-lg font-semibold text-blue-700">{stats.diamondUsers}</p>
            <p className="text-xs text-blue-600">Kim cương</p>
            <p className="text-xs text-blue-500">
              {getMembershipPercentage(stats.diamondUsers)}%
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-700">Hạng thành viên</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {getTotalMembershipUsers()} người dùng có hạng thành viên
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-700">Tỷ lệ tham gia</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">
              {stats.totalUsers > 0 ? ((getTotalMembershipUsers() / stats.totalUsers) * 100).toFixed(1) : 0}% người dùng
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="text-xs text-gray-500 text-center">
          <p>💡 Hạng thành viên được tính dựa trên số lần mua hàng</p>
          <p>🥉 Đồng (0-4 lần) | 🥈 Bạc (5-9 lần) | 🥇 Vàng (10-14 lần) | 💎 Kim cương (15+ lần)</p>
        </div>
      </CardContent>
    </Card>
  );
}
