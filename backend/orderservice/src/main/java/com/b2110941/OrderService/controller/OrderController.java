package com.b2110941.OrderService.controller;

import com.b2110941.OrderService.payload.request.CreateOrderRequest;
import com.b2110941.OrderService.payload.response.OrderResponse;
import com.b2110941.OrderService.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
// @CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        log.debug("Received order request: {}", request);
        try {
            log.info("Creating order for user: {}", request.getUserId());
            OrderResponse order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            log.error("Error creating order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

//     @PutMapping("/{orderId}")
// public ResponseEntity<OrderResponse> updateOrder(
//         @PathVariable String orderNumber,
//         @RequestBody Map<String, Object> updates) {
//     try {
//         OrderResponse updatedOrder = orderService.updateShippingStatus(orderNumber, updates);
//         return ResponseEntity.ok(updatedOrder);
//     } catch (RuntimeException e) {
//         log.error("Order not found: {}", orderId);
//         return ResponseEntity.notFound().build();
//     } catch (Exception e) {
//         log.error("Error updating order: ", e);
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//     }
// }



    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        try {
            OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderNumber);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable String userId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting orders for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        try {
            List<OrderResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting all orders: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String orderStatus) {
        try {
            OrderResponse order = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating order status: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @PutMapping("/{orderId}/shipping")
    // public ResponseEntity<OrderResponse> updateShippingStatus(
    //         @PathVariable String orderId,
    //         @RequestParam String shippingStatus) {
    //     try {
    //         OrderResponse order = orderService.updateShippingStatus(orderId, shippingStatus);
    //         return ResponseEntity.ok(order);
    //     } catch (RuntimeException e) {
    //         log.error("Order not found: {}", orderId);
    //         return ResponseEntity.notFound().build();
    //     } catch (Exception e) {
    //         log.error("Error updating shipping status: ", e);
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //     }
    // }

    @PutMapping("/{orderNumber}/shipping")
public ResponseEntity<OrderResponse> updateShippingStatus(
        @PathVariable String orderNumber,
        @RequestParam String shippingStatus) {
    try {
        OrderResponse order = orderService.updateShippingStatus(orderNumber, shippingStatus);
        return ResponseEntity.ok(order);
    } catch (RuntimeException e) {
        log.error("Order not found: {}", orderNumber);
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        log.error("Error updating shipping status: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}


    @PutMapping("/{orderId}/payment")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable String orderId,
            @RequestParam String paymentStatus,
            @RequestParam(required = false) String transactionId) {
        try {
            OrderResponse order = orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating payment status: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
// @PutMapping("/payment/callback")
// public ResponseEntity<OrderResponse> updatePaymentStatusCallback(
//         @RequestParam String orderNumber,
//         @RequestParam String paymentStatus,
//         @RequestParam(required = false) String transactionId) {
//     log.info("🔔 Nhận callback payment: orderNumber={}, paymentStatus={}, transactionId={}", 
//              orderNumber, paymentStatus, transactionId);
//     try {
//         OrderResponse order = orderService.updatePaymentStatus(orderNumber, paymentStatus, transactionId);
//         log.info("✅ Cập nhật trạng thái thanh toán thành công cho order: {}", orderNumber);
//         return ResponseEntity.ok(order);
//     } catch (Exception e) {
//         log.error("❌ Lỗi cập nhật trạng thái thanh toán callback:", e);
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//     }
// }

@PutMapping("/payment/callback")
public ResponseEntity<OrderResponse> updatePaymentStatusCallback(
    @RequestParam String orderNumber,
    @RequestParam String paymentStatus,
    @RequestParam(required = false) String transactionId) {
    log.info("🔔 Nhận callback payment: orderNumber={}, paymentStatus={}, transactionId={}", 
             orderNumber, paymentStatus, transactionId);
    try {
        OrderResponse order = orderService.updatePaymentStatus(orderNumber, paymentStatus, transactionId);
        log.info("✅ Cập nhật trạng thái thanh toán thành công cho order: {}", orderNumber);
        return ResponseEntity.ok(order);
    } catch (Exception e) {
        log.error("❌ Lỗi cập nhật trạng thái thanh toán callback:", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}


    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
        try {
            orderService.deleteOrder(orderId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // // Health check endpoint
    // @GetMapping("/health")
    // public ResponseEntity<String> health() {
    //     return ResponseEntity.ok("Order Service is running");
    // }

    
} 