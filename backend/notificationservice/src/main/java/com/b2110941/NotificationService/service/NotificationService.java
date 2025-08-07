package com.b2110941.NotificationService.service;

import com.b2110941.NotificationService.dto.NotificationRequest;
import com.b2110941.NotificationService.dto.NotificationResponse;
import com.b2110941.NotificationService.entity.Notification;
import com.b2110941.NotificationService.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final WebSocketService webSocketService;

    public NotificationResponse createNotification(NotificationRequest request) {
        try {
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

            Notification savedNotification = notificationRepository.save(notification);
            
            // Send email notification
            if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
                emailService.sendNotificationEmail(request.getCustomerEmail(), request.getTitle(), request.getMessage());
            }

            // Send WebSocket notification
            webSocketService.sendNotificationToUser(request.getUserId(), convertToResponse(savedNotification));

            log.info("Notification created successfully for user: {}, order: {}", request.getUserId(), request.getOrderId());
            return convertToResponse(savedNotification);
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create notification", e);
        }
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUserUnreadNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "UNREAD");
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        
        Notification updatedNotification = notificationRepository.save(notification);
        return convertToResponse(updatedNotification);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndStatus(userId, "UNREAD");
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void deleteUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
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
