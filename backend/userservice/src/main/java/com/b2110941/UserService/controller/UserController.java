package com.b2110941.UserService.controller;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.payload.request.UserSyncRequest;
import com.b2110941.UserService.payload.response.UserResponse;
import com.b2110941.UserService.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.b2110941.UserService.entity.Address;
import java.util.List;
import org.springframework.http.MediaType;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

// --- Hỗ trợ tạo multipart body cho HttpClient ---
class MultipartBodyPublisher {
    private static final String LINE_FEED = "\r\n";
    private final String boundary;
    private final List<byte[]> parts = new ArrayList<>();

    public MultipartBodyPublisher(String boundary) {
        this.boundary = boundary;
    }

    public MultipartBodyPublisher addFilePart(String name, String filename, String contentType, byte[] fileContent) {
        StringBuilder partHeader = new StringBuilder();
        partHeader.append("--").append(boundary).append(LINE_FEED);
        partHeader.append("Content-Disposition: form-data; name=\"").append(name).append("\"; filename=\"")
                .append(filename).append("\"").append(LINE_FEED);
        partHeader.append("Content-Type: ").append(contentType).append(LINE_FEED).append(LINE_FEED);

        parts.add(partHeader.toString().getBytes(StandardCharsets.UTF_8));
        parts.add(fileContent); // ảnh nhị phân
        parts.add(LINE_FEED.getBytes(StandardCharsets.UTF_8));
        return this;
    }

    public HttpRequest.BodyPublisher build() {
        StringBuilder closing = new StringBuilder();
        closing.append("--").append(boundary).append("--").append(LINE_FEED);
        parts.add(closing.toString().getBytes(StandardCharsets.UTF_8));

        return HttpRequest.BodyPublishers.ofByteArrays(parts);
    }

