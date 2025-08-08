package com.b2110941.NotificationService.service;

import com.b2110941.NotificationService.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "websocket.enabled", havingValue = "true", matchIfMissing = true)
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(String userId, NotificationResponse notification) {
        try {
            if (messagingTemplate == null) {
                log.warn("SimpMessagingTemplate is not available, skipping WebSocket notification");
                return;
            }
            String destination = "/topic/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("WebSocket notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to user: {}, error: {}", userId, e.getMessage(), e);
        }
    }

    public void sendNotificationToAll(NotificationResponse notification) {
        try {
            if (messagingTemplate == null) {
                log.warn("SimpMessagingTemplate is not available, skipping WebSocket notification");
                return;
            }
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("WebSocket notification sent to all users");
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to all users, error: {}", e.getMessage(), e);
        }
    }
}
