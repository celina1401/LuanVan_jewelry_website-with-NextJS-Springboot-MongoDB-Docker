'use client';

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Gift, TrendingUp, Calculator, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import MembershipCard from "@/app/components/MembershipCard";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

export default function MembershipPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#18181b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-[#18181b] dark:to-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-rose-100 dark:hover:bg-black dark:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hạng thành viên của bạn
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
            <Card className="bg-white dark:bg-[#18181b] border-gray-200 dark:border-black shadow-lg dark:shadow-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                  <Gift className="h-5 w-5 text-rose-500" />
                  Lợi ích hạng thành viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="text-2xl">🥉</div>
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Hạng Đồng</p>
                      <p className="text-sm text-amber-600 dark:text-amber-300">0-4 lần mua</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl">🥈</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Hạng Bạc</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">5-9 lần mua • Giảm 1%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="text-2xl">🥇</div>
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200">Hạng Vàng</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">10-14 lần mua • Giảm 3%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl">💎</div>
                    <div>
                      <p className="font-semibold text-purple-800 dark:text-purple-200">Hạng Kim cương</p>
                      <p className="text-sm text-purple-600 dark:text-purple-300">15+ lần mua • Giảm 5%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Upgrade */}
            <Card className="bg-white dark:bg-[#18181b] border-gray-200 dark:border-black shadow-lg dark:shadow-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Cách lên hạng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>🎯 Mỗi lần mua hàng thành công sẽ được tính là 1 lần</p>
                  <p>📈 Hạng sẽ tự động cập nhật sau mỗi lần mua</p>
                  <p>🎁 Giảm giá sẽ được áp dụng ngay lập tức</p>
                  <p>💎 Hạng cao nhất là Kim cương với 15+ lần mua</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <Card className="bg-white dark:bg-[#18181b] border-gray-200 dark:border-black shadow-lg dark:shadow-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                  <Calculator className="h-5 w-5 text-indigo-500" />
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-200 dark:border-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-black"
                  onClick={() => router.push('/products')}
                >
                  🛍️ Mua sắm ngay
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-200 dark:border-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-black"
                  onClick={() => router.push('/dashboard')}
                >
                  📊 Xem hồ sơ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-200 dark:border-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-black"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Thông tin chi tiết
                </Button>
              </CardContent>
            </Card> */}

            {/* Detailed Info */}
            {showInfo && (
              <Card className="bg-white dark:bg-[#18181b] border-gray-200 dark:border-black shadow-lg dark:shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">ℹ️ Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
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
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Có câu hỏi về hạng thành viên? Liên hệ với chúng tôi qua email hoặc chat
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
