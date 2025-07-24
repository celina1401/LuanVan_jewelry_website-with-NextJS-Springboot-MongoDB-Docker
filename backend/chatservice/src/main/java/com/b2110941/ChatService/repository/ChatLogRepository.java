package com.b2110941.ChatService.repository;

import com.b2110941.ChatService.entity.ChatLog;
import com.b2110941.ChatService.entity.ChatSummary;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface ChatLogRepository extends MongoRepository<ChatLog, String>, ChatLogRepositoryCustom {

    // 📌 Lấy tất cả tin nhắn mà user là sender hoặc receiver với sắp xếp
    @Query("{ '$or': [ { 'sender': ?0 }, { 'receiver': ?0 } ] }")
    List<ChatLog> findBySenderOrReceiver(String userId, Sort sort);

    // Nếu chỉ lưu 'sender' và không có 'receiver', dùng cái này (không cần nếu đã có query trên)
    List<ChatLog> findBySender(String sender);

    // Tạo tóm tắt tin nhắn cuối cùng cho mỗi user (cần triển khai logic aggregation)
    @Query(value = "{ 'receiver': 'admin' }", sort = "{ 'timestamp': -1 }")
    List<ChatSummary> aggregateLastMessagesPerUser();

    // Tìm tin nhắn chưa đọc giữa sender và receiver
    List<ChatLog> findBySenderAndReceiverAndReadIsFalse(String sender, String receiver);

    // Đếm số tin nhắn chưa đọc giữa sender và receiver
    long countBySenderAndReceiverAndReadIsFalse(String sender, String receiver);

    // Tìm tin nhắn dựa trên content và timestamp
    Optional<ChatLog> findByContentAndTimestamp(String content, Date timestamp);
}