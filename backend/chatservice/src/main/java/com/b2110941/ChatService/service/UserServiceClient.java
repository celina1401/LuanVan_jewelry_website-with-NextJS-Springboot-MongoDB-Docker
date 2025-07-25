package com.b2110941.ChatService.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public String getUserRole(String userId) {
        // ✅ Nếu là admin, trả role luôn (tránh gọi API)
        if ("admin".equalsIgnoreCase(userId)) {
            return "admin";
        }

        try {
            String url = "http://userservice:9001/api/users/users/" + userId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> userData = response.getBody();

            if (userData != null && userData.get("role") != null) {
                return (String) userData.get("role");
            } else {
                System.err.println("⚠️ Không tìm thấy role cho userId: " + userId);
                return "user";
            }
        } catch (HttpClientErrorException.NotFound e) {
            System.err.println("❌ User not found: " + userId);
            return "user"; // fallback
        } catch (Exception e) {
            System.err.println("❌ Lỗi gọi UserService: " + e.getMessage());
            return "user"; // fallback
        }
    }
}
