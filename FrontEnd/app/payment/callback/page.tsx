"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaymentStatusCard, PaymentStatus, LoadingSpinner, ErrorBoundary, ApiErrorDisplay } from "@/lib";

export default function PaymentCallback() {
  const params = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [orderId, setOrderId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        setIsLoading(true);
        
        // Get payment parameters
        const responseCode = params.get("vnp_ResponseCode");
        const orderIdParam = params.get("vnp_TxnRef");
        const amountParam = params.get("vnp_Amount");
        
        // Set order details
        if (orderIdParam) {
          setOrderId(orderIdParam);
        }
        
        if (amountParam) {
          // Convert from VND (smallest unit) to VND
          const amountInVND = parseInt(amountParam) / 100;
          setAmount(new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amountInVND));
        }

        // Determine payment status
        if (responseCode === "00") {
          setStatus("success");
        } else if (responseCode === "24") {
          setStatus("cancelled");
        } else {
          setStatus("failed");
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update order payment status
        // if (orderIdParam) {
        //   try {
        //     const paymentStatus = responseCode === "00" ? "Đã thanh toán" : "Thất bại";
        //     const updateResponse = await fetch(`http://localhost:9003/api/orders/${orderIdParam}/update`, {
        //       method: 'PUT',
        //       headers: {
        //         'Content-Type': 'application/json',
        //       },
        //       body: JSON.stringify({
        //         paymentStatus: paymentStatus,
        //         transactionId: params.get("vnp_TransactionNo") || undefined
        //       }),
        //     });
            
        //     if (!updateResponse.ok) {
        //       console.error('Failed to update order payment status');
        //     }
        //   } catch (error) {
        //     console.error('Error updating order payment status:', error);
        //   }
        // }
        
      } catch (err) {
        setError("Có lỗi xảy ra khi xử lý kết quả thanh toán");
        setStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentResult();
  }, [params]);

  const handleRetry = () => {
    // Redirect back to payment page or order page
    window.location.href = "/order";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Đang xử lý kết quả thanh toán..." 
          fullScreen={false}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ApiErrorDisplay 
          error={error} 
          onRetry={handleRetry}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <PaymentStatusCard
          status={status}
          orderId={orderId}
          amount={amount}
          onRetry={handleRetry}
          showActions={true}
        />
      </div>
    </ErrorBoundary>
  );
}