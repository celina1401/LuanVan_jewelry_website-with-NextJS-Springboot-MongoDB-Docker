package com.example.fullstackapp.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public Map<String, String> getUserInfo(Principal principal) {
        Map<String, String> userInfo = new HashMap<>();
        if (principal != null) {
            userInfo.put("name", principal.getName());
            // Depending on the Principal implementation provided by Spring Security/Clerk, 
            // you might be able to get more details. 
            // For JWT authentication, principal.getName() usually returns the subject (sub) of the token, 
            // which is typically the user ID from Clerk.
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() != null) {
                 userInfo.put("details", authentication.getPrincipal().toString());
                 // If the principal is a Jwt, you can access claims like this:
                 // if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt) {
                 //     org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) authentication.getPrincipal();
                 //     userInfo.put("clerkUserId", jwt.getSubject());
                 //     userInfo.put("email", jwt.getClaimAsString("email")); // Example: get email claim
                 // }
            }

        } else {
            userInfo.put("message", "User not authenticated");
        }
        return userInfo;
    }
} 