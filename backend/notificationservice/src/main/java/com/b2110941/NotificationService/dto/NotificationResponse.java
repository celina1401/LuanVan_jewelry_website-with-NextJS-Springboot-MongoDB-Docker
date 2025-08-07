package com.b2110941.NotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String userId;
    private String orderId;
    private String orderNumber;
    private String title;
    private String message;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
