package com.b2110941.ChatService.controller;

import com.b2110941.ChatService.entity.ChatLog;
import com.b2110941.ChatService.entity.ChatMessage;
import com.b2110941.ChatService.repository.ChatLogRepository;
import com.b2110941.ChatService.service.UserServiceClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Date;
import java.util.List;
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

    /**
     * 📩 Nhận tin nhắn từ client gửi qua WebSocket
     */
    @MessageMapping("/chat")
    public void handleMessage(@Payload ChatMessage message, @Header("userId") String userId) {
        // 🔍 Lấy vai trò từ user-service
        String role = userServiceClient.getUserRole(userId);

        // 📝 Gán thông tin vào message
        message.setSender(userId);
        message.setRole(role);
        message.setTimestamp(new Date());

        // 💾 Lưu vào MongoDB
        ChatLog log = ChatLog.builder()
                .sender(message.getSender())
                .role(message.getRole())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();

        chatLogRepository.save(log);
        System.out.println("✅ Lưu tin nhắn thành công: " + log);

        // 📤 Gửi về lại cho client
        if ("admin".equals(role)) {
            messagingTemplate.convertAndSend("/topic/admin", message);
        } else {
            messagingTemplate.convertAndSend("/topic/user/" + userId, message);
        }
    }

    /**
     * 📜 Trả về toàn bộ lịch sử chat (dành cho admin)
     */
    @GetMapping("/logs")
    public List<ChatLog> getAllLogs() {
        return chatLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
    }

    /**
     * 🔎 Trả về lịch sử được lọc theo userId, role, thời gian
     */
    @GetMapping("/filter")
    public ResponseEntity<?> filterLogs(
        @RequestParam(required = false) String userId,
        @RequestParam(required = false) String role,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to
    ) {
        List<ChatLog> logs = chatLogRepository.findAll().stream()
            .filter(log -> userId == null || log.getSender().equals(userId))
            .filter(log -> role == null || log.getRole().equals(role))
            .filter(log -> {
                if (from == null && to == null) return true;
    
                long ts = log.getTimestamp().getTime(); // ✅ Sửa ở đây
                boolean after = from == null || ts >= Instant.parse(from).toEpochMilli();
                boolean before = to == null || ts <= Instant.parse(to).toEpochMilli();
                return after && before;
            })
            .collect(Collectors.toList());
    
        return ResponseEntity.ok(logs);
    }
        
}
