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
        // Lấy sản phẩm mới nhất từ CSDL (MongoDB)
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // Build map trả về từ dữ liệu DB
            Map<String, Object> result = new HashMap<>();
            result.put("id", product.getId());
            result.put("name", product.getName());
            result.put("brand", product.getBrand());
            result.put("origin", product.getOrigin());
            result.put("goldAge", product.getGoldAge());
            result.put("category", product.getCategory());
            result.put("sku", product.getSku());
            result.put("productCode", product.getProductCode());
            result.put("thumbnailUrl", product.getThumbnailUrl());
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
            result.put("description", product.getDescription());
            // Lấy thêm thông tin chi tiết nếu có
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

            // Sinh mã sản phẩm tự động, không trùng
            String prefix = "";
            switch (product.getCategory()) {
                case "necklace": prefix = "D"; break;
                case "ring": prefix = "N"; break;
                case "earring": prefix = "E"; break;
                case "bracelet": prefix = "B"; break;
                default: prefix = "X"; // fallback
            }
            // Tìm mã lớn nhất hiện có cho loại này
            List<Product> sameTypeProducts = productRepository.findByCategory(product.getCategory());
            int maxCode = 0;
            for (Product p : sameTypeProducts) {
                String code = p.getProductCode();
                if (code != null && code.startsWith(prefix)) {
                    try {
                        int num = Integer.parseInt(code.substring(1));
                        if (num > maxCode) maxCode = num;
                    } catch (Exception ignore) {}
                }
            }
            String newCode = prefix + String.format("%03d", maxCode + 1);
            product.setProductCode(newCode);

            // Xử lý ảnh nếu có
            if (image != null && !image.isEmpty()) {
                String filename = System.currentTimeMillis() + "_" + Paths.get(image.getOriginalFilename()).getFileName().toString();
                Path uploadPath = Paths.get("/uploads/products");
                System.out.println("[UPLOAD] Tạo thư mục: " + uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath); // Tạo thư mục nếu chưa có
                Path filePath = uploadPath.resolve(filename);
                System.out.println("[UPLOAD] Đường dẫn file sẽ lưu: " + filePath.toAbsolutePath());
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                System.out.println("[UPLOAD] Đã lưu file ảnh: " + filePath.toAbsolutePath());

                // Lưu đường dẫn vào DB
                product.setThumbnailUrl("/uploads/products/" + filename);
                System.out.println("[UPLOAD] thumbnailUrl lưu vào DB: /uploads/products/" + filename);
            }

            // Set ngày tạo và ngày cập nhật là thời điểm hiện tại
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setUpdatedAt(java.time.LocalDateTime.now());

            // Đảm bảo stockQuantity = quantity khi thêm mới
            if (product.getQuantity() != null) {
                product.setStockQuantity(product.getQuantity());
            }

            // Lưu vào DB
            Product saved = productRepository.save(product);
            System.out.println("==> [POST /add] Lưu product thành công, id: " + saved.getId());

            // Tạo bản ghi chi tiết
            ProductDetail detail = new ProductDetail();
            detail.setProductId(saved.getId());
            detail.setWeight(saved.getWeight());
            detail.setDesign(saved.getDesign());
            detail.setOrigin(saved.getOrigin());
            // Đảm bảo stockQuantity của ProductDetail cũng bằng quantity
            detail.setStockQuantity(saved.getQuantity());
            detail.setImageUrl(saved.getThumbnailUrl());
            detail.setCertificationNumber(saved.getCertificationNumber());
            detail.setNote(saved.getNote());
            detail.setStatus(saved.getStatus());
            detail.setDescription(saved.getDescription());
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
        System.out.println("Product nhận được từ frontend: " + product);
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy sản phẩm.");
        }
        Product existing = productOpt.get();

        // Lưu lại số lượng tồn kho cũ để kiểm tra
        Integer oldStockQuantity = existing.getStockQuantity();
        if (oldStockQuantity == null) oldStockQuantity = 0;
        Integer oldQuantity = existing.getQuantity();
        if (oldQuantity == null) oldQuantity = 0;

        // Cập nhật các trường nếu có gửi lên (chỉ cập nhật nếu khác null)
        if (product.getName() != null) existing.setName(product.getName());
        if (product.getBrand() != null) existing.setBrand(product.getBrand());
        if (product.getOrigin() != null) existing.setOrigin(product.getOrigin());
        if (product.getGoldAge() != null) existing.setGoldAge(product.getGoldAge());
        if (product.getCategory() != null) existing.setCategory(product.getCategory());
        if (product.getSku() != null) existing.setSku(product.getSku());
        if (product.getProductCode() != null) existing.setProductCode(product.getProductCode());
        if (product.getTags() != null) existing.setTags(product.getTags());
        if (product.getWeight() != null) existing.setWeight(product.getWeight());
        if (product.getQuantity() != null) existing.setQuantity(product.getQuantity());
        if (product.getPrice() != null) existing.setPrice(product.getPrice());
        if (product.getStockQuantity() != null) {
            // Nếu stockQuantity mới > stockQuantity cũ thì quantity += phần tăng thêm
            if (product.getStockQuantity() > oldStockQuantity) {
                int diff = product.getStockQuantity() - oldStockQuantity;
                existing.setQuantity(oldQuantity + diff);
            }
            existing.setStockQuantity(product.getStockQuantity());
        }
        if (product.getKarat() != null) existing.setKarat(product.getKarat());
        if (product.getMaterial() != null) existing.setMaterial(product.getMaterial());
        if (product.getStatus() != null) existing.setStatus(product.getStatus());
        if (product.getNote() != null) existing.setNote(product.getNote());
        if (product.getCertificationNumber() != null) existing.setCertificationNumber(product.getCertificationNumber());
        if (product.getDesign() != null) existing.setDesign(product.getDesign());
        if (product.getWage() != null) existing.setWage(product.getWage());
        if (product.getDescription() != null) existing.setDescription(product.getDescription());
        // Không cập nhật thumbnailUrl ở đây (ảnh dùng endpoint riêng)
        existing.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(existing);

        // --- Đồng bộ ProductDetail ---
        List<ProductDetail> details = productDetailRepository.findByProductId(id);
        if (details != null && !details.isEmpty()) {
            for (ProductDetail detail : details) {
                // Đồng bộ các trường chính
                if (product.getWeight() != null) detail.setWeight(product.getWeight());
                if (product.getOrigin() != null) detail.setOrigin(product.getOrigin());
                if (product.getStockQuantity() != null) detail.setStockQuantity(product.getStockQuantity());
                if (product.getDesign() != null) detail.setDesign(product.getDesign());
                if (product.getCertificationNumber() != null) detail.setCertificationNumber(product.getCertificationNumber());
                if (product.getNote() != null) detail.setNote(product.getNote());
                if (product.getStatus() != null) detail.setStatus(product.getStatus());
                if (product.getDescription() != null) detail.setDescription(product.getDescription());
                // Nếu cần đồng bộ thêm trường nào, thêm ở đây
                productDetailRepository.save(detail);
            }
        }
        // --- End đồng bộ ProductDetail ---

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
            String uploadsDir = "/uploads/products";
            Path uploadsPath = Paths.get(uploadsDir);
            if (!Files.exists(uploadsPath)) {
                Files.createDirectories(uploadsPath);
            }

            String originalFilename = Paths.get(image.getOriginalFilename()).getFileName().toString();
            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = uploadsPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Cập nhật URL hình ảnh
            product.setThumbnailUrl("/uploads/products/" + fileName);
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
                    // Lấy tên file từ thumbnailUrl
                    String fileName = thumbnailUrl.substring(thumbnailUrl.lastIndexOf("/") + 1);
                    Path imagePath = Paths.get("/uploads/products/" + fileName);
                    if (Files.exists(imagePath)) {
                        byte[] imageBytes = Files.readAllBytes(imagePath);
                        String contentType = Files.probeContentType(imagePath);
                        if (contentType == null) contentType = "image/jpeg";
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
            productInfo.put("goldAge", product.getGoldAge());
            productInfo.put("wage", product.getWage());
            productInfo.put("description", product.getDescription());
            
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
