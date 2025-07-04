package com.b2110941.UserService.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

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
public class UserEntity {
    @Id
    private String id;

    @Field("userId")
    @Indexed(unique = true)
    private String userId;

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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Nullable
    public @Size(max = 50) String getUsername() {
        return username;
    }

    public void setUsername(@Nullable @Size(max = 50) String username) {
        this.username = username;
    }

    @Nullable
    public @Size(max = 50) @Email String getEmail() {
        return email;
    }

    public void setEmail(@Nullable @Size(max = 50) @Email String email) {
        this.email = email;
    }

    @Nullable
    public @Size(max = 120) String getPassword() {
        return password;
    }

    public void setPassword(@Nullable @Size(max = 120) String password) {
        this.password = password;
    }

    public @Size(min = 1) Set<String> getRoles() {
        return roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Nullable
    public String getProvider() {
        return provider;
    }

    public void setProvider(@Nullable String provider) {
        this.provider = provider;
    }

    @Nullable
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(@Nullable String firstName) {
        this.firstName = firstName;
    }

    @Nullable
    public String getLastName() {
        return lastName;
    }

    public void setLastName(@Nullable String lastName) {
        this.lastName = lastName;
    }

    @Nullable
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(@Nullable String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getRole() { return roles.stream().findFirst().orElse("user"); }
    public void setRole(String role) {
        Set<String> validRoles = new HashSet<>(Set.of("user", "admin"));
        this.roles = validRoles.stream()
                .filter(r -> r.equals(role))
                .collect(Collectors.toSet());
        if (this.roles.isEmpty()) this.roles.add("user");
    }
}