package com.b2110941.UserService.controller;

import com.b2110941.UserService.entity.ClerkProperties;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.nio.file.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.b2110941.UserService.entity.Address;
import java.util.List;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Lấy thông tin người dùng theo userId
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            // Đảm bảo trả về phone và address đúng (null nếu chưa có)
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    // ✅ Cập nhật thông tin người dùng
    @PostMapping("/update_user/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable String userId, @RequestBody Map<String, Object> payload) {
        try {
            Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
    
            UserEntity user = userOpt.get();
    
            if (payload.containsKey("username")) {
                user.setUsername((String) payload.get("username"));
            }
    
            if (payload.containsKey("phone")) {
                user.setPhone((String) payload.get("phone"));
            }
    
            if (payload.containsKey("addresses")) {
                ObjectMapper mapper = new ObjectMapper();
                List<Address> addresses = mapper.convertValue(payload.get("addresses"), new TypeReference<List<Address>>() {});
                
                // ✅ Logic đảm bảo chỉ có 1 địa chỉ mặc định
                boolean hasDefault = addresses.stream().anyMatch(Address::isDefault);
                if (hasDefault) {
                    for (Address addr : addresses) {
                        addr.setDefault(addr.isDefault()); // giữ nguyên
                    }
                } else if (!addresses.isEmpty()) {
                    // nếu không có mặc định, đặt địa chỉ đầu tiên là mặc định
                    addresses.get(0).setDefault(true);
                }
    
                user.setAddresses(addresses);
            }
    
            user.setUpdatedAt(LocalDateTime.now());
    
            UserEntity savedUser = userRepository.save(user);
            System.out.println("[UserController] ✅ Đã cập nhật user: " + savedUser.getUserId());
    
            return ResponseEntity.ok(savedUser);
    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Cập nhật thất bại: " + e.getMessage());
        }
    }
    

    @DeleteMapping("/del_user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return ResponseEntity.ok("User deleted from MongoDB.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found in MongoDB.");
        }
    }

    @PutMapping("/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable String userId, @RequestParam("file") MultipartFile file) {
        try {
            Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            UserEntity user = userOpt.get();
            user.setAvatarImage(file.getBytes());
            userRepository.save(user);
            return ResponseEntity.ok().body("Avatar uploaded to DB");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping(value = "/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String userId) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent() && userOpt.get().getAvatarImage() != null) {
            byte[] image = userOpt.get().getAvatarImage();
            // Nhận diện định dạng ảnh (JPEG hoặc PNG)
            String contentType = "image/jpeg";
            if (image.length > 8 && image[0] == (byte)0x89 && image[1] == 0x50 && image[2] == 0x4E && image[3] == 0x47) {
                contentType = "image/png";
            }
            return ResponseEntity.ok().header("Content-Type", contentType).body(image);
        }
        return ResponseEntity.notFound().build();
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", "MongoDB test failed");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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

    // ✅ Lấy toàn bộ danh sách người dùng
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserEntity> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể lấy danh sách người dùng: " + e.getMessage());
        }
    }

    // ✅ Thêm người dùng mới
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email là bắt buộc");
            }
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã tồn tại");
            }
            UserEntity user = new UserEntity();
            user.setUserId(java.util.UUID.randomUUID().toString());
            user.setFirstName(payload.getOrDefault("firstName", ""));
            user.setLastName(payload.getOrDefault("lastName", ""));
            user.setEmail(email);
            user.setRole(payload.getOrDefault("role", "user"));
            user.setPhone(payload.getOrDefault("phone", ""));
            if (payload.containsKey("addresses")) {
                ObjectMapper mapper = new ObjectMapper();
                List<Address> addresses = mapper.convertValue(
                    payload.get("addresses"),
                    new TypeReference<List<Address>>() {}
                );
                user.setAddresses(addresses);
            } else {
                user.setAddresses(new java.util.ArrayList<>());
            }
            user.setCreatedAt(java.time.LocalDateTime.now());
            user.setUpdatedAt(java.time.LocalDateTime.now());
            UserEntity saved = userRepository.save(user);
            System.out.println("[UserController] Đã thêm user vào MongoDB: " + saved.getUserId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể thêm người dùng: " + e.getMessage());
        }
    }
    
}
