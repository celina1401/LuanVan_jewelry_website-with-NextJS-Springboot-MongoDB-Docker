package com.b2110941.UserService.controller;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.payload.request.UserSyncRequest;
import com.b2110941.UserService.payload.response.UserResponse;
import com.b2110941.UserService.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Environment env;

    // 🔄 Đồng bộ user từ frontend (nếu chưa có thì thêm vào DB)
    // @PostMapping("/users/sync_user")
    // public ResponseEntity<?> syncUser(@AuthenticationPrincipal Jwt principal, @RequestBody(required = false) Map<String, String> payload) {
    //     String userId = null, username = null, email = null;
    //     if (principal != null) {
    //         userId = principal.getSubject();
    //         username = principal.getClaimAsString("username");
    //         email = principal.getClaimAsString("email");
    //     }
    //     if ((userId == null || username == null || email == null) && payload != null) {
    //         if (userId == null) userId = payload.get("userId");
    //         if (username == null) username = payload.get("username");
    //         if (email == null) email = payload.get("email");
    //     }
    //     if (userId == null || username == null || email == null) {
    //         return ResponseEntity.badRequest().body("Thiếu thông tin người dùng");
    //     }
    //     if (!userRepository.existsByUserId(userId)) {
    //         UserEntity user = new UserEntity();
    //         user.setUserId(userId);
    //         user.setUsername(username);
    //         user.setEmail(email);
    //         userRepository.save(user);
    //     }
    //     return ResponseEntity.ok("User đã đồng bộ");
    // }

    // ✅ Lấy thông tin người dùng theo userId
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            System.out.println("User found: " + userOpt.get());
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    // ✅ Cập nhật thông tin người dùng
    @PostMapping("/update_user/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        try {
            Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            UserEntity user = userOpt.get();
            if (payload.containsKey("username")) user.setUsername(payload.get("username"));
            if (payload.containsKey("phone")) user.setPhone(payload.get("phone"));
            if (payload.containsKey("address")) user.setAddress(payload.get("address"));

            userRepository.save(user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Cập nhật thất bại: " + e.getMessage());
        }
    }

    // ✅ Xóa người dùng cả từ Clerk và MongoDB
    @DeleteMapping("/del_user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            // Gửi request xoá từ Clerk
            String clerkApiKey = env.getProperty("clerk.api.key");
            String clerkUrl = "https://api.clerk.com/v1/users/" + userId;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clerkApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> clerkResponse = restTemplate.exchange(clerkUrl, HttpMethod.DELETE, entity, String.class);

            if (!clerkResponse.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body("Failed to delete user on Clerk: " + clerkResponse.getBody());
            }

            // Xoá trong MongoDB
            return userRepository.findByUserId(userId).map(user -> {
                userRepository.delete(user);
                return ResponseEntity.ok("User deleted from Clerk and MongoDB");
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found in MongoDB"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    // ✅ Kiểm tra kết nối MongoDB và list user
    @GetMapping("/test")
    public ResponseEntity<?> testMongoDB() {
        try {
            long count = userRepository.count();
            List<UserEntity> users = userRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "MongoDB connection successful");
            response.put("totalUsers", count);
            response.put("users", users.stream().map(user -> Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "imageUrl", user.getImageUrl(),
                    "provider", user.getProvider(),
                    "role", user.getRole()
            )).collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("MongoDB test failed");
        }
    }

    // ✅ Đồng bộ thông tin từ Clerk (role, image, tên...)
    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody UserSyncRequest request) {
        if (request.getUserId() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Missing userId or email");
        }

        try {
            Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());
            UserEntity user = userOpt.orElseGet(UserEntity::new);

            user.setUserId(request.getUserId());
            user.setEmail(request.getEmail());
            user.setUsername(request.getUsername());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setImageUrl(request.getImageUrl());
            user.setProvider(request.getProvider());
            user.setRole(request.getRole() != null ? request.getRole() : "user");

            UserEntity saved = userRepository.save(user);
            return ResponseEntity.ok(new UserResponse(saved.getUserId(), saved.getEmail()));

        } catch (DuplicateKeyException dupEx) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Duplicate email");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error syncing user role: " + e.getMessage());
        }
    }
}
