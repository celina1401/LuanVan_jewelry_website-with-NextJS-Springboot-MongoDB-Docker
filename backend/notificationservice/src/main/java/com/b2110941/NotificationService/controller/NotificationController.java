package com.b2110941.NotificationService.controller;

import com.b2110941.NotificationService.dto.NotificationRequest;
import com.b2110941.NotificationService.dto.NotificationResponse;
import com.b2110941.NotificationService.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        try {
            NotificationResponse response = notificationService.createNotification(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable String userId) {
        try {
            List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting notifications for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUserUnreadNotifications(@PathVariable String userId) {
        try {
            List<NotificationResponse> notifications = notificationService.getUserUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting unread notifications for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error getting unread count for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable String notificationId) {
        try {
            NotificationResponse response = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUserNotifications(@PathVariable String userId) {
        try {
            notificationService.deleteUserNotifications(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting notifications for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/order-status")
    public ResponseEntity<NotificationResponse> createOrderStatusNotification(
            @RequestParam String userId,
            @RequestParam String orderId,
            @RequestParam String orderNumber,
            @RequestParam String customerName,
            @RequestParam String customerEmail,
            @RequestParam String customerPhone,
            @RequestParam String oldStatus,
            @RequestParam String newStatus) {
        try {
            NotificationResponse response = notificationService.createOrderStatusNotification(
                    userId, orderId, orderNumber, customerName, customerEmail, customerPhone, oldStatus, newStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating order status notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/shipping-status")
    public ResponseEntity<NotificationResponse> createShippingStatusNotification(
            @RequestParam String userId,
            @RequestParam String orderId,
            @RequestParam String orderNumber,
            @RequestParam String customerName,
            @RequestParam String customerEmail,
            @RequestParam String customerPhone,
            @RequestParam String oldStatus,
            @RequestParam String newStatus) {
        try {
            NotificationResponse response = notificationService.createShippingStatusNotification(
                    userId, orderId, orderNumber, customerName, customerEmail, customerPhone, oldStatus, newStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating shipping status notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin-message")
    public ResponseEntity<NotificationResponse> createAdminMessageNotification(
            @RequestParam String userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type,
            @RequestParam String sender,
            @RequestParam String content,
            @RequestParam String timestamp) {
        try {
            NotificationResponse response = notificationService.createAdminMessageNotification(
                    userId, title, message, type, sender, content, timestamp);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating admin message notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }


} 