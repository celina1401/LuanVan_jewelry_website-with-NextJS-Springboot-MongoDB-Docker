package com.b2110941.ReviewService.service;

import com.b2110941.ReviewService.entity.Review;
import com.b2110941.ReviewService.payload.ReviewRequest;
import com.b2110941.ReviewService.payload.ReviewResponse;
import com.b2110941.ReviewService.payload.AdminReplyRequest;
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
        System.out.println("==> [ReviewService] Creating new review for product: " + request.getProductId());
        
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
        review.setHidden(false); // New reviews are not hidden by default
        
        System.out.println("==> [ReviewService] Review before save - isActive: " + review.isActive() + ", isHidden: " + review.isHidden());
        
        Review savedReview = reviewRepository.save(review);
        
        System.out.println("==> [ReviewService] Review after save - isActive: " + savedReview.isActive() + ", isHidden: " + savedReview.isHidden());
        
        ReviewResponse response = convertToResponse(savedReview);
        System.out.println("==> [ReviewService] Response - isActive: " + response.isActive() + ", isHidden: " + response.isHidden());
        
        return response;
    }

    // Method to migrate existing reviews to have proper default values
    public void migrateExistingReviews() {
        System.out.println("==> [ReviewService] Starting migration of existing reviews...");
        List<Review> allReviews = reviewRepository.findAll();
        int migratedCount = 0;
        
        for (Review review : allReviews) {
            boolean needsUpdate = false;
            
            // Set default values for new fields
            // Since boolean fields default to false, we need to check if they were explicitly set
            // For existing reviews, we'll assume they should be active and not hidden
            review.setHidden(false);
            review.setActive(true);
            needsUpdate = true;
            
            if (needsUpdate) {
                reviewRepository.save(review);
                migratedCount++;
            }
        }
        
        System.out.println("==> [ReviewService] Migration completed. Updated " + migratedCount + " reviews.");
    }

    public List<ReviewResponse> getReviewsByProduct(String productId) {
        // For client view - only show active and not hidden reviews
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrueAndIsHiddenFalse(productId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviewsByProduct(String productId) {
        System.out.println("==> [ReviewService] Getting ALL reviews (including inactive) for product: " + productId);
        List<Review> reviews = reviewRepository.findByProductId(productId);
        System.out.println("==> [ReviewService] Total reviews found: " + reviews.size());
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

    // Add admin reply to review
    public ReviewResponse addAdminReply(String reviewId, AdminReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setAdminReply(request.getAdminReply());
        review.setAdminId(request.getAdminId());
        review.setAdminName(request.getAdminName());
        review.setAdminReplyDate(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    // Update admin reply
    public ReviewResponse updateAdminReply(String reviewId, AdminReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setAdminReply(request.getAdminReply());
        review.setAdminId(request.getAdminId());
        review.setAdminName(request.getAdminName());
        review.setAdminReplyDate(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    // Remove admin reply
    public ReviewResponse removeAdminReply(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setAdminReply(null);
        review.setAdminId(null);
        review.setAdminName(null);
        review.setAdminReplyDate(null);
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    // Hide review from clients (soft delete)
    public ReviewResponse hideReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setHidden(true);
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    // Unhide review for clients
    public ReviewResponse unhideReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setHidden(false);
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    // Permanently delete review from database
    public void deleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setActive(false);
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    public long getReviewCountByProduct(String productId) {
        // For client view - only count active and not hidden reviews
        return reviewRepository.countByProductIdAndIsActiveTrueAndIsHiddenFalse(productId);
    }

    public double getAverageRatingByProduct(String productId) {
        // For client view - only calculate from active and not hidden reviews
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrueAndIsHiddenFalse(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double totalRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .sum();
        return totalRating / reviews.size();
    }

    public List<Integer> getRatingDistributionByProduct(String productId) {
        // For client view - only calculate from active and not hidden reviews
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrueAndIsHiddenFalse(productId);
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
                review.isActive(),
                review.isHidden(),
                review.getAdminReply(),
                review.getAdminReplyDate(),
                review.getAdminId(),
                review.getAdminName()
        );
    }
} 