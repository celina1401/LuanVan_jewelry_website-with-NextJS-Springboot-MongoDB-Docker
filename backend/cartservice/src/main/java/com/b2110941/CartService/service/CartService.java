package com.b2110941.CartService.service;

import com.b2110941.CartService.entity.Cart;

public interface CartService {
    Cart getCartByUserId(String userId);
    Cart addItemToCart(String userId, String productId, int quantity);
    Cart removeItemFromCart(String userId, String productId);
    Cart clearCart(String userId);
    Cart updateItemQuantity(String userId, String productId, int quantity);
} 