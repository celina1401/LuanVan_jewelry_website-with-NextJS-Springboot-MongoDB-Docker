package com.b2110941.UserService.payload.response;

public class UserResponse {
    private String userId;
    private String email;

    public UserResponse(String userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
} 