package com.b2110941.OrderService.repository;

import com.b2110941.OrderService.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    
    List<Order> findByUserId(String userId);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Order> findByOrderStatus(String orderStatus);
    
    List<Order> findByPaymentStatus(String paymentStatus);
    
    List<Order> findByShippingStatus(String shippingStatus);
    
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("{'userId': ?0, 'orderStatus': ?1}")
    List<Order> findByUserIdAndOrderStatus(String userId, String orderStatus);
    
    @Query("{'userId': ?0, 'paymentStatus': ?1}")
    List<Order> findByUserIdAndPaymentStatus(String userId, String paymentStatus);
    
    @Query("{'orderNumber': {$regex: ?0, $options: 'i'}}")
    List<Order> findByOrderNumberContainingIgnoreCase(String orderNumber);
    
    @Query("{'customerName': {$regex: ?0, $options: 'i'}}")
    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);
} 