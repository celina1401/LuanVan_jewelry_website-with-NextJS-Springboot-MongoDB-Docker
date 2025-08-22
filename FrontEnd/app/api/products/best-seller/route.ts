import { NextRequest, NextResponse } from 'next/server';
import { makeServiceRequest } from '@/lib/service-urls';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Gọi ProductService để lấy sản phẩm bán chạy
    const response = await makeServiceRequest('product', '/api/products/best-seller', {}, process.env.PRODUCT_SERVICE_URL);
    
    if (!response.ok) {
      throw new Error(`Product service responded with status: ${response.status}`);
    }
    
    const products = await response.json();
    
    // Nếu không có sản phẩm bán chạy, lấy tất cả sản phẩm và chọn 4 sản phẩm đầu
    if (!products || products.length === 0) {
      console.log('No best seller products found, fetching all products...');
      const allProductsResponse = await makeServiceRequest('product', '/api/products/all', {}, process.env.PRODUCT_SERVICE_URL);
      
      if (allProductsResponse.ok) {
        const allProducts = await allProductsResponse.json();
        // Lấy 4 sản phẩm đầu tiên làm sản phẩm bán chạy
        const bestSellerProducts = allProducts.slice(0, 4);
        return NextResponse.json(bestSellerProducts);
      }
    }
    
    return NextResponse.json(products);
    
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    
    // Fallback: trả về dữ liệu mẫu nếu API fail
    const fallbackProducts = [
      {
        id: "1",
        name: "Nhẫn đính hôn kim cương",
        description: "Nhẫn kim cương solitaire cổ điển với viên chủ 1 carat",
        price: 4999,
        thumbnailUrl: "/images/products/ring1.jpg",
        category: "ring",
        rating: 4.9,
        reviews: 128,
        isNew: true,
        goldAge: "18k",
        weight: 3.5,
        wage: 500
      },
      {
        id: "2",
        name: "Vòng tay vàng",
        description: "Vòng tay vàng 14k sang trọng đính kim cương cắt tròn",
        price: 2999,
        thumbnailUrl: "/images/products/bracelet1.jpg",
        category: "bracelet",
        rating: 4.8,
        reviews: 95,
        bestSeller: true,
        goldAge: "14k",
        weight: 8.2,
        wage: 300
      },
      {
        id: "3",
        name: "Dây chuyền ngọc trai",
        description: "Dây chuyền ngọc trai nước ngọt cao cấp với khóa vàng",
        price: 1999,
        thumbnailUrl: "/images/products/necklace1.jpg",
        category: "necklace",
        rating: 4.7,
        reviews: 76,
        goldAge: "18k",
        weight: 2.1,
        wage: 200
      },
      {
        id: "4",
        name: "Bông tai kim cương",
        description: "Bông tai kim cương cổ điển tổng trọng lượng 1 carat",
        price: 3499,
        thumbnailUrl: "/images/products/earrings1.jpg",
        category: "earring",
        rating: 4.9,
        reviews: 112,
        bestSeller: true,
        goldAge: "18k",
        weight: 4.8,
        wage: 400
      }
    ];
    
    return NextResponse.json(fallbackProducts);
  }
}
