package com.b2110941.OrderService.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationClientService {

    private final RestTemplate restTemplate;

    @Value("${notification.service.urls:http://notificationservice:9002,http://apigateway:9006,http://host.docker.internal:9002,http://host.docker.internal:9006,http://localhost:9002,http://localhost:9006}")
    private String notificationServiceUrls;

    private String[] getBaseUrls() {
        return notificationServiceUrls.split(",");
    }

    private void postForm(String path, MultiValueMap<String, String> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        RuntimeException lastEx = null;
        for (String base : getBaseUrls()) {
            String url = base.trim() + path;
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    return;
                } else {
                    lastEx = new RuntimeException("Non-2xx response: " + response.getStatusCode());
                }
            } catch (Exception e) {
                lastEx = new RuntimeException(e);
                log.warn("Notification post failed to {}: {}", url, e.getMessage());
            }
        }
        if (lastEx != null) throw lastEx;
    }

    public void sendOrderStatusNotification(
            String userId,
            String orderId,
            String orderNumber,
            String customerName,
            String customerEmail,
            String customerPhone,
            String oldStatus,
            String newStatus
    ) {
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("userId", userId);
            body.add("orderId", orderId);
            body.add("orderNumber", orderNumber);
            body.add("customerName", customerName);
            body.add("customerEmail", customerEmail);
            body.add("customerPhone", customerPhone);
            body.add("oldStatus", oldStatus);
            body.add("newStatus", newStatus);
            postForm("/api/notifications/order-status", body);
            log.info("Order status notification sent for order {}", orderNumber);
        } catch (Exception e) {
            log.error("Error sending order status notification: {}", e.getMessage(), e);
        }
    }

    public void sendShippingStatusNotification(
            String userId,
            String orderId,
            String orderNumber,
            String customerName,
            String customerEmail,
            String customerPhone,
            String oldStatus,
            String newStatus
    ) {
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("userId", userId);
            body.add("orderId", orderId);
            body.add("orderNumber", orderNumber);
            body.add("customerName", customerName);
            body.add("customerEmail", customerEmail);
            body.add("customerPhone", customerPhone);
            body.add("oldStatus", oldStatus);
            body.add("newStatus", newStatus);
            postForm("/api/notifications/shipping-status", body);
            log.info("Shipping status notification sent for order {}", orderNumber);
        } catch (Exception e) {
            log.error("Error sending shipping status notification: {}", e.getMessage(), e);
        }
    }
}
