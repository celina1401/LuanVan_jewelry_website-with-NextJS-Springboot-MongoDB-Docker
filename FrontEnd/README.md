 Full Stack Application with Next.js, Spring Boot, MongoDB, and Docker

This project is a full-stack application that uses Next.js for the frontend, Spring Boot for the backend, MongoDB for the database, and Docker for containerization.

## Features

- User authentication with JWT
- RESTful API
- Responsive UI built with Next.js, Tailwind CSS, and shadcn/ui
- MongoDB data persistence
- Docker containerization for easy deployment

## Tech Stack

### Frontend
- Next.js 13.5.1
- Tailwind CSS
- shadcn/ui components
- TypeScript
- React Hook Form
- Lucide Icons

### Backend
- Spring Boot 3.1.5
- Spring Security
- JWT Authentication
- Spring Data MongoDB
- Swagger/OpenAPI for API documentation

### Database
- MongoDB

### DevOps
- Docker
- Docker Compose

## Project Structure

```
.
├── app/                    # Next.js application files
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── backend/                # Spring Boot application
│   ├── src/                # Java source code
│   ├── pom.xml             # Maven dependencies
│   └── Dockerfile          # Backend Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile.frontend     # Frontend Docker configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed

### Running the Application

1. Clone the repository
2. Run the application using Docker Compose:

```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/swagger-ui.html

## Development

### Frontend Development

```bash
npm install
npm run dev
```

### Backend Development

```bash
cd backend
./mvnw spring-boot:run
```

## API Documentation

The API documentation is available through Swagger UI at http://localhost:8080/swagger-ui.html when the application is running.

## Authentication

The application uses JWT for authentication. To access protected endpoints, you need to:

1. Register a new user at `/register`
2. Log in at `/login` to get a JWT token
3. Include the token in the Authorization header for subsequent requests

## License

This project is licensed under the MIT License.

## Payment
# Synchronized Components

This directory contains reusable components that are synchronized across different pages of the application. These components provide consistent UI patterns, error handling, loading states, and user experience.

## Components Overview

### Payment & Order Components

#### `PaymentStatusCard`
Displays payment status with consistent styling and actions.

```tsx
import { PaymentStatusCard } from "@/components";

<PaymentStatusCard
  status="success"
  orderId="ORD123456"
  amount="1,500,000 VND"
  onRetry={handleRetry}
  showActions={true}
/>
```

#### `OrderSummaryCard`
Shows detailed order information in a consistent format.

```tsx
import { OrderSummaryCard } from "@/components";

<OrderSummaryCard
  order={orderData}
  showActions={true}
  onViewDetails={handleViewDetails}
  onTrackOrder={handleTrackOrder}
/>
```

### Loading Components

#### `LoadingSpinner`
Versatile loading spinner with multiple variants.

```tsx
import { LoadingSpinner, InlineLoadingSpinner, ButtonLoadingSpinner, PageLoadingSpinner } from "@/components";

// Basic loading spinner
<LoadingSpinner size="md" text="Đang tải..." />

// Full screen loading
<LoadingSpinner fullScreen={true} text="Đang xử lý..." />

// Inline loading
<InlineLoadingSpinner size="sm" />

// Button loading
<Button disabled={loading}>
  {loading ? <ButtonLoadingSpinner /> : "Submit"}
</Button>

// Page loading
<PageLoadingSpinner text="Đang tải trang..." />
```

### Error Handling Components

#### `ErrorBoundary`
Catches and displays errors gracefully.

```tsx
import { ErrorBoundary, ApiErrorDisplay } from "@/components";

// Wrap components with error boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Display API errors
<ApiErrorDisplay 
  error="Network error" 
  onRetry={handleRetry}
/>
```

### Empty State Components

#### `EmptyState`
Displays empty states with consistent messaging and actions.

