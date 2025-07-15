package com.b2110941.ProductService.entity;

import lombok.*;

import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Document(collection = "products")
public class Product {
    @Id
    private String id;

    private String name;
    private String brand;
    private String origin;
    private String goldAge;
    private String category;
    private String sku;
    private String productCode;
    private String thumbnailUrl;
    private List<String> tags;
    private double weight;
    private int quantity;
    private double price;
    private String karat;
    private String material;
    private String status;
    private String note;
    private String certificationNumber;
    private String design;
    private int stockQuantity;
    private Double wage;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getGoldAge() { return goldAge; }
    public void setGoldAge(String goldAge) { this.goldAge = goldAge; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getKarat() { return karat; }
    public void setKarat(String karat) { this.karat = karat; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCertificationNumber() { return certificationNumber; }
    public void setCertificationNumber(String certificationNumber) { this.certificationNumber = certificationNumber; }
    public String getDesign() { return design; }
    public void setDesign(String design) { this.design = design; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public Double getWage() { return wage; }
    public void setWage(Double wage) { this.wage = wage; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

