export interface Message {
  sender: string;
  receiver?: string; // 👈 THÊM
  role: "user" | "admin";
  content: string;
  timestamp: string;
}

export interface OrderDetails {
  id: string;
  paymentStatus: string;
  orderStatus: string;
  // Add other fields as needed
}

// types/order.ts
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: {
    weight?: number;
    wage?: number;
    goldAge?: string;
    [key: string]: any;
  };
  image?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth?: string;
}

export interface ShippingAddress {
  province: string;
  district: string;
  ward: string;
  street: string;
  receiverName: string;
  receiverPhone: string;
}

export interface CreateOrderRequest {
  userId: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  deliveryType: string;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  note?: string;
  smsNotification?: boolean;
  invoiceRequired?: boolean;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  deliveryType: string;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  note?: string;
  smsNotification?: boolean;
  invoiceRequired?: boolean;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
}