    public String getBoundary() {
        return boundary;
    }
}

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
            // Trả về cả avatarUrl (custom) và imageUrl (Clerk)
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUserId());
            result.put("email", user.getEmail());
            result.put("username", user.getUsername());
            result.put("firstName", user.getFirstName());
            result.put("lastName", user.getLastName());
            result.put("phone", user.getPhone());
            result.put("addresses", user.getAddresses());
            result.put("role", user.getRole());
            result.put("provider", user.getProvider());
            result.put("active", user.getActive()); // Trạng thái khóa/mở khóa
            result.put("avatarUrl", user.getAvatarUrl()); // custom
            result.put("imageUrl", user.getImageUrl()); // từ Clerk
            result.put("createdAt", user.getCreatedAt());
            result.put("updatedAt", user.getUpdatedAt());
            return ResponseEntity.ok(result);
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
                List<Address> addresses = mapper.convertValue(payload.get("addresses"),
                        new TypeReference<List<Address>>() {
                        });

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
            String filename = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
            Path uploadPath = Paths.get("uploads/avatars");
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            UserEntity user = userOpt.get();
            String avatarUrl = "/uploads/avatars/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            // --- Upload file lên Clerk để cập nhật profile image ---
            try {
                String clerkSecretKey = System.getenv("CLERK_SECRET_KEY");
                if (clerkSecretKey != null && !clerkSecretKey.isEmpty()) {
                    String clerkApiUrl = "https://api.clerk.dev/v1/users/" + userId + "/profile_image";
                    byte[] fileBytes = Files.readAllBytes(filePath);
                    String boundary = "----ClerkBoundary" + System.currentTimeMillis();

                    // 👉 Get MIME type của ảnh từ filePath
                    String contentType = Files.probeContentType(filePath);
                    if (contentType == null) {
                        contentType = file.getContentType();
                    }
                    if (contentType == null) {
                        contentType = "image/png";
                    }
                    List<String> allowedTypes = List.of("image/png", "image/x-png", "image/jpeg", "image/jpg", "image/webp");
                    if (!allowedTypes.contains(contentType)) {
                        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                                .body("Chỉ hỗ trợ ảnh PNG, JPEG, JPG, hoặc WebP");
                    }

                    MultipartBodyPublisher multipart = new MultipartBodyPublisher(boundary);
                    multipart.addFilePart("file", filename, contentType, fileBytes);

                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(clerkApiUrl))
                            .header("Authorization", "Bearer " + clerkSecretKey)
                            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                            .POST(multipart.build())
                            .build();

                    HttpClient.newHttpClient().sendAsync(request, HttpResponse.BodyHandlers.ofString())
                            .thenAccept(response -> {
                                System.out.println("[Clerk] Avatar upload response: " + response.statusCode());
                                System.out.println(response.body());
                            });
                }

            } catch (Exception ex) {
                ex.printStackTrace();
            }
            // --- END upload Clerk ---

            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<?> getAvatar(@PathVariable String userId) {
        Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        UserEntity user = userOpt.get();
        String avatarUrl = user.getAvatarUrl();
        if (avatarUrl == null || avatarUrl.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No avatar");
        }

        Path filePath = Paths.get(avatarUrl.startsWith("/") ? avatarUrl.substring(1) : avatarUrl); // bỏ / đầu
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }

        try {
            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            // Nếu không xác định được, kiểm tra phần mở rộng file
            if (contentType == null) {
                String lower = filePath.getFileName().toString().toLowerCase();
                if (lower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (lower.endsWith(".webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error reading file: " + e.getMessage());
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
                    "role", user.getRole())).collect(Collectors.toList()));

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
            
            // Thêm các trường bổ sung từ custom registration
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            if (request.getDateOfBirth() != null) {
                user.setDateOfBirth(request.getDateOfBirth());
            }
            if (request.getGender() != null) {
                user.setGender(request.getGender());
            }

            // Set default values for new users
            if (user.getPurchaseCount() == null) {
                user.setPurchaseCount(0);
            }
            if (user.getActive() == null) {
                user.setActive(true);
            }
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(java.time.LocalDateTime.now());
            }
            user.setUpdatedAt(java.time.LocalDateTime.now());

            UserEntity saved = userRepository.save(user);
            return ResponseEntity.ok(new UserResponse(saved.getUserId(), saved.getEmail()));

        } catch (DuplicateKeyException dupEx) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Duplicate email");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error syncing user role: " + e.getMessage());
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể lấy danh sách người dùng: " + e.getMessage());
        }
    }

    // ✅ Thêm người dùng mới
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email là bắt buộc");
            }
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã tồn tại");
            }
            
            UserEntity user = new UserEntity();
            user.setUserId(java.util.UUID.randomUUID().toString());
            user.setFirstName((String) payload.getOrDefault("firstName", ""));
            user.setLastName((String) payload.getOrDefault("lastName", ""));
            user.setEmail(email);
            user.setRole((String) payload.getOrDefault("role", "user"));
            user.setPhone((String) payload.getOrDefault("phone", ""));
            user.setDateOfBirth((String) payload.getOrDefault("dateOfBirth", ""));
            user.setGender((String) payload.getOrDefault("gender", ""));
            
            // Handle addresses
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
            
            user.setPurchaseCount(0);
            user.setActive(true);
            user.setCreatedAt(java.time.LocalDateTime.now());
            user.setUpdatedAt(java.time.LocalDateTime.now());
            
            UserEntity saved = userRepository.save(user);
            System.out.println("[UserController] Đã thêm user vào MongoDB: " + saved.getUserId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể thêm người dùng: " + e.getMessage());
        }
    }

    // ✅ Khóa/Mở khóa tài khoản người dùng
    @PutMapping("/{userId}/toggle-lock")
    public ResponseEntity<?> toggleUserLock(@PathVariable String userId, @RequestBody Map<String, Object> payload) {
        try {
            Optional<UserEntity> userOpt = userRepository.findByUserId(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            UserEntity user = userOpt.get();
            Boolean active = (Boolean) payload.get("active");
            
            if (active == null) {
                return ResponseEntity.badRequest().body("Active status is required");
            }

            user.setActive(active);
            user.setUpdatedAt(java.time.LocalDateTime.now());
            
            UserEntity saved = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", saved.getUserId());
            response.put("active", saved.getActive());
            response.put("message", active ? "User unlocked successfully" : "User locked successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error toggling user lock: " + e.getMessage());
        }
    }

}
