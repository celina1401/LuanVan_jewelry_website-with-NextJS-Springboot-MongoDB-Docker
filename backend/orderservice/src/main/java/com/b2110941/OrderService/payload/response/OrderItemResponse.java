package com.b2110941.OrderService.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private Double price;
    private Double totalPrice;
    
    // Product metadata
    private String weight;
    private String goldAge;
    private String wage;
    private String category;
    private String brand;
} 