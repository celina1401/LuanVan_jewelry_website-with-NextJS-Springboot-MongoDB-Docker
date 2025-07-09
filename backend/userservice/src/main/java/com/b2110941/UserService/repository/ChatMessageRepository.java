package com.b2110941.UserService.repository;

import com.b2110941.UserService.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderIdOrReceiverId(String senderId, String receiverId);
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
        String senderId1, String receiverId1, String senderId2, String receiverId2
    );
} 