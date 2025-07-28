// package com.b2110941.OrderService.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;


// @RestController
// @RequestMapping("/api/orders")
// public class PaymentService {
//     @Autowired
//     OrderService orderService;

//     @PostMapping("/payment/callback")
// public ResponseEntity<Void> handlePaymentCallback(@RequestParam String orderId,
//                                                   @RequestParam String transactionId,
//                                                   @RequestParam String status) {
//     orderService.updatePaymentStatus(orderId, status, transactionId);
//     return ResponseEntity.ok().build();
// }

// @GetMapping("/vnpay")
// public ResponseEntity<?> createPaymentUrl(@RequestParam long amount, @RequestParam String orderId){
//     return ResponseEntity.ok().build();
// }



// }
package com.b2110941.OrderService.controller;

import com.b2110941.OrderService.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PaymentCallbackController {

    private final OrderService orderService;

    @PostMapping("/payment/callback")
    public ResponseEntity<Void> handlePaymentCallback(@RequestParam String orderId,
                                                      @RequestParam String transactionId,
                                                      @RequestParam String status) {
        orderService.updatePaymentStatus(orderId, status, transactionId);
        return ResponseEntity.ok().build();
    }

}
