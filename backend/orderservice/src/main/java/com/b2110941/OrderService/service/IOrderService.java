package com.b2110941.OrderService.service;

import java.util.List;

import com.b2110941.OrderService.payload.request.CreateOrderRequest;
import com.b2110941.OrderService.payload.response.OrderResponse;

public interface IOrderService {
        OrderResponse createOrder(CreateOrderRequest request);
        OrderResponse getOrderById(String orderId);
        OrderResponse getOrderByOrderNumber(String orderNumber);
        List<OrderResponse> getOrdersByUserId(String userId);
        List<OrderResponse> getAllOrders();
        OrderResponse updateOrderStatus(String orderId, String orderStatus);
        OrderResponse updateShippingStatus(String orderNumber, String shippingStatus);
        OrderResponse updatePaymentStatus(String orderNumber, String paymentStatus, String transactionId);
        void deleteOrder(String orderId);
        OrderResponse cancelOrder(String orderId, String reason);
}
