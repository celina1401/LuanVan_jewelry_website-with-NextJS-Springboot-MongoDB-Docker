package com.example.fullstackapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ApiController {
    @GetMapping("/role/all")
    public Map<String, String> allAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Public Content.");
        return response;
    }

    @GetMapping("/role/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> userAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "User Content.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role/admin")
    @PreAuthorize("hasRole('admin')")
    public Map<String, String> adminAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin Board.");
        return response;
    }
}