```tsx
import { EmptyState, CartEmptyState, OrdersEmptyState } from "@/components";

// Generic empty state
<EmptyState
  title="Không có dữ liệu"
  description="Chưa có dữ liệu để hiển thị"
  actionLabel="Thêm mới"
  onAction={handleAdd}
/>

// Specialized empty states
<CartEmptyState />
<OrdersEmptyState />
<ProductsEmptyState />
```

### Page Header Components

#### `PageHeader`
Consistent page headers with actions and search.

```tsx
import { PageHeader, ProductsPageHeader } from "@/components";

// Generic page header
<PageHeader
  title="Quản lý sản phẩm"
  description="Thêm, chỉnh sửa và quản lý sản phẩm"
  actions={[
    { label: "Thêm mới", icon: "plus", href: "/admin/products/new" },
    { label: "Xuất Excel", icon: "download", onClick: handleExport }
  ]}
  search={{
    placeholder: "Tìm kiếm sản phẩm...",
    value: searchTerm,
    onChange: setSearchTerm,
    onSearch: handleSearch
  }}
/>

// Specialized page headers
<ProductsPageHeader actions={actions} />
<OrdersPageHeader search={searchConfig} />
```

### Status Badge Components

#### `StatusBadge`
Consistent status indicators across the application.

```tsx
import { StatusBadge, OrderStatusBadge, PaymentStatusBadge } from "@/components";

// Generic status badge
<StatusBadge status="success" label="Thành công" />

// Specialized status badges
<OrderStatusBadge status="shipped" />
<PaymentStatusBadge status="success" />
<UserStatusBadge status="active" />
```

## Usage Patterns

### 1. Consistent Error Handling

```tsx
import { ErrorBoundary, ApiErrorDisplay, LoadingSpinner } from "@/components";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (loading) return <LoadingSpinner text="Đang tải sản phẩm..." />;
  if (error) return <ApiErrorDisplay error={error} onRetry={fetchProducts} />;

  return (
    <ErrorBoundary>
      {/* Your component content */}
    </ErrorBoundary>
  );
}
```

### 2. Consistent Empty States

```tsx
import { EmptyState, ProductsEmptyState } from "@/components";

function ProductGrid({ products }) {
  if (products.length === 0) {
    return <ProductsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. Consistent Page Structure

```tsx
import { PageHeader, StatusBadge, LoadingSpinner } from "@/components";

function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        actions={[
          { label: "Thêm sản phẩm", icon: "plus", href: "/admin/products/new" }
        ]}
        search={{
          placeholder: "Tìm kiếm sản phẩm...",
          onChange: setSearchTerm
        }}
      />
      
      {/* Page content */}
    </div>
  );
}
```

## Design Principles

1. **Consistency**: All components follow the same design patterns and color schemes
2. **Accessibility**: Components are built with accessibility in mind
3. **Responsive**: All components work well on different screen sizes
4. **Dark Mode**: Components support both light and dark themes
5. **Type Safety**: Full TypeScript support with proper type definitions
6. **Reusability**: Components are designed to be flexible and reusable

## Color Scheme

The components use a consistent color scheme:

- **Primary**: Rose-500 (for buttons, links, and primary actions)
- **Success**: Green-500 (for success states)
- **Error**: Red-500 (for error states)
- **Warning**: Yellow-500 (for warning states)
- **Info**: Blue-500 (for informational states)
- **Neutral**: Gray-500 (for neutral states)

## Best Practices

1. **Always wrap error-prone components** with `ErrorBoundary`
2. **Use appropriate loading states** for async operations
3. **Provide meaningful empty states** when there's no data
4. **Use consistent status badges** for similar states across the app
5. **Include proper actions** in empty states and error messages
6. **Test components** in both light and dark modes

## Contributing

When adding new components:

1. Follow the existing naming conventions
2. Include proper TypeScript types
3. Add dark mode support
4. Include accessibility attributes
5. Add to the index.ts export file
6. Update this README if needed 