package com.b2110941.NotificationService.service;

import com.b2110941.NotificationService.dto.NotificationRequest;
import com.b2110941.NotificationService.dto.NotificationResponse;
import com.b2110941.NotificationService.entity.Notification;
import com.b2110941.NotificationService.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    
    @Autowired(required = false)
    private EmailService emailService;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;

    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setOrderId(request.getOrderId());
        notification.setOrderNumber(request.getOrderNumber());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        notification.setStatus("UNREAD");
        notification.setCreatedAt(LocalDateTime.now());
        notification.setCustomerName(request.getCustomerName());
        notification.setCustomerEmail(request.getCustomerEmail());
        notification.setCustomerPhone(request.getCustomerPhone());

        Notification persisted = null;
        try {
            persisted = notificationRepository.save(notification);
        } catch (Exception e) {
            // DB lỗi: vẫn tiếp tục gửi WS để client nhận real-time
            log.warn("Notification DB save failed, sending WS only. Cause: {}", e.getMessage());
        }

        // Gửi email (nếu có cấu hình) – không làm hỏng flow
        try {
            if (emailService != null && request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
                emailService.sendNotificationEmail(request.getCustomerEmail(), request.getTitle(), request.getMessage());
            }
        } catch (Exception e) {
            log.warn("Failed to send email notification: {}", e.getMessage());
        }

        // Gửi WebSocket để client nhận ngay
        try {
            if (webSocketService != null) {
                NotificationResponse payload = persisted != null ? convertToResponse(persisted) : new NotificationResponse(
                        null,
                        notification.getUserId(),
                        notification.getOrderId(),
                        notification.getOrderNumber(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getType(),
                        notification.getStatus(),
                        notification.getCreatedAt(),
                        null,
                        notification.getCustomerName(),
                        notification.getCustomerEmail(),
                        notification.getCustomerPhone()
                );
                webSocketService.sendNotificationToUser(request.getUserId(), payload);
            }
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification: {}", e.getMessage());
        }

        log.info("Notification processed for user: {}, order: {} (persisted: {})", request.getUserId(), request.getOrderId(), persisted != null);
        return persisted != null ? convertToResponse(persisted) : new NotificationResponse(
                null,
                notification.getUserId(),
                notification.getOrderId(),
                notification.getOrderNumber(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getStatus(),
                notification.getCreatedAt(),
                null,
                notification.getCustomerName(),
                notification.getCustomerEmail(),
                notification.getCustomerPhone()
        );
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting notifications for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get notifications for user: " + userId, e);
        }
    }

    public List<NotificationResponse> getUserUnreadNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "UNREAD");
            return notifications.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting unread notifications for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get unread notifications for user: " + userId, e);
        }
    }

    public NotificationResponse markAsRead(String notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
            
            Notification updatedNotification = notificationRepository.save(notification);
            return convertToResponse(updatedNotification);
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage(), e);
            throw new RuntimeException("Failed to mark notification as read: " + notificationId, e);
        }
    }

    public long getUnreadCount(String userId) {
        try {
            return notificationRepository.countByUserIdAndStatus(userId, "UNREAD");
        } catch (Exception e) {
            log.error("Error getting unread count for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get unread count for user: " + userId, e);
        }
    }

    public void deleteNotification(String notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete notification: " + notificationId, e);
        }
    }

    public void deleteUserNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            notificationRepository.deleteAll(notifications);
        } catch (Exception e) {
            log.error("Error deleting notifications for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete notifications for user: " + userId, e);
        }
    }

    private NotificationResponse convertToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getOrderId(),
                notification.getOrderNumber(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getStatus(),
                notification.getCreatedAt(),
                notification.getReadAt(),
                notification.getCustomerName(),
                notification.getCustomerEmail(),
                notification.getCustomerPhone()
        );
    }

    // Method to create order status change notification
    public NotificationResponse createOrderStatusNotification(String userId, String orderId, String orderNumber, 
                                                           String customerName, String customerEmail, String customerPhone,
                                                           String oldStatus, String newStatus) {
        String title = "Cập nhật trạng thái đơn hàng";
        String message = String.format("Đơn hàng %s của bạn đã được cập nhật từ '%s' thành '%s'", 
                orderNumber, oldStatus, newStatus);

        NotificationRequest request = new NotificationRequest();
        request.setUserId(userId);
        request.setOrderId(orderId);
        request.setOrderNumber(orderNumber);
        request.setCustomerName(customerName);
        request.setCustomerEmail(customerEmail);
        request.setCustomerPhone(customerPhone);
        request.setTitle(title);
        request.setMessage(message);
        request.setType("ORDER_STATUS");
        request.setOldStatus(oldStatus);
        request.setNewStatus(newStatus);

        return createNotification(request);
    }

    // Method to create shipping status change notification
    public NotificationResponse createShippingStatusNotification(String userId, String orderId, String orderNumber,
                                                              String customerName, String customerEmail, String customerPhone,
                                                              String oldStatus, String newStatus) {
        String title = "Cập nhật trạng thái giao hàng";
        String message = String.format("Đơn hàng %s của bạn đã được cập nhật trạng thái giao hàng từ '%s' thành '%s'", 
                orderNumber, oldStatus, newStatus);

        NotificationRequest request = new NotificationRequest();
        request.setUserId(userId);
        request.setOrderId(orderId);
        request.setOrderNumber(orderNumber);
        request.setCustomerName(customerName);
        request.setCustomerEmail(customerEmail);
        request.setCustomerPhone(customerPhone);
        request.setTitle(title);
        request.setMessage(message);
        request.setType("SHIPPING_STATUS");
        request.setOldStatus(oldStatus);
        request.setNewStatus(newStatus);

        return createNotification(request);
    }
}
