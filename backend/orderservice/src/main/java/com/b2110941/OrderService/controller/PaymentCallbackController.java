// package com.b2110941.OrderService.controller;

// import com.b2110941.OrderService.service.OrderService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/orders")
// @RequiredArgsConstructor
// public class PaymentCallbackController {

//     private final OrderService orderService;

//     @PostMapping("/payment/callback")
//     public ResponseEntity<Void> handlePaymentCallback(
//             @RequestParam String orderNumber,
//             @RequestParam String transactionId,
//             @RequestParam String status) {
//         orderService.updatePaymentStatus(orderNumber, status, transactionId);
//         return ResponseEntity.ok().build();
//     }
    

// }
