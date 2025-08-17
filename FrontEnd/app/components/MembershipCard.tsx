'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  TrendingUp, 
  Gift, 
  Star,
  Info,
  Calculator
} from 'lucide-react';
import { MembershipInfo, DiscountCalculation } from '@/app/types/membership';

interface MembershipCardProps {
  userId: string;
  className?: string;
}

export default function MembershipCard({ userId, className = '' }: MembershipCardProps) {
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiscountCalculator, setShowDiscountCalculator] = useState(false);
  const [orderAmount, setOrderAmount] = useState('');
  const [discountInfo, setDiscountInfo] = useState<DiscountCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  // const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchMembershipInfo();
  }, [userId]);

  const fetchMembershipInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9001/api/users/membership/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMembershipInfo(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Không thể tải thông tin hạng thành viên');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async () => {
    if (!orderAmount || parseFloat(orderAmount) <= 0) return;
    
    try {
      setCalculating(true);
      const response = await fetch(`http://localhost:9001/api/users/membership/${userId}/calculate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderAmount: parseFloat(orderAmount) }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscountInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Không thể tính discount');
      }
    } catch (error) {
      setError('Lỗi khi tính discount');
    } finally {
      setCalculating(false);
    }
  };

  // Auto-sync is handled server-side during order updates. Manual sync removed to avoid double counting.

  const getProgressValue = () => {
    if (!membershipInfo) return 0;
    
    const { currentPurchaseCount } = membershipInfo;
    if (currentPurchaseCount >= 15) return 100;
    if (currentPurchaseCount >= 10) return 75;
    if (currentPurchaseCount >= 5) return 50;
    return (currentPurchaseCount / 5) * 25;
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'BRONZE': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700';
      case 'SILVER': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
      case 'GOLD': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'DIAMOND': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <Card className={`animate-pulse bg-white dark:bg-[#18181b] border-gray-200 dark:border-black ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 dark:border-red-700 bg-white dark:bg-[#18181b] ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>❌ {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMembershipInfo}
              className="mt-2 border-gray-200 dark:border-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-black"
            >
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!membershipInfo) {
    return (
      <Card className={`bg-white dark:bg-[#18181b] border-gray-200 dark:border-black ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Không có thông tin hạng thành viên</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white dark:bg-[#18181b] border-gray-200 dark:border-black shadow-lg dark:shadow-black/20 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
          <Crown className="h-6 w-6 text-yellow-500" />
          Hạng thành viên
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Tier Display */}
        <div className="text-center">
          <div className="text-4xl mb-2">{membershipInfo.tierIcon}</div>
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 ${getTierColor(membershipInfo.tierName)}`}
          >
            {membershipInfo.tierDisplayName}
          </Badge>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Giảm giá: <span className="font-semibold text-green-600 dark:text-green-400">
              {(membershipInfo.discountRate * 100).toFixed(0)}%
            </span>
          </p>
        </div>

        {/* Progress to Next Tier */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
            <span>Tiến độ lên hạng</span>
            <span>{membershipInfo.currentPurchaseCount}/15 lần mua</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
          {membershipInfo.purchasesToNextTier > 0 ? (
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
              Cần mua thêm <span className="font-semibold">{membershipInfo.purchasesToNextTier}</span> lần 
              để lên hạng <span className="font-semibold">{membershipInfo.nextTierName}</span>
            </p>
          ) : (
            <p className="text-sm text-green-600 dark:text-green-400 text-center font-semibold">
              🎉 Bạn đã ở hạng cao nhất!
            </p>
          )}
          
          {/* 🗓️ Monthly Reset Info */}
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
              <span>🗓️</span>
              <span>
                Hạng sẽ được reset vào ngày 1 tháng tới
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Lần mua</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{membershipInfo.currentPurchaseCount}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Gift className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Tổng chi</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {membershipInfo.totalSpent?.toLocaleString()}₫
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-black pt-4">
          {/* Discount Calculator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiscountCalculator(!showDiscountCalculator)}
            className="w-full border-gray-200 dark:border-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-black"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Tính giảm giá
          </Button>

          {showDiscountCalculator && (
            <div className="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Số tiền đơn hàng (₫)
                </label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#18181b] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <Button
                onClick={calculateDiscount}
                disabled={!orderAmount || calculating}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {calculating ? 'Đang tính...' : 'Tính giảm giá'}
              </Button>

              {discountInfo && (
                <div className="mt-3 p-3 bg-white dark:bg-[#18181b] rounded-lg border border-gray-200 dark:border-black">
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Kết quả giảm giá:</h4>
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>Giá gốc: <span className="font-medium">{discountInfo.originalAmount.toLocaleString()}₫</span></p>
                    <p>Giảm giá: <span className="font-medium text-green-600 dark:text-green-400">-{discountInfo.discountAmount.toLocaleString()}₫</span></p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      Giá cuối: {discountInfo.finalAmount.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
