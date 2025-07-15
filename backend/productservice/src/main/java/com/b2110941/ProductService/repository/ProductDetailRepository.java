package com.b2110941.ProductService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.b2110941.ProductService.entity.ProductDetail;

import java.util.List;

public interface ProductDetailRepository extends MongoRepository<ProductDetail, String> {
    List<ProductDetail> findByProductId(String productId);
    List<ProductDetail> findByCertificationNumber(String certificationNumber);
    List<ProductDetail> findByStatus(String status);
    List<ProductDetail> findByDesignContainingIgnoreCase(String design);
}
