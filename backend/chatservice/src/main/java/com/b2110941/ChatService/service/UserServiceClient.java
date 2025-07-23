package com.b2110941.ChatService.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public String getUserRole(String userId) {
        try {
            String url = "http://userservice:9001/api/users/users/" + userId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> userData = response.getBody();
            return (String) userData.get("role");
        } catch (Exception e) {
            e.printStackTrace();
            return "user"; // fallback
        }
    }
}
