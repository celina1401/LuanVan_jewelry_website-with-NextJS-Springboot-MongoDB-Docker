package com.b2110941.ReviewService.controller;

import com.b2110941.ReviewService.payload.ReviewRequest;
import com.b2110941.ReviewService.payload.ReviewResponse;
import com.b2110941.ReviewService.payload.AdminReplyRequest;
import com.b2110941.ReviewService.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Store SSE emitters for real-time updates
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewRequest request) {
        try {
            ReviewResponse response = reviewService.createReview(request);
            
            // Send real-time update to admin page
            sendNewReviewUpdate(response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error creating review: " + e.getMessage());
            e.printStackTrace();  // Log chi tiết lỗi
            return ResponseEntity.status(500).body(null);
        }
    }
    

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProduct(@PathVariable String productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviewsByProduct(@PathVariable String productId) {
        System.out.println("==> [ReviewController] Getting ALL reviews (including inactive) for product: " + productId);
        List<ReviewResponse> reviews = reviewService.getAllReviewsByProduct(productId);
        System.out.println("==> [ReviewController] Total reviews found: " + reviews.size());
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUser(@PathVariable String userId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable String reviewId) {
        ReviewResponse review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable String reviewId, @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{reviewId}/hide")
    public ResponseEntity<ReviewResponse> hideReview(@PathVariable String reviewId) {
        try {
            ReviewResponse response = reviewService.hideReview(reviewId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error hiding review: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{reviewId}/unhide")
    public ResponseEntity<ReviewResponse> unhideReview(@PathVariable String reviewId) {
        try {
            ReviewResponse response = reviewService.unhideReview(reviewId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error unhiding review: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Admin reply endpoints
    @PostMapping("/{reviewId}/admin-reply")
    public ResponseEntity<ReviewResponse> addAdminReply(@PathVariable String reviewId, @RequestBody AdminReplyRequest request) {
        try {
            ReviewResponse response = reviewService.addAdminReply(reviewId, request);
            
            // Send real-time update to clients
            sendAdminReplyUpdate(reviewId, response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error adding admin reply: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{reviewId}/admin-reply")
    public ResponseEntity<ReviewResponse> updateAdminReply(@PathVariable String reviewId, @RequestBody AdminReplyRequest request) {
        try {
            ReviewResponse response = reviewService.updateAdminReply(reviewId, request);
            
            // Send real-time update to clients
            sendAdminReplyUpdate(reviewId, response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error updating admin reply: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{reviewId}/admin-reply")
    public ResponseEntity<ReviewResponse> removeAdminReply(@PathVariable String reviewId) {
        try {
            ReviewResponse response = reviewService.removeAdminReply(reviewId);
            
            // Send real-time update to clients
            sendAdminReplyUpdate(reviewId, response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error removing admin reply: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // SSE endpoint for real-time updates
    @GetMapping(value = "/sse/{productId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToUpdates(@PathVariable String productId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        String emitterId = productId + "_" + System.currentTimeMillis();
        emitters.put(emitterId, emitter);
        
        emitter.onCompletion(() -> emitters.remove(emitterId));
        emitter.onTimeout(() -> emitters.remove(emitterId));
        emitter.onError((ex) -> emitters.remove(emitterId));
        
        try {
            emitter.send(SseEmitter.event()
                .name("connect")
                .data("Connected to review updates for product: " + productId));
        } catch (IOException e) {
            emitters.remove(emitterId);
        }
        
        return emitter;
    }

    // SSE endpoint for admin page real-time updates
    @GetMapping(value = "/sse/admin", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToAdminUpdates() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        String emitterId = "admin_" + System.currentTimeMillis();
        emitters.put(emitterId, emitter);
        
        emitter.onCompletion(() -> emitters.remove(emitterId));
        emitter.onTimeout(() -> emitters.remove(emitterId));
        emitter.onError((ex) -> emitters.remove(emitterId));
        
        try {
            emitter.send(SseEmitter.event()
                .name("connect")
                .data("Connected to admin updates"));
        } catch (IOException e) {
            emitters.remove(emitterId);
        }
        
        return emitter;
    }

    // Helper method to send updates to all clients
    private void sendAdminReplyUpdate(String reviewId, ReviewResponse review) {
        List<String> toRemove = new ArrayList<>();
        
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                SseEmitter emitter = entry.getValue();
                emitter.send(SseEmitter.event()
                    .name("adminReplyUpdate")
                    .data(review));
            } catch (IOException e) {
                toRemove.add(entry.getKey());
            }
        }
        
        // Remove dead emitters
        for (String key : toRemove) {
            emitters.remove(key);
        }
    }

    // Helper method to send new review updates to admin
    private void sendNewReviewUpdate(ReviewResponse review) {
        List<String> toRemove = new ArrayList<>();
        
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                SseEmitter emitter = entry.getValue();
                if (entry.getKey().startsWith("admin_")) {
                    emitter.send(SseEmitter.event()
                        .name("newReview")
                        .data(review));
                }
            } catch (IOException e) {
                toRemove.add(entry.getKey());
            }
        }
        
        // Remove dead emitters
        for (String key : toRemove) {
            emitters.remove(key);
        }
    }

    @PostMapping("/migrate")
    public ResponseEntity<String> migrateExistingReviews() {
        try {
            reviewService.migrateExistingReviews();
            return ResponseEntity.ok("Migration completed successfully");
        } catch (Exception e) {
            System.out.println("Error during migration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Migration failed: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getReviewCountByProduct(@PathVariable String productId) {
        Long count = reviewService.getReviewCountByProduct(productId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Double> getAverageRatingByProduct(@PathVariable String productId) {
        Double averageRating = reviewService.getAverageRatingByProduct(productId);
        return ResponseEntity.ok(averageRating);
    }

    @GetMapping("/product/{productId}/rating-distribution")
    public ResponseEntity<List<Integer>> getRatingDistributionByProduct(@PathVariable String productId) {
        List<Integer> distribution = reviewService.getRatingDistributionByProduct(productId);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    /**
     * Upload ảnh cho review
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            System.out.println("==> [ReviewController] Upload request received");
            System.out.println("==> [ReviewController] Original filename: " + image.getOriginalFilename());
            System.out.println("==> [ReviewController] File size: " + image.getSize() + " bytes");
            
            // Tạo thư mục uploads nếu chưa có
            String uploadsDir = "uploads/reviews";
            Path uploadsPath = Paths.get(uploadsDir);
            System.out.println("==> [ReviewController] Upload directory: " + uploadsPath.toAbsolutePath());
            
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
                System.out.println("==> [ReviewController] Created upload directory");
            } else {
                System.out.println("==> [ReviewController] Upload directory already exists");
            }

            // Tạo tên file unique
            String originalFilename = image.getOriginalFilename();
            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = uploadsPath.resolve(fileName);
            System.out.println("==> [ReviewController] File will be saved as: " + fileName);
            System.out.println("==> [ReviewController] Full file path: " + filePath.toAbsolutePath());

            // Lưu file
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("==> [ReviewController] File saved successfully");

            // Trả về URL
            String imageUrl = "/uploads/reviews/" + fileName;
            System.out.println("==> [ReviewController] Returning URL: " + imageUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("filename", fileName);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.out.println("==> [ReviewController] Error uploading image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading image: " + e.getMessage());
        }
    }

    /**
     * Hiển thị ảnh review
     */
    @GetMapping("/image/{filename}")
    public ResponseEntity<?> getReviewImage(@PathVariable String filename) {
        try {
            System.out.println("==> [ReviewController] Requesting image: " + filename);
            
            Path imagePath = Paths.get("uploads/reviews/" + filename);
            System.out.println("==> [ReviewController] Full image path: " + imagePath.toAbsolutePath());
            
            if (Files.exists(imagePath)) {
                System.out.println("==> [ReviewController] Image exists, reading bytes...");
                byte[] imageBytes = Files.readAllBytes(imagePath);
                String contentType = Files.probeContentType(imagePath);
                if (contentType == null) {
                    contentType = "image/jpeg";
                }
                System.out.println("==> [ReviewController] Content type: " + contentType + ", Size: " + imageBytes.length + " bytes");
                
                return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .body(imageBytes);
            } else {
                System.out.println("==> [ReviewController] Image NOT found at: " + imagePath.toAbsolutePath());
                
                // List files in directory for debugging
                Path uploadsDir = Paths.get("uploads/reviews");
                // String uploadsDir = "D:\\.Mon_hoc\\LV_TotNghiep\\LuanVan_B2110941\\B2110941\\BackEnd\\reviewservice\\uploads\\reviews";
                Path uploadsPath = Paths.get(uploadsDir.toString());

                if (Files.exists(uploadsPath)) {
                    System.out.println("==> [ReviewController] Files in uploads/reviews directory:");
                    Files.list(uploadsPath).forEach(file -> {
                        System.out.println("  - " + file.getFileName());
                    });
                } else {
                    System.out.println("==> [ReviewController] uploads/reviews directory does not exist");
                }
                
                return ResponseEntity.status(404).body("Image not found: " + filename);
            }
        } catch (IOException e) {
            System.out.println("==> [ReviewController] Error reading image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error reading image: " + e.getMessage());
        }
    }
} 