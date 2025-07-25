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
            // if ("admin".equals(role)) {
            //     messagingTemplate.convertAndSend("/topic/user/" + message.getReceiver(), message);
            // } else {
            //     messagingTemplate.convertAndSend("/topic/admin", message);
            // }

            // Gửi tin nhắn đến đúng topic
if ("admin".equals(role)) {
    messagingTemplate.convertAndSend("/topic/user/" + message.getReceiver(), message);
} else {
    // ✅ Thêm type để admin client biết là tin mới => reload inbox
    message.setType("new-message");
    messagingTemplate.convertAndSend("/topic/admin", message);
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
            }
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //     @PostMapping("/markAsRead/{userId}")
    //     public ResponseEntity<?> markAsRead(@PathVariable String userId) {
    //         try {
    //             List<ChatLog> unread = chatLogRepository.findBySenderAndReceiverAndReadIsFalse(userId, "admin");
    //             if (!unread.isEmpty()) {
    //                 unread.forEach(log -> log.setRead(true));
    //                 chatLogRepository.saveAll(unread);
    //             }

    //             ChatMessage signal = new ChatMessage();
    // signal.setReceiver(userId);
    // signal.setType("read-update");
    // messagingTemplate.convertAndSend("/topic/admin", signal);


    //             return ResponseEntity.ok().build();
    //         } catch (Exception e) {
    //             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //         }
    //     }

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
        messagingTemplate.convertAndSend("/topic/admin", signal);
    
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
}
