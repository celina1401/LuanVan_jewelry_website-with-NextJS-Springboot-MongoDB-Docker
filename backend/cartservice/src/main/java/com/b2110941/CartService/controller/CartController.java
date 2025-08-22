package com.b2110941.CartService.controller;

import com.b2110941.CartService.entity.Cart;
import com.b2110941.CartService.payload.request.*;
import com.b2110941.CartService.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public Cart addToCart(@RequestBody CartRequests.AddToCartRequest req) {
        return cartService.addItemToCart(req.getUserId(), req.getProductId(), req.getQuantity());
    }

    @GetMapping
    public Cart getCart(@RequestParam String userId) {
        return cartService.getCartByUserId(userId);
    }

    @PostMapping("/remove")
    public Cart removeFromCart(@RequestBody CartRequests.RemoveFromCartRequest req) {
        return cartService.removeItemFromCart(req.getUserId(), req.getProductId());
    }

    @PostMapping("/update")
    public Cart updateQuantity(@RequestBody CartRequests.UpdateCartRequest req) {
        return cartService.updateItemQuantity(req.getUserId(), req.getProductId(), req.getQuantity());
    }
} 