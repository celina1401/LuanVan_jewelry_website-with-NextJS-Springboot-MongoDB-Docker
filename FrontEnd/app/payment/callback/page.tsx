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

        // Set order details - orderIdParam is actually orderNumber
        if (orderIdParam) {
          // Try to get the actual orderId from MongoDB using orderNumber
          try {
            const getRes = await fetch(`/api/orders?orderNumber=${orderIdParam}`);
            const order = await getRes.json();
            
            if (order?.id) {
              setOrderId(order.id); // Use the actual MongoDB orderId
            } else {
              setOrderId(orderIdParam); // Fallback to orderNumber
            }
          } catch (err) {
            console.error('Error fetching order details:', err);
            setOrderId(orderIdParam); // Fallback to orderNumber
          }
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

        if (orderIdParam) {
          try {
            const paymentStatus = responseCode === "00" ? "Đã thanh toán" : "Thất bại";
            const transactionId = params.get("vnp_TransactionNo") || "";

            const queryParams = new URLSearchParams({
              orderNumber: orderIdParam,
              paymentStatus,
              transactionId,
            });

            const updateResponse = await fetch(`http://localhost:9003/api/orders/payment/callback?${queryParams.toString()}`, {
              method: 'PUT',
            });

            if (!updateResponse.ok) {
              console.error('❌ Gọi callback backend thất bại');
            }
          } catch (error) {
            console.error('❌ Lỗi gọi callback backend:', error);
          }
        }


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

  const handleViewOrder = () => {
    if (orderId) {
      window.location.href = `/dashboard/orders/${orderId}`;
    } else {
      window.location.href = "/dashboard/orders";
    }
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
          onViewOrder={handleViewOrder}
          showActions={true}
        />
      </div>
    </ErrorBoundary>
  );
}