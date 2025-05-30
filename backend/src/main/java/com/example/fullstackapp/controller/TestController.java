package com.example.fullstackapp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class TestController {
    @GetMapping("/role/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/role/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public String userAccess() {
        return "User Content.";
    }

    @GetMapping("/role/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board.";
    }
}