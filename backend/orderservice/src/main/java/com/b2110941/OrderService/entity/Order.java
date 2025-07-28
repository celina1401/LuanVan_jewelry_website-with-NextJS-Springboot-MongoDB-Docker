package com.b2110941.OrderService.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String orderNumber;
    
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
    private List<OrderItem> items;
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
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    
    // Metadata
    private String createdBy;
    private String updatedBy;
} 