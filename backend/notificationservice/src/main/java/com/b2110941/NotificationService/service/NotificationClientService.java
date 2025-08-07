package com.b2110941.NotificationService.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationClientService {

    private final RestTemplate restTemplate;
    private final String NOTIFICATION_SERVICE_URL = "http://localhost:9006/api/notifications";

    public void sendOrderStatusNotification(String userId, String orderId, String orderNumber,
                                          String customerName, String customerEmail, String customerPhone,
                                          String oldStatus, String newStatus) {
        try {
            String url = NOTIFICATION_SERVICE_URL + "/order-status";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            String requestBody = String.format(
                "userId=%s&orderId=%s&orderNumber=%s&customerName=%s&customerEmail=%s&customerPhone=%s&oldStatus=%s&newStatus=%s",
                userId, orderId, orderNumber, customerName, customerEmail, customerPhone, oldStatus, newStatus
            );
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Order status notification sent successfully for order: {}", orderNumber);
            } else {
                log.error("Failed to send order status notification for order: {}", orderNumber);
            }
        } catch (Exception e) {
            log.error("Error sending order status notification: {}", e.getMessage(), e);
        }
    }

    public void sendShippingStatusNotification(String userId, String orderId, String orderNumber,
                                             String customerName, String customerEmail, String customerPhone,
                                             String oldStatus, String newStatus) {
        try {
            String url = NOTIFICATION_SERVICE_URL + "/shipping-status";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            String requestBody = String.format(
                "userId=%s&orderId=%s&orderNumber=%s&customerName=%s&customerEmail=%s&customerPhone=%s&oldStatus=%s&newStatus=%s",
                userId, orderId, orderNumber, customerName, customerEmail, customerPhone, oldStatus, newStatus
            );
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Shipping status notification sent successfully for order: {}", orderNumber);
            } else {
                log.error("Failed to send shipping status notification for order: {}", orderNumber);
            }
        } catch (Exception e) {
            log.error("Error sending shipping status notification: {}", e.getMessage(), e);
        }
    }
}
