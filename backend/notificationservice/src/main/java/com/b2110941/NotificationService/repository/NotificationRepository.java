package com.b2110941.NotificationService.repository;

import com.b2110941.NotificationService.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
    List<Notification> findByOrderIdOrderByCreatedAtDesc(String orderId);
    long countByUserIdAndStatus(String userId, String status);
}
