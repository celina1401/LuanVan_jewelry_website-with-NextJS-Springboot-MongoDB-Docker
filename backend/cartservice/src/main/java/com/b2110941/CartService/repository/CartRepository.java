package com.b2110941.CartService.repository;

import com.b2110941.CartService.entity.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRepository extends MongoRepository<Cart, String> {
    Cart findByUserId(String userId);
} 