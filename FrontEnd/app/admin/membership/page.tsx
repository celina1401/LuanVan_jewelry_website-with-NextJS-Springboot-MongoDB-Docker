'use client';

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, BarChart3, Users, Crown, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import MembershipStats from "@/app/components/MembershipStats";
import { useState, useEffect } from "react";

export default function AdminMembershipPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dialog states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [dialogData, setDialogData] = useState({ title: '', message: '', type: '' });
  const [statusUserId, setStatusUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.publicMetadata?.role === 'admin') {
      setIsAdmin(true);
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Handle reset all users
  const handleResetAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/users/membership/reset-all', { method: 'POST' });
      const data = await response.json();
      
      if (data.message) {
        setDialogData({
          title: 'Thành công!',
          message: data.message,
          type: 'success'
        });
        setShowSuccess(true);
        setShowResetConfirm(false);
      } else {
        setDialogData({
          title: 'Lỗi',
          message: data.error || 'Có lỗi xảy ra khi reset hạng thành viên',
          type: 'error'
        });
        setShowError(true);
      }
    } catch (err) {
      setDialogData({
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        type: 'error'
      });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status check
  const handleStatusCheck = async () => {
    if (!statusUserId.trim()) {
      setDialogData({
        title: 'Lỗi',
        message: 'Vui lòng nhập User ID',
        type: 'error'
      });
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:9001/api/users/membership/${statusUserId}/reset-status`);
      const data = await response.json();
      
      if (data.status) {
        setDialogData({
          title: 'Trạng thái Reset',
          message: data.status,
          type: 'info'
        });
        setShowSuccess(true);
        setShowStatusCheck(false);
        setStatusUserId('');
      } else {
        setDialogData({
          title: 'Lỗi',
          message: data.error || 'Không thể lấy thông tin trạng thái',
          type: 'error'
        });
        setShowError(true);
      }
    } catch (err) {
      setDialogData({
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        type: 'error'
      });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <Button onClick={() => router.push('/dashboard')}>
            Quay về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="mb-4 hover:bg-blue-100 dark:hover:bg-blue-900 dark:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Admin
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Quản lý Hạng thành viên
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Theo dõi và phân tích hệ thống hạng thành viên của website
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          {/* <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              📊 Thống Kê Tổng Quan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dữ liệu thống kê hệ thống hạng thành viên
            </p>
          </div> */}
          <MembershipStats />
        </div>

        {/* Additional Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-600">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-3 text-lg text-blue-800 dark:text-blue-200">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <span>Tổng quan hệ thống</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📊</span>
                  <span>Hệ thống hạng thành viên hoạt động tự động</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🔄</span>
                  <span>Cập nhật hạng sau mỗi lần mua hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">🎯</span>
                  <span>Giảm giá được áp dụng theo hạng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">📈</span>
                  <span>Không có giới hạn thời gian</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Rules */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-300 dark:hover:border-yellow-600">
            <CardHeader className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
              <CardTitle className="flex items-center gap-3 text-lg text-yellow-800 dark:text-yellow-200">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Crown className="h-6 w-6 text-yellow-600" />
                </div>
                <span>Quy tắc hạng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">🥉</span>
                    <span>Đồng</span>
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">0-4 lần mua</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">🥈</span>
                    <span>Bạc</span>
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">5-9 lần mua (1%)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥇</span>
                    <span>Vàng</span>
                  </div>
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">10-14 lần mua (3%)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    <span>Kim cương</span>
                  </div>
                  <span className="font-medium text-blue-700 dark:text-blue-700">15+ lần mua (5%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Actions */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-600">
            <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-3 text-lg text-green-800 dark:text-green-200">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span>Quản lý</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group/btn hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                  onClick={() => router.push('/admin/users')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-xl">👥</span>
                    <span>Quản lý người dùng</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start group/btn hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300"
                  onClick={() => router.push('/admin/orders')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-xl">📦</span>
                    <span>Quản lý đơn hàng</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start group/btn hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                  onClick={() => window.open('http://localhost:9001/api/users/membership/stats', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-xl">📊</span>
                    <span>Xuất báo cáo</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <div className="mt-8">
          <Card className="border-2 border-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200 dark:border-emerald-700">
              <CardTitle className="flex items-center gap-3 text-xl text-emerald-800 dark:text-emerald-200">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <span>Thông tin hệ thống</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Tính năng chính
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <span className="text-emerald-600">🚀</span>
                      <span className="text-sm">Tự động tính toán hạng thành viên</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <span className="text-emerald-600">🎯</span>
                      <span className="text-sm">Áp dụng giảm giá theo hạng</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <span className="text-emerald-600">📈</span>
                      <span className="text-sm">Theo dõi tiến độ lên hạng</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <span className="text-emerald-600">📊</span>
                      <span className="text-sm">Thống kê chi tiết</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-teal-800 dark:text-teal-200 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    Lưu ý quan trọng
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                      <span className="text-teal-600">⚡</span>
                      <span className="text-sm">Hạng được cập nhật real-time</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                      <span className="text-teal-600">🤖</span>
                      <span className="text-sm">Không cần can thiệp thủ công</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                      <span className="text-teal-600">🔗</span>
                      <span className="text-sm">Dữ liệu được đồng bộ với backend</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                      <span className="text-teal-600">👥</span>
                      <span className="text-sm">Hỗ trợ đa người dùng</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Reset Management */}
        <div className="mt-8">
          <Card className="border-2 border-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200 dark:border-purple-700">
              <CardTitle className="flex items-center gap-3 text-xl text-purple-800 dark:text-purple-200">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <span className="text-3xl">🗓️</span>
                </div>
                <div>
                  <div className="font-bold">Quản lý Reset Hạng Thành Viên</div>
                  <div className="text-sm font-normal text-purple-600 dark:text-purple-300">
                    Hệ thống tự động reset theo tháng
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Info Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 border border-blue-200 dark:border-blue-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-800/30 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                  <div className="relative">
                    <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <span className="text-lg">ℹ️</span>
                      </div>
                      Thông tin Reset Tự Động
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Reset tự động vào ngày 1 hàng tháng lúc 00:00</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Tất cả users về hạng Đồng (0%) khi bắt đầu tháng mới</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Số lần mua hàng và tổng chi tiêu reset về 0</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Ghi nhận tháng reset cuối cùng để tránh trùng lặp</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="group relative w-full h-16 justify-start px-6 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-900/20 transition-all duration-300"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl">🔄</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-red-700 dark:text-red-300">Reset Tất Cả Users</div>
                        <div className="text-xs text-red-500 dark:text-red-400">Không thể hoàn tác</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group relative w-full h-16 justify-start px-6 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-900/20 transition-all duration-300"
                    onClick={() => setShowStatusCheck(true)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl">🔍</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-green-700 dark:text-green-300">Kiểm Tra Trạng Thái</div>
                        <div className="text-xs text-green-500 dark:text-green-400">Xem thông tin user</div>
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Warning Note */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-full">
                    <span className="text-amber-600 dark:text-amber-400">💡</span>
                    <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                      Reset thủ công chỉ nên sử dụng trong trường hợp đặc biệt
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Hệ thống sẽ tự động reset vào đầu tháng
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


         {/* Reset Confirmation Dialog */}
         <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-600">
                 <AlertTriangle className="h-5 w-5" />
                 Xác nhận Reset Hạng Thành Viên
               </DialogTitle>
                               <DialogDescription asChild>
                  <div className="text-gray-600 dark:text-gray-300 mt-4 space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                        ⚠️ CẢNH BÁO: Hành động này sẽ reset hạng thành viên cho TẤT CẢ users!
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>• Tất cả users sẽ về hạng Đồng (0%)</p>
                      <p>• Số lần mua hàng và tổng chi tiêu sẽ reset về 0</p>
                      <p>• Hành động này KHÔNG THỂ HOÀN TÁC</p>
                      <p>• Sẽ ảnh hưởng đến tất cả người dùng trong hệ thống</p>
                    </div>
                  </div>
                </DialogDescription>
             </DialogHeader>
             <DialogFooter className="flex flex-col sm:flex-row gap-2">
               <Button
                 variant="outline"
                 onClick={() => setShowResetConfirm(false)}
                 className="w-full sm:w-auto"
               >
                 Hủy bỏ
               </Button>
               <Button
                 variant="destructive"
                 onClick={handleResetAllUsers}
                 disabled={isLoading}
                 className="w-full sm:w-auto"
               >
                 {isLoading ? (
                   <div className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     Đang xử lý...
                   </div>
                 ) : (
                   'Xác nhận Reset'
                 )}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

         {/* Status Check Dialog */}
         <Dialog open={showStatusCheck} onOpenChange={setShowStatusCheck}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-green-600">
                 <Info className="h-5 w-5" />
                 Kiểm Tra Trạng Thái Reset
               </DialogTitle>
                               <DialogDescription asChild>
                  <div className="text-gray-600 dark:text-gray-300">
                    Nhập User ID để kiểm tra trạng thái reset hạng thành viên
                  </div>
                </DialogDescription>
             </DialogHeader>
             <div className="py-4">
               <div className="space-y-4">
                 <div>
                   <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     User ID
                   </label>
                   <input
                     id="userId"
                     type="text"
                     value={statusUserId}
                     onChange={(e) => setStatusUserId(e.target.value)}
                     placeholder="Nhập User ID..."
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                   />
                 </div>
               </div>
             </div>
             <DialogFooter className="flex flex-col sm:flex-row gap-2">
               <Button
                 variant="outline"
                 onClick={() => {
                   setShowStatusCheck(false);
                   setStatusUserId('');
                 }}
                 className="w-full sm:w-auto"
               >
                 Hủy bỏ
               </Button>
               <Button
                 onClick={handleStatusCheck}
                 disabled={isLoading || !statusUserId.trim()}
                 className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
               >
                 {isLoading ? (
                   <div className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     Đang kiểm tra...
                   </div>
                 ) : (
                   'Kiểm tra'
                 )}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

         {/* Success/Info Dialog */}
         <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className={`flex items-center gap-2 ${
                 dialogData.type === 'success' ? 'text-green-600' : 'text-blue-600'
               }`}>
                 {dialogData.type === 'success' ? (
                   <CheckCircle className="h-5 w-5" />
                 ) : (
                   <Info className="h-5 w-5" />
                 )}
                 {dialogData.title}
               </DialogTitle>
                               <DialogDescription asChild>
                  <div className="text-gray-600 dark:text-gray-300 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{dialogData.message}</p>
                  </div>
                </DialogDescription>
             </DialogHeader>
             <DialogFooter>
               <Button
                 onClick={() => {
                   setShowSuccess(false);
                   if (dialogData.type === 'success') {
                     window.location.reload();
                   }
                 }}
                 className="w-full"
               >
                 {dialogData.type === 'success' ? 'Đóng & Làm mới' : 'Đóng'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

         {/* Error Dialog */}
         <Dialog open={showError} onOpenChange={setShowError}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-600">
                 <AlertTriangle className="h-5 w-5" />
                 {dialogData.title}
               </DialogTitle>
                               <DialogDescription asChild>
                  <div className="text-gray-600 dark:text-gray-300 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm">{dialogData.message}</p>
                  </div>
                </DialogDescription>
             </DialogHeader>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => setShowError(false)}
                 className="w-full"
               >
                 Đóng
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
     </div>
   );
 }
