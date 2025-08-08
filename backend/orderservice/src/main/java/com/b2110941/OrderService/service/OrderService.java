package com.b2110941.OrderService.service;

import com.b2110941.OrderService.entity.Order;
import com.b2110941.OrderService.entity.OrderItem;
import com.b2110941.OrderService.payload.request.CreateOrderRequest;
import com.b2110941.OrderService.payload.request.OrderItemRequest;
import com.b2110941.OrderService.payload.response.OrderResponse;
import com.b2110941.OrderService.payload.response.OrderItemResponse;
import com.b2110941.OrderService.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final NotificationClientService notificationClientService;

    @Value("${user.service.url:http://localhost:9001}")
    private String userServiceUrl;

    @Value("${payment.service.url:http://localhost:9004}")
    private String paymentServiceUrl;

    public OrderResponse createOrder(CreateOrderRequest request) {
        try {
            // Generate order number
            String orderNumber = generateOrderNumber();
            
            // Convert request items to entity items
            List<OrderItem> items = request.getItems().stream()
                    .map(this::convertToOrderItem)
                    .collect(Collectors.toList());
            
            // Create order entity
            Order order = new Order();
            order.setOrderNumber(orderNumber);
            order.setUserId(request.getUserId());
            order.setCustomerName(request.getCustomerName());
            order.setCustomerPhone(request.getCustomerPhone());
            order.setCustomerEmail(request.getCustomerEmail());
            
            // Shipping information
            order.setReceiverName(request.getReceiverName());
            order.setStreet(request.getStreet());
            order.setWard(request.getWard());
            order.setDistrict(request.getDistrict());
            order.setProvince(request.getProvince());
            order.setShippingAddress(buildShippingAddress(request));
            
            // Order details
            order.setItems(items);
            order.setSubtotal(request.getSubtotal());
            order.setShippingFee(request.getShippingFee());
            order.setDiscount(request.getDiscount());
            order.setTotal(request.getTotal());
            
            // Payment information
            order.setPaymentMethod(request.getPaymentMethod());
            order.setPaymentStatus("Chưa xử lý");
            
            // Order status
            order.setOrderStatus("Chưa xử lý");
            order.setShippingStatus("Chưa giao hàng");
            order.setCodStatus("Chưa nhận");
            
            // Additional information
            order.setNote(request.getNote());
            order.setChannel("Web");
            order.setSmsNotification(request.getSmsNotification());
            order.setInvoiceRequest(request.getInvoiceRequest());
            order.setPromoCode(request.getPromoCode());
            
            // Timestamps
            LocalDateTime now = LocalDateTime.now();
            order.setCreatedAt(now);
            order.setUpdatedAt(now);
            
            // Save order
            Order savedOrder = orderRepository.save(order);
            
            // If payment method is not COD, create payment
            if (!"cod".equalsIgnoreCase(request.getPaymentMethod())) {
                createPaymentForOrder(savedOrder);
            }
            
            return convertToOrderResponse(savedOrder);
            
        } catch (Exception e) {
            log.error("Error creating order: ", e);
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    public OrderResponse getOrderById(String orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            return convertToOrderResponse(order.get());
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Optional<Order> order = orderRepository.findByOrderNumber(orderNumber);
        if (order.isPresent()) {
            return convertToOrderResponse(order.get());
        }
        throw new RuntimeException("Order not found with order number: " + orderNumber);
    }

    public List<OrderResponse> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(String orderId, String orderStatus) {
        // Optional<Order> orderOpt = orderRepository.findById(orderId);
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderId);

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String previousStatus = order.getOrderStatus();
            order.setOrderStatus(orderStatus);
            order.setUpdatedAt(LocalDateTime.now());
            
            if ("Đã giao".equals(orderStatus)) {
                order.setDeliveredAt(LocalDateTime.now());
            }
            
            Order savedOrder = orderRepository.save(order);

            try {
                notificationClientService.sendOrderStatusNotification(
                        order.getUserId(),
                        order.getId(),
                        order.getOrderNumber(),
                        order.getCustomerName(),
                        order.getCustomerEmail(),
                        order.getCustomerPhone(),
                        previousStatus,
                        orderStatus
                );
            } catch (Exception e) {
                log.warn("Failed to send order status notification: {}", e.getMessage());
            }

            return convertToOrderResponse(savedOrder);
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }


    public OrderResponse updateShippingStatus(String orderNumber, String shippingStatus) {
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber); // ✅ Đổi từ findById → findByOrderNumber
    
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String previousShippingStatus = order.getShippingStatus();
            order.setShippingStatus(shippingStatus);
            order.setUpdatedAt(LocalDateTime.now());
    
            if ("Đã giao".equals(shippingStatus)) {
                order.setShippedAt(LocalDateTime.now());
                order.setDeliveredAt(LocalDateTime.now());
            }
    
            Order savedOrder = orderRepository.save(order);

            try {
                notificationClientService.sendShippingStatusNotification(
                        order.getUserId(),
                        order.getId(),
                        order.getOrderNumber(),
                        order.getCustomerName(),
                        order.getCustomerEmail(),
                        order.getCustomerPhone(),
                        previousShippingStatus,
                        shippingStatus
                );
            } catch (Exception e) {
                log.warn("Failed to send shipping status notification: {}", e.getMessage());
            }

            return convertToOrderResponse(savedOrder);
        }
    
        throw new RuntimeException("Order not found with order number: " + orderNumber);
    }
    

    public OrderResponse updatePaymentStatus(String orderNumber, String paymentStatus, String transactionId) {
        // Optional<Order> orderOpt = orderRepository.findById(orderId);
        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setPaymentStatus(paymentStatus);
            order.setTransactionId(transactionId);
            order.setUpdatedAt(LocalDateTime.now());
            
            if ("Đã thanh toán".equals(paymentStatus)) {
                order.setPaidAt(LocalDateTime.now());
            }
            
            Order savedOrder = orderRepository.save(order);
            return convertToOrderResponse(savedOrder);
        }
        throw new RuntimeException("Order not found with id: " + orderNumber);
    }

    public void deleteOrder(String orderId) {
        if (orderRepository.existsById(orderId)) {
            orderRepository.deleteById(orderId);
        } else {
            throw new RuntimeException("Order not found with id: " + orderId);
        }
    }

    private String generateOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "M" + timestamp;
    }

    private OrderItem convertToOrderItem(OrderItemRequest request) {
        OrderItem item = new OrderItem();
        item.setProductId(request.getProductId());
        item.setProductName(request.getProductName());
        item.setProductImage(request.getProductImage());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setTotalPrice(request.getPrice() * request.getQuantity());
        item.setWeight(request.getWeight());
        item.setGoldAge(request.getGoldAge());
        item.setWage(request.getWage());
        item.setCategory(request.getCategory());
        item.setBrand(request.getBrand());
        return item;
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getProductId(),
                item.getProductName(),
                item.getProductImage(),
                item.getQuantity(),
                item.getPrice(),
                item.getTotalPrice(),
                item.getWeight(),
                item.getGoldAge(),
                item.getWage(),
                item.getCategory(),
                item.getBrand()
        );
    }

    private OrderResponse convertToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getCustomerEmail(),
                order.getReceiverName(),
                order.getStreet(),
                order.getWard(),
                order.getDistrict(),
                order.getProvince(),
                order.getShippingAddress(),
                items,
                order.getSubtotal(),
                order.getShippingFee(),
                order.getDiscount(),
                order.getTotal(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getTransactionId(),
                order.getPaymentUrl(),
                order.getOrderStatus(),
                order.getShippingStatus(),
                order.getCodStatus(),
                order.getNote(),
                order.getChannel(),
                order.getSmsNotification(),
                order.getInvoiceRequest(),
                order.getPromoCode(),
                order.getInvoiceUrl(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getPaidAt(),
                order.getShippedAt(),
                order.getDeliveredAt()
        );
    }

    private String buildShippingAddress(CreateOrderRequest request) {
        return String.format("%s, %s, %s, %s", 
                request.getStreet(), 
                request.getWard(), 
                request.getDistrict(), 
                request.getProvince());
    }

    private void createPaymentForOrder(Order order) {
        try {
            String url = paymentServiceUrl + "/api/payment/vnpay"
                       + "?amount=" + order.getTotal().longValue()
                       + "&orderId=" + order.getOrderNumber();
    
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, null, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String paymentUrl = response.getBody().get("url").toString();
                order.setPaymentUrl(paymentUrl);
                order.setPaymentStatus("Chờ thanh toán");
                orderRepository.save(order);
            }
        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán VNPay: ", e);
            order.setPaymentStatus("Lỗi thanh toán");
            orderRepository.save(order);
        }
    }
    
    public OrderResponse cancelOrder(String orderId, String reason) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setOrderStatus("Đã hủy");
            order.setNote(reason);
            order.setUpdatedAt(LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);
            return convertToOrderResponse(savedOrder);
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }

    public String generateInvoice(String orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            // Tạo URL hóa đơn (có thể là URL tới service tạo PDF hoặc URL tới file đã tạo)
            // Trong thực tế, đây sẽ là URL tới file PDF đã được tạo
            String invoiceUrl = String.format("http://localhost:9003/api/orders/%s/invoice.pdf", order.getOrderNumber());
            
            // Lưu URL này vào database
            order.setInvoiceUrl(invoiceUrl);
            orderRepository.save(order);
            
            log.info("Generated invoice URL for order {}: {}", orderId, invoiceUrl);
            return invoiceUrl;
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }
    

} 