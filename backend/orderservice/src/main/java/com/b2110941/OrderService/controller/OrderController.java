package com.b2110941.OrderService.controller;

import com.b2110941.OrderService.payload.request.CreateOrderRequest;
import com.b2110941.OrderService.payload.response.OrderResponse;
import com.b2110941.OrderService.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        try {
            String reason = body.get("reason");
            OrderResponse order = orderService.cancelOrder(orderId, reason);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error cancelling order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{orderId}/invoice")
    public ResponseEntity<Map<String, String>> generateInvoice(@PathVariable String orderId) {
        try {
            log.info("Generating invoice for order: {}", orderId);
            String invoiceUrl = orderService.generateInvoice(orderId);
            return ResponseEntity.ok(Map.of("invoiceUrl", invoiceUrl));
        } catch (RuntimeException e) {
            log.error("Order not found: {}", orderId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error generating invoice: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{orderNumber}/invoice.pdf")
    public ResponseEntity<InputStreamResource> downloadInvoicePdf(@PathVariable String orderNumber) {
        try {
            // Đường dẫn tới file PDF mẫu trong resources
            ClassPathResource pdfFile = new ClassPathResource("sample-invoice.pdf");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + orderNumber + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(pdfFile.getInputStream()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


}