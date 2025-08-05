'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/lib';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'fail' | 'pending'>('pending');
  const [orderId, setOrderId] = useState<string>('');
  const [orderFetched, setOrderFetched] = useState(false);

  useEffect(() => {
    const updateOrderPaymentStatus = async () => {
      const responseCode = searchParams.get('vnp_ResponseCode');
      const transactionId = searchParams.get('vnp_TransactionNo');
      const orderNumber = searchParams.get('vnp_TxnRef'); // chính là orderNumber

      if (!orderNumber || !responseCode) {
        setStatus('fail');
        return;
      }

      if (responseCode !== '00') {
        // Thanh toán thất bại
        setStatus('fail');
        return;
      }

      try {
        // Gọi API để lấy orderId từ orderNumber
        const getRes = await fetch(`/api/orders?orderNumber=${orderNumber}`);
        const order = await getRes.json();

        if (!order?.id) throw new Error('Không tìm thấy đơn hàng');
        
        setOrderId(order.id); // Lưu orderId để sử dụng trong link
        setOrderFetched(true);

        // Gửi cập nhật trạng thái thanh toán
        const res = await fetch(`/api/orders/${order.id}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'payment',
            paymentStatus: 'Đã thanh toán',
            transactionId,
          }),
        });

        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('fail');
        }
      } catch (err) {
        console.error('Lỗi xử lý callback:', err);
        setStatus('fail');
      }
    };

    updateOrderPaymentStatus();
  }, [searchParams]);

  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner text="Đang xác nhận thanh toán..." />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h2>
        <p className="text-gray-600 mt-2">Cảm ơn bạn đã mua hàng.</p>
        {orderFetched && orderId ? (
          <Button className="mt-6" asChild>
            <a href={`/dashboard/orders/${orderId}`}>Xem đơn hàng</a>
          </Button>
        ) : (
          <Button className="mt-6" asChild>
            <a href="/dashboard/orders">Xem tất cả đơn hàng</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-red-600">Thanh toán thất bại</h2>
      <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc chọn phương thức khác.</p>
      <Button className="mt-6" asChild>
        <a href="/orders">Quay lại đơn hàng</a>
      </Button>
    </div>
  );
}
