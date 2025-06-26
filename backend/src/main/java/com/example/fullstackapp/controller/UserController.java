package com.example.fullstackapp.controller;

import com.example.fullstackapp.model.User;
import com.example.fullstackapp.payload.request.UserSyncRequest;
import com.example.fullstackapp.payload.response.UserResponse;
import com.example.fullstackapp.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // ✅ API lấy thông tin người dùng hiện tại (tùy dùng SecurityContext)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("authenticated", false);
                return ResponseEntity.ok(response);
            }

            response.put("authenticated", true);
            response.put("username", authentication.getName());

            var roles = authentication.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .collect(Collectors.toList());
            response.put("roles", roles);

            String userId = authentication.getName();
            Optional<User> user = userRepository.findById(userId);
            user.ifPresent(u -> {
                response.put("email", u.getEmail());
                response.put("firstName", u.getFirstName());
                response.put("lastName", u.getLastName());
                response.put("imageUrl", u.getImageUrl());
            });

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("error", "Failed to retrieve user details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ API đồng bộ user từ Clerk
    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody UserSyncRequest request) {
        System.out.println("🔄 Received sync request: " + request.getUserId() + " - " + request.getEmail());
        
        if (request.getUserId() == null || request.getEmail() == null) {
            System.out.println("❌ Missing userId or email");
            return ResponseEntity.badRequest().body("Missing userId or email");
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Nếu userId khác thì cập nhật luôn userId (trường hợp đổi provider)
                if (!request.getUserId().equals(user.getUserId())) {
                    user.setUserId(request.getUserId());
                }
                System.out.println("📝 Updating existing user by email: " + user.getEmail());
            } else {
                user = new User();
                user.setUserId(request.getUserId());
                user.setEmail(request.getEmail());
                System.out.println("🆕 Creating new user: " + request.getEmail());
            }

            // Cập nhật thông tin user
            user.setUsername(request.getUsername());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setImageUrl(request.getImageUrl());
            user.setProvider(request.getProvider() != null ? request.getProvider() : "clerk");
            user.setRole(request.getRole() != null ? request.getRole() : "user");

            try {
                User savedUser = userRepository.save(user);
                System.out.println("✅ User synced successfully: " + savedUser.getEmail() + " (ID: " + savedUser.getId() + ")");
                return ResponseEntity.ok(new UserResponse(
                        savedUser.getUserId(),
                        savedUser.getUsername(),
                        savedUser.getEmail(),
                        savedUser.getFirstName(),
                        savedUser.getLastName(),
                        savedUser.getImageUrl(),
                        savedUser.getRole()
                ));
            } catch (org.springframework.dao.DuplicateKeyException dupEx) {
                // Nếu bị lỗi duplicate key, update user thay vì tạo mới
                System.out.println("⚠️ Duplicate email detected, updating existing user!");
                user = userRepository.findByEmail(request.getEmail()).orElse(user);
                user.setUserId(request.getUserId());
                user.setUsername(request.getUsername());
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setImageUrl(request.getImageUrl());
                user.setProvider(request.getProvider() != null ? request.getProvider() : "clerk");
                user.setRole(request.getRole() != null ? request.getRole() : "user");
                User savedUser = userRepository.save(user);
                return ResponseEntity.ok(new UserResponse(
                        savedUser.getUserId(),
                        savedUser.getUsername(),
                        savedUser.getEmail(),
                        savedUser.getFirstName(),
                        savedUser.getLastName(),
                        savedUser.getImageUrl(),
                        savedUser.getRole()
                ));
            }
        } catch (Exception e) {
            System.out.println("❌ Error syncing user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error syncing user: " + e.getMessage());
        }
    }

    // 🔍 Test endpoint để kiểm tra MongoDB
    @GetMapping("/test")
    public ResponseEntity<?> testMongoDB() {
        try {
            long count = userRepository.count();
            List<User> allUsers = userRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "MongoDB connection successful");
            response.put("totalUsers", count);
            response.put("users", allUsers.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("userId", user.getUserId());
                userMap.put("email", user.getEmail());
                userMap.put("username", user.getUsername());
                userMap.put("role", user.getRole());
                return userMap;
            }).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ MongoDB test failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("MongoDB test failed: " + e.getMessage());
        }
    }
}
