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
        if (request.getUserId() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body("Missing userId or email");
        }

        User user = Optional.ofNullable(userRepository.findByUserId(request.getUserId()))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUserId(request.getUserId());
                    return newUser;
                });

        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setImageUrl(request.getImageUrl());
        user.setProvider(request.getProvider() != null ? request.getProvider() : "clerk");
        user.setRole(request.getRole() != null ? request.getRole() : "user");

        userRepository.save(user);

        System.out.println("✅ User synced: " + user.getEmail());

        return ResponseEntity.ok(new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getImageUrl(),
                user.getRole()
        ));
    }
}
