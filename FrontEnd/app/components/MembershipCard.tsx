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
      case 'BRONZE': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DIAMOND': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMembershipInfo}
              className="mt-2"
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
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>Không có thông tin hạng thành viên</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
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
          <p className="text-sm text-gray-600 mt-2">
            Giảm giá: <span className="font-semibold text-green-600">
              {(membershipInfo.discountRate * 100).toFixed(0)}%
            </span>
          </p>
        </div>

        {/* Progress to Next Tier */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Tiến độ lên hạng</span>
            <span>{membershipInfo.currentPurchaseCount}/15 lần mua</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
          {membershipInfo.purchasesToNextTier > 0 ? (
            <p className="text-sm text-blue-600 text-center">
              Cần mua thêm <span className="font-semibold">{membershipInfo.purchasesToNextTier}</span> lần 
              để lên hạng <span className="font-semibold">{membershipInfo.nextTierName}</span>
            </p>
          ) : (
            <p className="text-sm text-green-600 text-center font-semibold">
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
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600">Lần mua</p>
            <p className="text-lg font-semibold">{membershipInfo.currentPurchaseCount}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Gift className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600">Tổng chi</p>
            <p className="text-lg font-semibold">
              {membershipInfo.totalSpent?.toLocaleString()}₫
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          {/* Discount Calculator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiscountCalculator(!showDiscountCalculator)}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Tính giảm giá
          </Button>

          {showDiscountCalculator && (
            <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số tiền đơn hàng (₫)
                </label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={calculateDiscount}
                disabled={!orderAmount || calculating}
                size="sm"
                className="w-full"
              >
                {calculating ? 'Đang tính...' : 'Tính giảm giá'}
              </Button>

              {discountInfo && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <h4 className="font-semibold mb-2 text-green-600">Kết quả giảm giá:</h4>
                  <div className="space-y-1 text-sm">
                    <p>Giá gốc: <span className="font-medium">{discountInfo.originalAmount.toLocaleString()}₫</span></p>
                    <p>Giảm giá: <span className="font-medium text-green-600">-{discountInfo.discountAmount.toLocaleString()}₫</span></p>
                    <p className="text-lg font-semibold text-blue-600">
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
