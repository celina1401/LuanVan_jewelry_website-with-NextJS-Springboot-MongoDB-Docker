// package com.b2110941.UserService.controller;

// import com.b2110941.UserService.entity.ChatMessage;
// import com.b2110941.UserService.repository.ChatMessageRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;
// import java.time.LocalDateTime;
// import java.util.List;

// @RestController
// @RequestMapping("/api/chat")
// @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
// public class ChatController {
//     @Autowired
//     private ChatMessageRepository chatRepo;

//     @PostMapping("/send")
//     public ChatMessage sendMessage(@RequestBody ChatMessage msg) {
//         msg.setTimestamp(LocalDateTime.now());
//         return chatRepo.save(msg);
//     }

//     @GetMapping("/messages")
//     public List<ChatMessage> getMessages(
//         @RequestParam String userId
//     ) {
//         // Lấy tất cả tin nhắn giữa admin và user này
//         return chatRepo.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
//             userId, "admin", userId, "admin"
//         );
//     }
// } 