package com.example.fullstackapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstackapp.model.User;
import com.example.fullstackapp.repository.UserRepository;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated()) {
            response.put("authenticated", true);
            response.put("username", authentication.getName());
            
            // Lấy danh sách roles từ authorities
            var roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());
            
            response.put("roles", roles);
            
            // Log để debug
            System.out.println("User roles: " + roles);
            
            return ResponseEntity.ok(response);
        }
        
        response.put("authenticated", false);
        return ResponseEntity.ok(response);
    }

// Trong UserController.java
    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String role = (String) payload.get("role");

        if (userId == null || role == null) {
            return ResponseEntity.badRequest().body("User ID and role are required");
        }

        Optional<User> userData = userRepository.findById(userId);
        User user;
        
        if (userData.isPresent()) {
            user = userData.get();
        } else {
            // Tạo user mới nếu chưa tồn tại
            user = new User();
            user.setId(userId);
        }
        
        // Cập nhật role
        Set<String> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        
        userRepository.save(user);
        return ResponseEntity.ok("User role synced successfully");
    }

} 