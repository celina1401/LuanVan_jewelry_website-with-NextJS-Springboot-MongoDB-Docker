package com.b2110941.ProductService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.b2110941.ProductService.entity.Product;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategory(String category);
    List<Product> findBySku(String sku);
    List<Product> findByBrand(String brand);
    List<Product> findByIdIn(List<String> ids);
}
