package com.b2110941.ReviewService.payload;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class ReviewResponse {
    private String id;
    private String productId;
    private String userId;
    private String userName;
    private String comment;
    private int rating;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @JsonProperty("isActive")
    private boolean isActive;
    @JsonProperty("isHidden")
    private boolean isHidden;
    
    // Admin reply fields
    private String adminReply;
    private LocalDateTime adminReplyDate;
    private String adminId;
    private String adminName;
    
    // Constructor without admin reply fields (for backward compatibility)
    public ReviewResponse(String id, String productId, String userId, String userName, 
                         String comment, int rating, List<String> images, 
                         LocalDateTime createdAt, LocalDateTime updatedAt, 
                         boolean isActive, boolean isHidden) {
        this.id = id;
        this.productId = productId;
        this.userId = userId;
        this.userName = userName;
        this.comment = comment;
        this.rating = rating;
        this.images = images;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isActive = isActive;
        this.isHidden = isHidden;
        this.adminReply = null;
        this.adminReplyDate = null;
        this.adminId = null;
        this.adminName = null;
    }
    
    // Constructor with admin reply fields
    public ReviewResponse(String id, String productId, String userId, String userName, 
                         String comment, int rating, List<String> images, 
                         LocalDateTime createdAt, LocalDateTime updatedAt, 
                         boolean isActive, boolean isHidden,
                         String adminReply, LocalDateTime adminReplyDate, 
                         String adminId, String adminName) {
        this.id = id;
        this.productId = productId;
        this.userId = userId;
        this.userName = userName;
        this.comment = comment;
        this.rating = rating;
        this.images = images;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isActive = isActive;
        this.isHidden = isHidden;
        this.adminReply = adminReply;
        this.adminReplyDate = adminReplyDate;
        this.adminId = adminId;
        this.adminName = adminName;
    }
} 