package com.example.fullstackapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fullstackapp.model.User;
import com.example.fullstackapp.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;
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

            System.out.println("User details: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("error", "Failed to retrieve user details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/sync-role")
    public ResponseEntity<?> syncUserRole(@RequestBody Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            String role = (String) payload.get("role");
            String email = (String) payload.get("email");
            String username = (String) payload.get("username");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String imageUrl = (String) payload.get("imageUrl");
            String provider = (String) payload.get("provider");

            if (userId == null || email == null) {
                return ResponseEntity.badRequest().body("User ID and email are required");
            }

            Optional<User> existingUser = userRepository.findById(userId);
            User user;

            if (existingUser.isPresent()) {
                // Update existing user
                user = existingUser.get();
                user.setEmail(email);
                user.setUsername(username);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setImageUrl(imageUrl);
                user.setProvider(provider);
                user.setUpdatedAt(LocalDateTime.now());
                
                // Update role if provided
                if (role != null) {
                    Set<String> roles = new HashSet<>();
                    roles.add("ROLE_" + role.toUpperCase());
                    user.setRoles(roles);
                }
            } else {
                // Create new user
                user = User.builder()
                    .id(userId)
                    .email(email)
                    .username(username)
                    .firstName(firstName)
                    .lastName(lastName)
                    .imageUrl(imageUrl)
                    .provider(provider)
                    .roles(new HashSet<>(Collections.singletonList("ROLE_" + (role != null ? role.toUpperCase() : "USER"))))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error syncing user data: " + e.getMessage());
        }
    }

    
    
}