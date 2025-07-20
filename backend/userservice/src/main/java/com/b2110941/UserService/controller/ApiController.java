package com.b2110941.UserService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class ApiController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> allAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Public Content.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    // @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Map<String, String>> userAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "User Content.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    // @PreAuthorize("hasRole('ADMIN')")  // phải là 'ADMIN', match GrantedAuthority 'ROLE_ADMIN'
    public ResponseEntity<Map<String, String>> adminAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin Board.");
        return ResponseEntity.ok(response);
    }
}
