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

    public double getAverageRatingByProduct(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrue(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double totalRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .sum();
        return totalRating / reviews.size();
    }

    public List<Integer> getRatingDistributionByProduct(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrue(productId);
        List<Integer> distribution = reviews.stream()
                .map(Review::getRating)
                .collect(Collectors.toList());
        System.out.println("==> [ReviewService] Rating distribution: " + distribution);
        return distribution;
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