package com.b2110941.UserService.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.repository.UserRepository;
import com.b2110941.UserService.payload.request.UserSyncRequest;
import com.b2110941.UserService.payload.response.UserResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping ("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody UserSyncRequest request) {
        System.out.println("🔄 Received sync request: " + request.getUserId() + " - " + request.getEmail());

        if (request.getUserId() == null || request.getEmail() == null) {
            System.out.println("❌ Missing userId or email");
            return ResponseEntity.badRequest().body("Missing userId or email");
        }

        try {
            Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());
            UserEntity user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Nếu userId khác thì cập nhật luôn userId (trường hợp đổi provider)
                if (!request.getUserId().equals(user.getUserId())) {
                    user.setUserId(request.getUserId());
                }
                // Cập nhật role nếu có
                if (request.getRole() != null) {
                    user.setRole(request.getRole());
                }
                System.out.println("📝 Updating existing user by email: " + user.getEmail());
            } else {
                user = new UserEntity();
                user.setUserId(request.getUserId());
                user.setEmail(request.getEmail());
                // Set role nếu có
                if (request.getRole() != null) {
                    user.setRole(request.getRole());
                }
                System.out.println("🆕 Creating new user: " + request.getEmail());
            }

            try {
                UserEntity savedUser = userRepository.save(user);
                System.out.println("✅ User synced successfully: " + savedUser.getEmail() + " (ID: " + savedUser.getId() + ")");
                return ResponseEntity.ok(new UserResponse(
                        savedUser.getUserId(),
                        savedUser.getEmail()
                ));
            } catch (org.springframework.dao.DuplicateKeyException dupEx) {
                // Nếu bị lỗi duplicate key, update user thay vì tạo mới
                System.out.println("⚠️ Duplicate email detected, updating existing user!");
                user = userRepository.findByEmail(request.getEmail()).orElse(user);
                user.setUserId(request.getUserId());
                UserEntity savedUser = userRepository.save(user);
                return ResponseEntity.ok(new UserResponse(
                        savedUser.getUserId(),
                        savedUser.getEmail()
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
            List<UserEntity> allUsers = userRepository.findAll();

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