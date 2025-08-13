'use client';

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Gift, TrendingUp, Calculator, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import MembershipCard from "@/app/components/MembershipCard";
import { useState } from "react";

export default function MembershipPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-rose-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hạng thành viên của bạn
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các đặc quyền và lợi ích dành riêng cho hạng thành viên của bạn
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Membership Card */}
          <div className="lg:col-span-2">
            <MembershipCard userId={user.id} className="h-fit" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-rose-500" />
                  Lợi ích hạng thành viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl">🥉</div>
                    <div>
                      <p className="font-semibold text-amber-800">Hạng Đồng</p>
                      <p className="text-sm text-amber-600">0-4 lần mua</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">🥈</div>
                    <div>
                      <p className="font-semibold text-gray-800">Hạng Bạc</p>
                      <p className="text-sm text-gray-600">5-9 lần mua • Giảm 1%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">🥇</div>
                    <div>
                      <p className="font-semibold text-yellow-800">Hạng Vàng</p>
                      <p className="text-sm text-yellow-600">10-14 lần mua • Giảm 3%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl">💎</div>
                    <div>
                      <p className="font-semibold text-blue-800">Hạng Kim cương</p>
                      <p className="text-sm text-blue-600">15+ lần mua • Giảm 5%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Upgrade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Cách lên hạng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>🎯 Mỗi lần mua hàng thành công sẽ được tính là 1 lần</p>
                  <p>📈 Hạng sẽ tự động cập nhật sau mỗi lần mua</p>
                  <p>🎁 Giảm giá sẽ được áp dụng ngay lập tức</p>
                  <p>💎 Hạng cao nhất là Kim cương với 15+ lần mua</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/products')}
                >
                  🛍️ Mua sắm ngay
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard')}
                >
                  📊 Xem hồ sơ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Thông tin chi tiết
                </Button>
              </CardContent>
            </Card> */}

            {/* Detailed Info */}
            {showInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ℹ️ Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• Hạng thành viên được tính dựa trên số lần mua hàng thành công</p>
                  <p>• Giảm giá được áp dụng trực tiếp vào đơn hàng</p>
                  <p>• Hạng mới sẽ có hiệu lực ngay lập tức</p>
                  <p>• Không có thời hạn cho hạng thành viên</p>
                  <p>• Hạng sẽ không bị giảm khi không mua hàng</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Có câu hỏi về hạng thành viên? Liên hệ với chúng tôi qua email hoặc chat
          </p>
        </div>
      </div>
    </div>
  );
}
