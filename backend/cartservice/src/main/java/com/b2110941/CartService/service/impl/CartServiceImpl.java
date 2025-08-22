package com.b2110941.CartService.service.impl;

import com.b2110941.CartService.entity.Cart;
import com.b2110941.CartService.entity.CartItem;
import com.b2110941.CartService.repository.CartRepository;
import com.b2110941.CartService.service.CartService;

import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
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
        try {
            // Sử dụng service discovery thay vì hardcoded localhost
            String productServiceUrl = "http://productservice/api/products/" + productId;
            
            System.out.println("Gọi ProductService: " + productServiceUrl);
            
            // Sử dụng Map thay vì ProductResponse để tương thích với Product entity
            Map<String, Object> product = restTemplate.getForObject(productServiceUrl, Map.class);
            if (product == null) {
                throw new RuntimeException("Không lấy được thông tin sản phẩm từ ProductService");
            }
            
            System.out.println("Đã lấy được sản phẩm: " + product.get("name"));
            
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
                newItem.setName((String) product.get("name"));
                // newItem.setPrice((Double) product.get("price"));
                newItem.setImage((String) product.get("thumbnailUrl"));
                newItem.setQuantity(quantity);
                items.add(newItem);
            }
            
            cart.setItems(items);
            Cart saved = cartRepository.save(cart);
            return saved;
            
        } catch (Exception e) {
            System.err.println("Lỗi khi thêm sản phẩm vào giỏ hàng: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể thêm sản phẩm vào giỏ hàng: " + e.getMessage());
        }
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