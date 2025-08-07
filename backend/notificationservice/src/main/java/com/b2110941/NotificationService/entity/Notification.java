package com.b2110941.NotificationService.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    private String userId;
    private String orderId;
    private String title;
    private String message;
    private String type; // ORDER_STATUS, SHIPPING_STATUS, GENERAL
    private String status; // READ, UNREAD
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
