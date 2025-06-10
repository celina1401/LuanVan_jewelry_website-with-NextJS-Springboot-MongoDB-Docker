package com.example.fullstackapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 1️⃣ Thêm @PreAuthorize để chỉ ADMIN mới truy cập được
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /**
     * Khi user có JWT hợp lệ và đã được convert claim public_metadata.role -> ROLE_ADMIN,
     * thì mới cho phép vào method này.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/verify")
    public ResponseEntity<AdminVerificationResponse> verifyAdminAccess() {
        return ResponseEntity.ok(new AdminVerificationResponse(true));
    }

    // DTO cho response JSON
    public static class AdminVerificationResponse {
        private final boolean isAdmin;

        public AdminVerificationResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }

        public boolean isAdmin() {
            return isAdmin;
        }
    }
}
