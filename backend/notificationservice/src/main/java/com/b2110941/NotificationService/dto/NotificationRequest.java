package com.b2110941.NotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String userId;
    private String orderId;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String title;
    private String message;
    private String type; // ORDER_STATUS, SHIPPING_STATUS, GENERAL
    private String oldStatus;
    private String newStatus;
}
