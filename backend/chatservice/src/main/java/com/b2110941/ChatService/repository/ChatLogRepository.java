package com.b2110941.ChatService.repository;

import com.b2110941.ChatService.entity.ChatLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatLogRepository extends MongoRepository<ChatLog, String> {

    // Tuỳ chọn: tìm lịch sử theo người gửi
    List<ChatLog> findBySender(String sender);

    // Tuỳ chọn: tìm theo vai trò
    List<ChatLog> findByRole(String role);
}
