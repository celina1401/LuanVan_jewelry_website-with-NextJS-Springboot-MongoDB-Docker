package com.b2110941.CartService.service.impl;

import com.b2110941.CartService.entity.Cart;
import com.b2110941.CartService.entity.CartItem;
import com.b2110941.CartService.payload.response.ProductResponse;
import com.b2110941.CartService.repository.CartRepository;
import com.b2110941.CartService.service.CartService;

import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public Cart getCartByUserId(String userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
        }
        return cart;
    }

    @Override
    public Cart addItemToCart(String userId, String productId, int quantity) {
        // Gọi productservice trực tiếp qua localhost:9004 nếu không dùng Eureka
        String productServiceUrl = "http://productservice/api/products/" + productId;
        ProductResponse product = restTemplate.getForObject(productServiceUrl, ProductResponse.class);
        if (product == null) {
            throw new RuntimeException("Không lấy được sản phẩm");
        }
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
        }
        List<CartItem> items = cart.getItems();
        CartItem existing = null;
        for (CartItem item : items) {
            if (item.getProductId().equals(productId)) {
                existing = item;
                break;
            }
        }
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProductId(productId);
            newItem.setName(product.getName());
            newItem.setPrice(product.getPrice());
            newItem.setImage(product.getThumbnailUrl());
            newItem.setQuantity(quantity);
            items.add(newItem);
        }
        cart.setItems(items);
        Cart saved = cartRepository.save(cart); // Lưu lại cart mới nhất
        return saved; // Trả về cart mới nhất
    }

    @Override
    public Cart removeItemFromCart(String userId, String productId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) return null;
        List<CartItem> items = cart.getItems();
        if (items == null) return cart;
        Iterator<CartItem> it = items.iterator();
        while (it.hasNext()) {
            CartItem item = it.next();
            if (item.getProductId().equals(productId)) {
                it.remove();
                break;
            }
        }
        cart.setItems(items);
        return cartRepository.save(cart);
    }

    @Override
    public Cart clearCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) return null;
        cart.setItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateItemQuantity(String userId, String productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) return null;
        List<CartItem> items = cart.getItems();
        if (items == null) return cart;
        for (CartItem item : items) {
            if (item.getProductId().equals(productId)) {
                item.setQuantity(quantity);
                break;
            }
        }
        cart.setItems(items);
        return cartRepository.save(cart);
    }
} 