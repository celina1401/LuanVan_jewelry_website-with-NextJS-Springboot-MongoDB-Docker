package com.b2110941.OrderService.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
// @AllArgsConstructor
public class OrderResponse {
    private String id;
    private String orderNumber;
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
    private String shippingAddress;
    
    // Order details
    private List<OrderItemResponse> items;
    private Double subtotal;
    private Double shippingFee;
    private Double discount;
    private Double total;
    
    // Payment information
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private String paymentUrl;
    
    // Order status
    private String orderStatus;
    private String shippingStatus;
    private String codStatus;
    
    // Additional information
    private String note;
    private String channel;
    private Boolean smsNotification;
    private Boolean invoiceRequest;
    private String promoCode;
    private String invoiceUrl;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    public OrderResponse(String id, String orderNumber, String userId, String customerName, String customerPhone, String customerEmail, String receiverName, String street, String ward, String district, String province, String shippingAddress, List<OrderItemResponse> items, Double subtotal, Double shippingFee, Double discount, Double total, String paymentMethod, String paymentStatus, String transactionId, String paymentUrl, String orderStatus, String shippingStatus, String codStatus, String note, String channel, Boolean smsNotification, Boolean invoiceRequest, String promoCode, String invoiceUrl, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime paidAt, LocalDateTime shippedAt, LocalDateTime deliveredAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.receiverName = receiverName;
        this.street = street;
        this.ward = ward;
        this.district = district;
        this.province = province;
        this.shippingAddress = shippingAddress;
        this.items = items;
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.discount = discount;
        this.total = total;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
        this.paymentUrl = paymentUrl;
        this.orderStatus = orderStatus;
        this.shippingStatus = shippingStatus;
        this.codStatus = codStatus;
        this.note = note;
        this.channel = channel;
        this.smsNotification = smsNotification;
        this.invoiceRequest = invoiceRequest;
        this.promoCode = promoCode;
        this.invoiceUrl = invoiceUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.paidAt = paidAt;
        this.shippedAt = shippedAt;
        this.deliveredAt = deliveredAt;
    }
} 