package com.b2110941.OrderService.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private String userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // Shipping information
    private String receiverName;
    private String street;
    private String ward;
    private String district;
    private String province;
    
    // Order details
    private List<OrderItemRequest> items;
    private Double subtotal;
    private Double shippingFee;
    private Double discount;
    private Double total;
    
    // Payment information
    private String paymentMethod;
    
    // Additional information
    private String note;
    private Boolean smsNotification;
    private Boolean invoiceRequest;
    private String promoCode;
} 