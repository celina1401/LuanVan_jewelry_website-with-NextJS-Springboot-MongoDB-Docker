package com.b2110941.UserService.controller;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.payload.request.UserSyncRequest;
import com.b2110941.UserService.payload.response.UserResponse;
import com.b2110941.UserService.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ✅ POST /api/users/sync-role
    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody UserSyncRequest request) {
        System.out.println("🔄 Received sync request: " + request.getUserId() + " - " + request.getEmail());

        if (request.getUserId() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Missing userId or email");
        }

        try {
            Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());
            UserEntity user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
                System.out.println("📝 Updating existing user: " + user.getEmail());
            } else {
                user = new UserEntity();
                user.setEmail(request.getEmail());
                System.out.println("🆕 Creating new user: " + request.getEmail());
            }

            // Set/update fields
            user.setUserId(request.getUserId());
            user.setUsername(request.getUsername());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setImageUrl(request.getImageUrl());
            user.setProvider(request.getProvider());
            user.setRole(request.getRole() != null ? request.getRole() : "user");

            // Save to MongoDB
            UserEntity saved = userRepository.save(user);
            return ResponseEntity.ok(new UserResponse(saved.getUserId(), saved.getEmail()));

        } catch (DuplicateKeyException dupEx) {
            System.out.println("⚠️ Duplicate key, attempting update: " + request.getEmail());
            try {
                UserEntity existing = userRepository.findByEmail(request.getEmail()).orElse(new UserEntity());
                existing.setUserId(request.getUserId());
                UserEntity saved = userRepository.save(existing);
                return ResponseEntity.ok(new UserResponse(saved.getUserId(), saved.getEmail()));
            } catch (Exception ex) {
                ex.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Duplicate save failed: " + ex.getMessage());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // ✅ GET /api/users/test
    @GetMapping("/test")
    public ResponseEntity<?> testMongoDB() {
        try {
            long count = userRepository.count();
            List<UserEntity> users = userRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "MongoDB connection successful");
            response.put("totalUsers", count);
            response.put("users", users.stream().map(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("userId", user.getUserId());
                map.put("email", user.getEmail());
                map.put("username", user.getUsername());
                map.put("firstName", user.getFirstName());
                map.put("lastName", user.getLastName());
                map.put("imageUrl", user.getImageUrl());
                map.put("provider", user.getProvider());
                map.put("role", user.getRole());
                return map;
            }).collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("MongoDB test failed");
        }
    }
}
