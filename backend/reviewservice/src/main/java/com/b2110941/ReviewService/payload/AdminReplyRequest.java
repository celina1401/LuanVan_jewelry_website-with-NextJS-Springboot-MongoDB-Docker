package com.b2110941.ReviewService.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReplyRequest {
    private String adminReply;
    private String adminId;
    private String adminName;
} 