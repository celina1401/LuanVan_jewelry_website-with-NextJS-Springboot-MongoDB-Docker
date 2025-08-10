// package com.b2110941.PaymentService.service;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.stereotype.Service;
// import org.springframework.web.client.RestTemplate;
// import org.springframework.http.ResponseEntity;
// import org.springframework.http.HttpEntity;
// import org.springframework.http.HttpHeaders;

// @Service
// @RequiredArgsConstructor
// @Slf4j
// public class PaymentService {

//     private final RestTemplate restTemplate;

//     public void notifyOrderService(String orderNumber, String transactionId, String paymentStatus) {
//         log.info("👉 Callback gửi tới OrderService với orderNumber={}, transactionId={}, status={}",
//          orderNumber, transactionId, paymentStatus);

//         try {
//             String url = "http://localhost:9003/api/orders/payment/callback"
//                     + "?orderNumber=" + orderNumber
//                     + "&transactionId=" + transactionId
//                     + "&status=" + paymentStatus;

//             HttpHeaders headers = new HttpHeaders();
//             HttpEntity<Void> entity = new HttpEntity<>(headers);

//             ResponseEntity<Void> response = restTemplate.postForEntity(url, entity, Void.class);
//             log.info("✅ Callback về OrderService thành công: {}", response.getStatusCode());
//         } catch (Exception e) {
//             log.error("❌ Lỗi khi callback về OrderService: {}", e.getMessage());
//         }
//     }

// }
package com.b2110941.PaymentService.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RestTemplate restTemplate;

    public void notifyOrderService(String orderNumber, String transactionId, String paymentStatus) {
        log.info("👉 Callback gửi tới OrderService với orderNumber={}, transactionId={}, status={}",
         orderNumber, transactionId, paymentStatus);

        try {
            // ✅ Sửa tên parameter từ 'status' thành 'paymentStatus'
            // ✅ Sửa HTTP method từ POST thành PUT
            String url = "http://orderservice:9003/api/orders/payment/callback"
                    + "?orderNumber=" + orderNumber
                    + "&paymentStatus=" + URLEncoder.encode(paymentStatus, StandardCharsets.UTF_8)
                    + "&transactionId=" + transactionId;

            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // ✅ Đổi từ postForEntity thành exchange với PUT method
            ResponseEntity<Void> response = restTemplate.exchange(
                url, 
                HttpMethod.PUT,  // Đổi từ POST thành PUT
                entity, 
                Void.class
            );
            
            log.info("✅ Callback về OrderService thành công: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("❌ Lỗi khi callback về OrderService: {}", e.getMessage(), e);
            // In thêm stack trace để debug dễ hơn
        }
    }
}