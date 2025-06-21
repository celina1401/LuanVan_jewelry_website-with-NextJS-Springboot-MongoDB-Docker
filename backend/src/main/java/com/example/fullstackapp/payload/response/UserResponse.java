package com.example.fullstackapp.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String imageUrl;
    private String role;
}
