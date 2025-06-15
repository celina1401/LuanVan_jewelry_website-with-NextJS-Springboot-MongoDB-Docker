package com.example.fullstackapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.annotation.Nullable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Size(max = 50)
    @Nullable
    private String username;

    @Size(max = 50)
    @Email
    @Indexed(unique = true)
    @Nullable
    private String email;

    @Size(max = 120)
    @Nullable
    private String password;

    @Size(min = 1)
    private Set<String> roles = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Nullable
    private String provider = "clerk";

    @Nullable
    private String firstName = "";

    @Nullable
    private String lastName = "";

    @Nullable
    private String imageUrl = "";

    // Phương thức đảm bảo vai trò hợp lệ
    public void setRoles(Set<String> roles) {
        Set<String> validRoles = new HashSet<>(Set.of("user", "admin"));
        this.roles = roles.stream()
                .filter(validRoles::contains)
                .collect(Collectors.toSet());
        if (this.roles.isEmpty()) this.roles.add("user");
    }
}