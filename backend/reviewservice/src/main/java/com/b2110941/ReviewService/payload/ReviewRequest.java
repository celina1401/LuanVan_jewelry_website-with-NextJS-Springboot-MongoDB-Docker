package com.b2110941.ReviewService.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private String productId;
    private String userId;
    private String userName;
    private String comment;
    private int rating;
    private List<String> images;
} 