// import { NextRequest, NextResponse } from 'next/server';

// const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { orderId: string } }
// ) {
//   try {
//     const { orderId } = params;
//     const body = await request.json();
    
//     // Extract payment status and transaction ID from request body
//     const { paymentStatus, transactionId } = body;
    
//     // Build query parameters for the backend
//     const queryParams = new URLSearchParams();
//     queryParams.append('paymentStatus', paymentStatus);
//     if (transactionId) {
//       queryParams.append('transactionId', transactionId);
//     }
    
//     const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment?${queryParams.toString()}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 404) {
//         return NextResponse.json(
//           { error: 'Order not found' },
//           { status: 404 }
//         );
//       }
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error updating order payment status:', error);
//     return NextResponse.json(
//       { error: 'Failed to update order payment status' },
//       { status: 500 }
//     );
//   }
// } 
// pages/api/orders/[orderId]/payment.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "PUT") {
    const { orderId } = req.query;
    const { paymentStatus, transactionId } = req.query;

    try {
      // Assuming you have a service to update the order in your database
      const updatedOrder = await updateOrderPaymentStatus(
        orderId as string,
        paymentStatus as string,
        transactionId as string
      );
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating payment status:", error);
      return res.status(500).json({ error: "Failed to update payment status" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Example database update function (implement based on your DB)
async function updateOrderPaymentStatus(orderId: string, paymentStatus: string, transactionId?: string) {

}