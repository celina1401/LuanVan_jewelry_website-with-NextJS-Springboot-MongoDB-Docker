package com.b2110941.ProductService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.b2110941.ProductService.entity.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
}
