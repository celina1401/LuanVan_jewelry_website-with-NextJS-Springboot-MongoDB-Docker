package com.b2110941.ProductService.controller;

import com.b2110941.ProductService.entity.Product;
import com.b2110941.ProductService.entity.ProductDetail;
import com.b2110941.ProductService.repository.ProductRepository;
import com.b2110941.ProductService.repository.ProductDetailRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductDetailRepository productDetailRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Lấy tất cả sản phẩm
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    /**
     * Lấy chi tiết sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy thông tin sản phẩm với hình ảnh (tương tự như user profile)
     */
    @GetMapping("/profile/{productId}")
    public ResponseEntity<?> getProductProfile(@PathVariable String productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // Trả về thông tin sản phẩm với hình ảnh
            Map<String, Object> result = new HashMap<>();
            result.put("id", product.getId());
            result.put("name", product.getName());
            result.put("brand", product.getBrand());
            result.put("origin", product.getOrigin());
            result.put("goldAge", product.getGoldAge());
            result.put("category", product.getCategory());
            result.put("sku", product.getSku());
            result.put("productCode", product.getProductCode());
            result.put("thumbnailUrl", product.getThumbnailUrl()); // URL hình ảnh chính
            result.put("tags", product.getTags());
            result.put("weight", product.getWeight());
            result.put("quantity", product.getQuantity());
            result.put("price", product.getPrice());
            result.put("karat", product.getKarat());
            result.put("material", product.getMaterial());
            result.put("status", product.getStatus());
            result.put("note", product.getNote());
            result.put("certificationNumber", product.getCertificationNumber());
            result.put("design", product.getDesign());
            result.put("stockQuantity", product.getStockQuantity());
            result.put("wage", product.getWage());
            result.put("createdAt", product.getCreatedAt());
            result.put("updatedAt", product.getUpdatedAt());
            
            // Lấy thêm thông tin chi tiết sản phẩm nếu có
            List<ProductDetail> details = productDetailRepository.findByProductId(productId);
            if (!details.isEmpty()) {
                result.put("productDetails", details);
            }
            
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }
    }

    /**
     * Thêm sản phẩm mới (có hỗ trợ upload ảnh)
     */
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        System.out.println("==> [POST /add] Nhận request thêm sản phẩm");
        System.out.println("==> [POST /add] productJson: " + productJson);
        if (image != null) {
            System.out.println("==> [POST /add] Có file ảnh: " + image.getOriginalFilename() + ", size: " + image.getSize());
        } else {
            System.out.println("==> [POST /add] Không có file ảnh");
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Product product = objectMapper.readValue(productJson, Product.class);
            System.out.println("==> [POST /add] Parse product thành công: " + product.getName());
            System.out.println("==> [POST /add] Giá trị price: " + product.getPrice());
            System.out.println("==> [POST /add] Giá trị quantity: " + product.getQuantity());
            System.out.println("==> [POST /add] Giá trị wage: " + product.getWage());
            System.out.println("==> [POST /add] Giá trị weight: " + product.getWeight());

            // Ép kiểu nếu cần (nếu các trường là String)
            try {
                if (product.getWeight() == 0 && productJson.contains("\"weight\":")) {
                    double w = Double.parseDouble(productJson.split("\"weight\":\"")[1].split("\"")[0]);
                    product.setWeight(w);
                    System.out.println("==> [POST /add] Ép kiểu weight thành công: " + w);
                }
                if (product.getQuantity() == 0 && productJson.contains("\"quantity\":")) {
                    int q = Integer.parseInt(productJson.split("\"quantity\":\"")[1].split("\"")[0]);
                    product.setQuantity(q);
                    System.out.println("==> [POST /add] Ép kiểu quantity thành công: " + q);
                }
                if ((product.getWage() == null || product.getWage() == 0) && productJson.contains("\"wage\":")) {
                    String wageStr = productJson.split("\"wage\":\"")[1].split("\"")[0].replace(".", "");
                    double wage = Double.parseDouble(wageStr);
                    product.setWage(wage);
                    System.out.println("==> [POST /add] Ép kiểu wage thành công: " + wage);
                }
            } catch (Exception ex) {
                System.out.println("==> [POST /add] Lỗi ép kiểu số: " + ex.getMessage());
            }

            // Validate bắt buộc
            if (product.getName() == null || product.getName().trim().isEmpty() || product.getPrice() <= 0) {
                System.out.println("==> [POST /add] Lỗi: Tên sản phẩm rỗng hoặc giá <= 0");
                return ResponseEntity.badRequest().body("Tên sản phẩm hoặc giá không hợp lệ.");
            }

            // Xử lý ảnh nếu có
            if (image != null && !image.isEmpty()) {
                String filename = System.currentTimeMillis() + "_" + Paths.get(image.getOriginalFilename()).getFileName().toString();
                Path uploadPath = Paths.get("uploads/products");
                Files.createDirectories(uploadPath); // Tạo thư mục nếu chưa có
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Lưu đường dẫn vào DB
                product.setThumbnailUrl("/uploads/products/" + filename);
            }

            // Set ngày tạo và ngày cập nhật là thời điểm hiện tại
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setUpdatedAt(java.time.LocalDateTime.now());

            // Lưu vào DB
            Product saved = productRepository.save(product);
            System.out.println("==> [POST /add] Lưu product thành công, id: " + saved.getId());

            // Tạo bản ghi chi tiết
            ProductDetail detail = new ProductDetail();
            detail.setProductId(saved.getId());
            detail.setWeight(saved.getWeight());
            detail.setDesign(saved.getDesign());
            detail.setOrigin(saved.getOrigin());
            detail.setStockQuantity(saved.getQuantity());
            detail.setImageUrl(saved.getThumbnailUrl());
            detail.setCertificationNumber(saved.getCertificationNumber());
            detail.setNote(saved.getNote());
            detail.setStatus(saved.getStatus());
            productDetailRepository.save(detail);
            System.out.println("==> [POST /add] Lưu ProductDetail thành công");

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.out.println("==> [POST /add] Lỗi khi thêm sản phẩm: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }

    

    /**
     * Cập nhật sản phẩm theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm.");
        }
        product.setId(id);
        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cập nhật hình ảnh sản phẩm
     */
    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProductImage(
            @PathVariable String id,
            @RequestPart("image") MultipartFile image
    ) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm.");
        }

        Product product = productOpt.get();
        
        try {
            // Xử lý upload ảnh mới
            String uploadsDir = "uploads/";
            Path uploadsPath = Paths.get(uploadsDir);
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
            }

            String originalFilename = Paths.get(image.getOriginalFilename()).getFileName().toString();
            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = uploadsPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Cập nhật URL hình ảnh
            product.setThumbnailUrl("/" + uploadsDir + fileName);
            product.setUpdatedAt(LocalDateTime.now());

            // Lưu vào DB
            Product updated = productRepository.save(product);
            
            // Trả về thông tin cập nhật
            Map<String, Object> result = new HashMap<>();
            result.put("id", updated.getId());
            result.put("name", updated.getName());
            result.put("thumbnailUrl", updated.getThumbnailUrl());
            result.put("updatedAt", updated.getUpdatedAt());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi cập nhật hình ảnh: " + e.getMessage());
        }
    }

    /**
     * Xóa sản phẩm theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm.");
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xóa hình ảnh sản phẩm
     */
    @DeleteMapping("/{id}/image")
    public ResponseEntity<?> deleteProductImage(@PathVariable String id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm.");
        }

        Product product = productOpt.get();
        String thumbnailUrl = product.getThumbnailUrl();
        
        if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            try {
                // Xóa file hình ảnh từ hệ thống
                if (thumbnailUrl.startsWith("/")) {
                    thumbnailUrl = thumbnailUrl.substring(1);
                }
                Path imagePath = Paths.get(thumbnailUrl);
                if (Files.exists(imagePath)) {
                    Files.delete(imagePath);
                }
                
                // Cập nhật sản phẩm - xóa URL hình ảnh
                product.setThumbnailUrl(null);
                product.setUpdatedAt(LocalDateTime.now());
                productRepository.save(product);
                
                return ResponseEntity.ok("Đã xóa hình ảnh sản phẩm thành công");
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi xóa file hình ảnh: " + e.getMessage());
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sản phẩm không có hình ảnh để xóa");
        }
    }

    /**
     * Tìm sản phẩm theo tên (gần đúng, không phân biệt hoa thường)
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<Product>> searchByName(@RequestParam("q") String name) {
        return ResponseEntity.ok(productRepository.findByNameContainingIgnoreCase(name));
    }

    /**
     * Tìm sản phẩm theo category
     */
    @GetMapping("/search/category")
    public ResponseEntity<List<Product>> searchByCategory(@RequestParam("q") String category) {
        return ResponseEntity.ok(productRepository.findByCategory(category));
    }

    /**
     * Tìm sản phẩm theo SKU
     */
    @GetMapping("/search/sku")
    public ResponseEntity<List<Product>> searchBySku(@RequestParam("q") String sku) {
        return ResponseEntity.ok(productRepository.findBySku(sku));
    }

    /**
     * Tìm sản phẩm theo brand
     */
    @GetMapping("/search/brand")
    public ResponseEntity<List<Product>> searchByBrand(@RequestParam("q") String brand) {
        return ResponseEntity.ok(productRepository.findByBrand(brand));
    }

    /**
     * Lấy chi tiết sản phẩm theo productId
     */
    @GetMapping("/detail/by-product")
    public ResponseEntity<List<ProductDetail>> getDetailByProductId(@RequestParam("productId") String productId) {
        return ResponseEntity.ok(productDetailRepository.findByProductId(productId));
    }

    /**
     * Tìm chi tiết sản phẩm theo mã kiểm định
     */
    @GetMapping("/detail/certification")
    public ResponseEntity<List<ProductDetail>> getDetailByCertification(@RequestParam("cert") String cert) {
        return ResponseEntity.ok(productDetailRepository.findByCertificationNumber(cert));
    }

    /**
     * Tìm chi tiết sản phẩm theo trạng thái
     */
    @GetMapping("/detail/status")
    public ResponseEntity<List<ProductDetail>> getDetailByStatus(@RequestParam("status") String status) {
        return ResponseEntity.ok(productDetailRepository.findByStatus(status));
    }

    /**
     * Tìm chi tiết sản phẩm theo design (gần đúng)
     */
    @GetMapping("/detail/design")
    public ResponseEntity<List<ProductDetail>> getDetailByDesign(@RequestParam("q") String design) {
        return ResponseEntity.ok(productDetailRepository.findByDesignContainingIgnoreCase(design));
    }

    /**
     * Hiển thị hình ảnh sản phẩm
     */
    @GetMapping("/image/{productId}")
    public ResponseEntity<?> getProductImage(@PathVariable String productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            String thumbnailUrl = product.getThumbnailUrl();
            
            if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
                try {
                    // Loại bỏ dấu "/" ở đầu nếu có
                    if (thumbnailUrl.startsWith("/")) {
                        thumbnailUrl = thumbnailUrl.substring(1);
                    }
                    
                    Path imagePath = Paths.get(thumbnailUrl);
                    if (Files.exists(imagePath)) {
                        byte[] imageBytes = Files.readAllBytes(imagePath);
                        
                        // Xác định content type dựa trên extension
                        String contentType = "image/jpeg"; // default
                        String fileName = imagePath.getFileName().toString().toLowerCase();
                        if (fileName.endsWith(".png")) {
                            contentType = "image/png";
                        } else if (fileName.endsWith(".gif")) {
                            contentType = "image/gif";
                        } else if (fileName.endsWith(".webp")) {
                            contentType = "image/webp";
                        }
                        
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.parseMediaType(contentType));
                        headers.setContentLength(imageBytes.length);
                        
                        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                    } else {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image file not found");
                    }
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reading image file");
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product has no image");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        }
    }

    /**
     * Lấy danh sách tất cả sản phẩm với thông tin hình ảnh
     */
    @GetMapping("/all-with-images")
    public ResponseEntity<?> getAllProductsWithImages() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Product product : products) {
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("id", product.getId());
            productInfo.put("name", product.getName());
            productInfo.put("brand", product.getBrand());
            productInfo.put("category", product.getCategory());
            productInfo.put("price", product.getPrice());
            productInfo.put("thumbnailUrl", product.getThumbnailUrl());
            productInfo.put("status", product.getStatus());
            productInfo.put("quantity", product.getQuantity());
            productInfo.put("createdAt", product.getCreatedAt());
            productInfo.put("updatedAt", product.getUpdatedAt());
            productInfo.put("productCode", product.getProductCode());
            
            result.add(productInfo);
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Test endpoint để kiểm tra ảnh có tồn tại không
     */
    @GetMapping("/test-image/{filename}")
    public ResponseEntity<?> testImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get("uploads/" + filename);
            if (Files.exists(imagePath)) {
                return ResponseEntity.ok("Image exists: " + imagePath.toAbsolutePath());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image not found: " + imagePath.toAbsolutePath());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách tất cả files trong thư mục uploads
     */
    @GetMapping("/list-uploads")
    public ResponseEntity<?> listUploads() {
        try {
            Path uploadsPath = Paths.get("uploads");
            List<String> files = new ArrayList<>();
            if (Files.exists(uploadsPath)) {
                Files.list(uploadsPath).forEach(path -> {
                    files.add(path.getFileName().toString());
                });
            }
            // Luôn trả về mảng (có thể rỗng)
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
