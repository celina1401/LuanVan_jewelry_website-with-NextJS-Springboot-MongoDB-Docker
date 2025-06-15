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
    public ResponseEntity<?> syncUserRole(@RequestBody Map<String, Object> payload, HttpSession session) {
        System.out.println("Received payload: " + payload);
        try {
            String userId = (String) payload.get("userId");
            String role = (String) payload.get("role");
            String email = (String) payload.get("email");
            String username = (String) payload.get("username");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String imageUrl = (String) payload.get("imageUrl");
            String provider = (String) payload.get("provider");

            System.out.println("Extracted from payload: userId=" + userId + ", email=" + email + ", role=" + role);

            if (userId == null || email == null) {
                System.err.println("Validation error: User ID or email is missing.");
                return ResponseEntity.badRequest().body("User ID and email are required");
            }

            Optional<User> userData = userRepository.findById(userId);
            User user;

            if (userData.isPresent()) {
                user = userData.get();
                System.out.println("User exists, updating: " + user.getId());
                user.setEmail(email);
                if (username != null) user.setUsername(username);
                if (firstName != null) user.setFirstName(firstName);
                if (lastName != null) user.setLastName(lastName);
                if (imageUrl != null) user.setImageUrl(imageUrl);
                if (provider != null) user.setProvider(provider);
            } else {
                user = new User();
                user.setId(userId);
                user.setEmail(email);
                user.setUsername(username != null ? username : email);
                user.setFirstName(firstName != null ? firstName : "");
                user.setLastName(lastName != null ? lastName : "");
                user.setImageUrl(imageUrl != null ? imageUrl : "");
                user.setProvider(provider != null ? provider : "clerk");
                System.out.println("New user, creating: " + user.getId());
            }

            Set<String> roles = new HashSet<>();
            // Always set role to "user" for new registrations/updates
            roles.add("user"); 
            user.setRoles(roles);
            System.out.println("User roles set to: " + user.getRoles());

            userRepository.save(user);
            System.out.println("User saved successfully: " + user.getId());
            return ResponseEntity.ok("User data synced successfully");
        } catch (Exception e) {
            System.err.println("Error syncing user data: " + e.getMessage());
            e.printStackTrace(); // In toàn bộ stack trace để gỡ lỗi chi tiết
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to sync user data: " + e.getMessage());
        }
    }
}