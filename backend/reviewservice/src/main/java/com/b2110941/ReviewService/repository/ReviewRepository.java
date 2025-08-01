package com.b2110941.ReviewService.repository;

import com.b2110941.ReviewService.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductIdAndIsActiveTrue(String productId);
    List<Review> findByUserIdAndIsActiveTrue(String userId);
    List<Review> findByProductIdAndUserIdAndIsActiveTrue(String productId, String userId);
    long countByProductIdAndIsActiveTrue(String productId);
} 