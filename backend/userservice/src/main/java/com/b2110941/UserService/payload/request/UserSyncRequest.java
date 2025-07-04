package com.b2110941.UserService.payload.request;

public class UserSyncRequest {
    private String userId;
    private String email;
    private String role;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
} 