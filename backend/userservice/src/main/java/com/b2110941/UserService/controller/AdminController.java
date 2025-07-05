package com.b2110941.UserService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.repository.UserRepository;  
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // @GetMapping("/verify")
    // public ResponseEntity<AdminVerificationResponse> verifyAdminAccess() {
    //     return ResponseEntity.ok(new AdminVerificationResponse(true));
    // }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdminUser(@RequestBody UserEntity user) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Set role ADMIN cho user
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_ADMIN");
        user.setRoles(roles);

        // Set thời gian tạo và cập nhật
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Lưu user vào database
        UserEntity savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    // DTO cho response JSON
    // Chứa thông tin về việc người dùng có phải là admin hay không
    public static class AdminVerificationResponse {
        private final boolean isAdmin;

        // Constructor để tạo đối tượng phản hồi
        public AdminVerificationResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }

        // Getter để lấy thông tin về vai trò admin
        public boolean isAdmin() {
            return isAdmin;
        }
    }
}
