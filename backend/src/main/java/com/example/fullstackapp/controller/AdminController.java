package com.example.fullstackapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAdminAccess() {
        // If this endpoint is reached, it means the user has the ADMIN role 
        // due to Spring Security configuration.
        return ResponseEntity.ok().body(new AdminVerificationResponse(true));
    }

    // Helper class for the response body
    static class AdminVerificationResponse {
        public boolean isAdmin;

        public AdminVerificationResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }
    }
} 