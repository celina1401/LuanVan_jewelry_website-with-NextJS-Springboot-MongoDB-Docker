# Order Service

Order Service là một microservice trong hệ thống T&C Jewelry, chịu trách nhiệm quản lý đơn hàng của khách hàng.

## Tính năng

- Tạo đơn hàng mới
- Lấy thông tin đơn hàng theo ID hoặc mã đơn hàng
- Lấy danh sách đơn hàng của người dùng
- Cập nhật trạng thái đơn hàng
- Cập nhật trạng thái giao hàng
- Cập nhật trạng thái thanh toán
- Xóa đơn hàng

## Cấu trúc dự án

```
orderservice/
├── src/main/java/com/b2110941/OrderService/
│   ├── controller/
│   │   └── OrderController.java
│   ├── entity/
│   │   ├── Order.java
│   │   └── OrderItem.java
│   ├── payload/
│   │   ├── request/
│   │   │   ├── CreateOrderRequest.java
│   │   │   └── OrderItemRequest.java
│   │   └── response/
│   │       ├── OrderResponse.java
│   │       └── OrderItemResponse.java
│   ├── repository/
│   │   └── OrderRepository.java
│   ├── service/
│   │   └── OrderService.java
│   ├── configuration/
│   │   └── RestTemplateConfig.java
│   └── OrderServiceApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

## API Endpoints

### Tạo đơn hàng
```
POST /api/orders
Content-Type: application/json

{
  "userId": "user_id",
  "customerName": "Tên khách hàng",
  "customerPhone": "Số điện thoại",
  "customerEmail": "email@example.com",
  "receiverName": "Tên người nhận",
  "street": "Địa chỉ",
  "ward": "Phường/Xã",
  "district": "Quận/Huyện",
  "province": "Tỉnh/Thành phố",
  "items": [
    {
      "productId": "product_id",
      "productName": "Tên sản phẩm",
      "productImage": "URL hình ảnh",
      "quantity": 1,
      "price": 1000000,
      "weight": "10g",
      "goldAge": "18K",
      "wage": "50000",
      "category": "Nhẫn",
      "brand": "T&C"
    }
  ],
  "subtotal": 1000000,
  "shippingFee": 0,
  "discount": 0,
  "total": 1000000,
  "paymentMethod": "cod",
  "note": "Ghi chú",
  "smsNotification": true,
  "invoiceRequest": false,
  "promoCode": "PROMO123"
}
```

### Lấy đơn hàng theo ID
```
GET /api/orders/{orderId}
```

### Lấy đơn hàng theo mã đơn hàng
```
GET /api/orders/number/{orderNumber}
```

### Lấy danh sách đơn hàng của người dùng
```
GET /api/orders/user/{userId}
```

### Lấy tất cả đơn hàng
```
GET /api/orders
```

### Cập nhật trạng thái đơn hàng
```
PUT /api/orders/{orderId}/status?orderStatus=Đã giao
```

### Cập nhật trạng thái giao hàng
```
PUT /api/orders/{orderId}/shipping?shippingStatus=Đang giao
```

### Cập nhật trạng thái thanh toán
```
PUT /api/orders/{orderId}/payment?paymentStatus=Đã thanh toán&transactionId=123456
```

### Xóa đơn hàng
```
DELETE /api/orders/{orderId}
```

## Cấu hình

### application.yml
```yaml
server:
  port: 9003

spring:
  application:
    name: orderservice
  data:
    mongodb:
      host: localhost
      port: 27017
      database: orderservice
      auto-index-creation: true

eureka:
  client:
    service-url:
      defaultZone: http://discoveryserver:8761/eureka
    register-with-eureka: true
    fetch-registry: true

user:
  service:
    url: http://localhost:9001

payment:
  service:
    url: http://localhost:9006
```

## Tích hợp với Frontend

### API Routes
Frontend sử dụng các API routes sau để giao tiếp với OrderService:

- `/api/orders` - Tạo và lấy danh sách đơn hàng
- `/api/orders/[orderId]` - Lấy, cập nhật và xóa đơn hàng cụ thể

### Dashboard Integration
Dashboard hiển thị danh sách đơn hàng của người dùng và cho phép xem chi tiết từng đơn hàng.

### Order Page Integration
Trang đặt hàng tích hợp với OrderService để tạo đơn hàng mới và xử lý thanh toán.

## Chạy ứng dụng

### Sử dụng Docker Compose
```bash
cd BackEnd
docker-compose up orderservice
```

### Chạy trực tiếp
```bash
cd BackEnd/orderservice
mvn spring-boot:run
```

## Dependencies

- Spring Boot 3.5.3
- Spring Data MongoDB
- Spring Cloud Netflix Eureka Client
- Lombok
- RestTemplate

## Database Schema

### Order Collection
```json
{
  "_id": "ObjectId",
  "userId": "String",
  "orderNumber": "String",
  "customerName": "String",
  "customerPhone": "String",
  "customerEmail": "String",
  "receiverName": "String",
  "street": "String",
  "ward": "String",
  "district": "String",
  "province": "String",
  "shippingAddress": "String",
  "items": [
    {
      "productId": "String",
      "productName": "String",
      "productImage": "String",
      "quantity": "Number",
      "price": "Number",
      "totalPrice": "Number",
      "weight": "String",
      "goldAge": "String",
      "wage": "String",
      "category": "String",
      "brand": "String"
    }
  ],
  "subtotal": "Number",
  "shippingFee": "Number",
  "discount": "Number",
  "total": "Number",
  "paymentMethod": "String",
  "paymentStatus": "String",
  "transactionId": "String",
  "paymentUrl": "String",
  "orderStatus": "String",
  "shippingStatus": "String",
  "codStatus": "String",
  "note": "String",
  "channel": "String",
  "smsNotification": "Boolean",
  "invoiceRequest": "Boolean",
  "promoCode": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "paidAt": "Date",
  "shippedAt": "Date",
  "deliveredAt": "Date",
  "createdBy": "String",
  "updatedBy": "String"
}
```

## Trạng thái đơn hàng

- **Chờ xử lý**: Đơn hàng mới được tạo
- **Đang giao**: Đơn hàng đang được vận chuyển
- **Đã giao**: Đơn hàng đã được giao thành công
- **Hủy**: Đơn hàng đã bị hủy

## Trạng thái thanh toán

- **Chờ xử lý**: Chưa thanh toán
- **Đã thanh toán**: Đã thanh toán thành công
- **Thất bại**: Thanh toán thất bại
- **Thanh toán một phần**: Thanh toán một phần (COD)

## Trạng thái giao hàng

- **Chưa giao hàng**: Chưa bắt đầu giao hàng
- **Đang giao**: Đang trong quá trình giao hàng
- **Đã giao**: Đã giao hàng thành công
- **Hủy**: Đơn hàng bị hủy 