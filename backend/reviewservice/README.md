# Review Service

Service quản lý bình luận và đánh giá sản phẩm.

## Cấu trúc

```
src/main/java/com/b2110941/ReviewService/
├── controller/
│   └── ReviewController.java
├── entity/
│   └── Review.java
├── payload/
│   ├── ReviewRequest.java
│   └── ReviewResponse.java
├── repository/
│   └── ReviewRepository.java
├── service/
│   └── ReviewService.java
└── ReviewserviceApplication.java
```

## API Endpoints

### Reviews
- `GET /api/reviews` - Lấy tất cả reviews
- `GET /api/reviews/{reviewId}` - Lấy review theo ID
- `GET /api/reviews/product/{productId}` - Lấy reviews theo sản phẩm
- `GET /api/reviews/user/{userId}` - Lấy reviews theo user
- `GET /api/reviews/product/{productId}/count` - Đếm số reviews của sản phẩm
- `POST /api/reviews` - Tạo review mới
- `PUT /api/reviews/{reviewId}` - Cập nhật review
- `DELETE /api/reviews/{reviewId}` - Xóa review

## Cấu hình

### Port
- Service chạy trên port 9008

### Database
- MongoDB
- Database: reviewdb
- Collection: reviews

### Eureka
- Đăng ký với Eureka Server tại http://discoveryserver:8761/eureka
- Cấu hình trong `application.yml`

## Chạy service

### Development
```bash
cd BackEnd/reviewservice
mvn spring-boot:run
```

### Production với Docker
```bash
# Build
mvn clean package -DskipTests

# Chạy với docker-compose
cd BackEnd
docker-compose up reviewservice
```

## Frontend Integration

### Components
- `ReviewSection.tsx` - Component hiển thị và tạo bình luận
- `ReviewSummary.tsx` - Component hiển thị tổng quan đánh giá

### Admin
- `/admin/reviews` - Trang quản lý bình luận cho admin

## Tính năng

- ✅ Tạo bình luận với đánh giá sao
- ✅ Upload hình ảnh cho bình luận
- ✅ Hiển thị danh sách bình luận
- ✅ Tính toán điểm đánh giá trung bình
- ✅ Phân tích phân bố đánh giá
- ✅ Quản lý bình luận cho admin
- ✅ Tìm kiếm và lọc bình luận
- ✅ Xóa bình luận (soft delete) 