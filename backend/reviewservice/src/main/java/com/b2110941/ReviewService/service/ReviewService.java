package com.b2110941.ReviewService.service;

import com.b2110941.ReviewService.entity.Review;
import com.b2110941.ReviewService.payload.ReviewRequest;
import com.b2110941.ReviewService.payload.ReviewResponse;
import com.b2110941.ReviewService.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public ReviewResponse createReview(ReviewRequest request) {
        Review review = new Review();
        review.setProductId(request.getProductId());
        review.setUserId(request.getUserId());
        review.setUserName(request.getUserName());
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        review.setImages(request.getImages());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        review.setActive(true);
        
        Review savedReview = reviewRepository.save(review);
        return convertToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProduct(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrue(productId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUser(String userId) {
        List<Review> reviews = reviewRepository.findByUserIdAndIsActiveTrue(userId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse updateReview(String reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        review.setImages(request.getImages());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    public void deleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setActive(false);
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    public long getReviewCountByProduct(String productId) {
        return reviewRepository.countByProductIdAndIsActiveTrue(productId);
    }

    public ReviewResponse getReviewById(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return convertToResponse(review);
    }

    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse convertToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProductId(),
                review.getUserId(),
                review.getUserName(),
                review.getComment(),
                review.getRating(),
                review.getImages(),
                review.getCreatedAt(),
                review.getUpdatedAt(),
                review.isActive()
        );
    }
} 