package com.b2110941.ChatService.controller;

import com.b2110941.ChatService.entity.ChatLog;
import com.b2110941.ChatService.entity.ChatMessage;
import com.b2110941.ChatService.entity.ChatSummary;
import com.b2110941.ChatService.repository.ChatLogRepository;
import com.b2110941.ChatService.service.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatserviceController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private ChatLogRepository chatLogRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    @MessageMapping("/chat")
    public void handleMessage(@Payload ChatMessage message) {
        try {
            if (message.getSender() == null) {
                System.err.println("❌ Lỗi: Sender null trong payload!");
                return;
            }

            String role = userServiceClient.getUserRole(message.getSender());
            if (role == null) {
                System.err.println("❌ Lỗi: Không tìm thấy role cho sender: " + message.getSender());
                return;
            }

            message.setRole(role);
            message.setTimestamp(new Date());

            // Kiểm tra tin nhắn đã tồn tại chưa
            if (chatLogRepository.findByContentAndTimestamp(message.getContent(), message.getTimestamp()).isEmpty()) {
                ChatLog log = ChatLog.builder()
                        .sender(message.getSender())
                        .receiver(message.getReceiver())
                        .role(message.getRole())
                        .content(message.getContent())
                        .timestamp(message.getTimestamp())
                        .read(false)
                        .build();

                chatLogRepository.save(log);
            }

            // Gửi tin nhắn đến đúng topic
            if ("admin".equals(role)) {
                messagingTemplate.convertAndSend("/topic/user/" + message.getReceiver(), message);
                
                // ✅ Gửi notification cho client khi admin gửi tin nhắn
                try {
                    sendAdminMessageNotification(message);
                } catch (Exception e) {
                    System.err.println("❌ Lỗi gửi notification: " + e.getMessage());
                }
            } else {
                // ✅ Gửi tin nhắn user đến topic riêng biệt để tránh xung đột với read-update
                message.setType("new-message");
                messagingTemplate.convertAndSend("/topic/chat-messages", message);
            }

        } catch (Exception e) {
            System.err.println("❌ Lỗi xử lý tin nhắn: " + e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ChatLog>> getAllLogs(@RequestParam(defaultValue = "50") int limit) {
        try {
            List<ChatLog> logs = chatLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"))
                    .stream().limit(limit).collect(Collectors.toList());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/filter/{userId}")
    public ResponseEntity<List<ChatMessage>> filterByUserId(@PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<ChatLog> logs = chatLogRepository
                    .findBySenderOrReceiver(userId, Sort.by(Sort.Direction.DESC, "timestamp"))
                    .stream()
                    .limit(limit)
                    .filter(log -> (log.getSender().equals(userId) && log.getReceiver().equals("admin")) ||
                            (log.getSender().equals("admin") && log.getReceiver().equals(userId)))
                    .collect(Collectors.toList());

            List<ChatMessage> messages = logs.stream()
                    .map(log -> ChatMessage.builder()
                            .sender(log.getSender())
                            .receiver(log.getReceiver())
                            .content(log.getContent())
                            .role(log.getRole())
                            .timestamp(log.getTimestamp())
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<ChatSummary>> getInbox() {
        try {
            List<ChatSummary> summaries = chatLogRepository.aggregateLastMessagesBetweenAdminAndUsers();
            for (ChatSummary summary : summaries) {
                long unread = chatLogRepository.countBySenderAndReceiverAndReadIsFalse(summary.getUserId(), "admin");
                summary.setUnreadCount(unread);
                // Lấy full name từ user service
                String username = userServiceClient.getUserFullName(summary.getUserId());
                summary.setUsername(username != null ? username : summary.getUserId());
            }
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/markAsRead/{userId}")
    public ResponseEntity<?> markAsRead(@PathVariable String userId) {
        List<ChatLog> unread = chatLogRepository.findBySenderAndReceiverAndReadIsFalse(userId, "admin");
        System.out.println("🔍 Tin chưa đọc từ user " + userId + ": " + unread.size());

        if (!unread.isEmpty()) {
            unread.forEach(log -> log.setRead(true));
            chatLogRepository.saveAll(unread);
        }

        ChatMessage signal = new ChatMessage();
        signal.setReceiver(userId);
        signal.setType("read-update");
        // Gửi signal đến topic riêng biệt để tránh ảnh hưởng đến chat
        messagingTemplate.convertAndSend("/topic/read-updates", signal);

        return ResponseEntity.ok().build();
    }

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        String userId = StompHeaderAccessor.wrap(event.getMessage()).getFirstNativeHeader("userId");
        if (userId != null) {
            onlineUsers.add(userId);
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String userId = StompHeaderAccessor.wrap(event.getMessage()).getFirstNativeHeader("userId");
        if (userId != null) {
            onlineUsers.remove(userId);
        }
    }

    @GetMapping("/online-users")
    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }

    /**
     * Gửi notification cho client khi admin gửi tin nhắn
     * Tương tự như thay đổi trạng thái đơn hàng
     */
    private void sendAdminMessageNotification(ChatMessage message) {
        try {
            // Gọi Notification Service để tạo notification
            String notificationUrl = "http://notificationservice:9002/api/notifications/admin-message";
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("userId", message.getReceiver());
            body.add("title", "Tin nhắn mới từ Admin");
            body.add("message", "Admin đã gửi tin nhắn: " + message.getContent());
            body.add("type", "ADMIN_MESSAGE");
            body.add("sender", message.getSender());
            body.add("content", message.getContent());
            body.add("timestamp", message.getTimestamp().toString());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            // Gửi notification qua REST API
            restTemplate.postForEntity(notificationUrl, request, String.class);
            
            System.out.println("✅ Đã gửi notification cho user: " + message.getReceiver());
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi admin message notification: " + e.getMessage());
            // Không làm hỏng flow chat chính
        }
    }
}
