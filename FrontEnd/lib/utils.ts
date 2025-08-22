import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageUrl(productOrId: any): string {
  // Nếu là object có trường image (đã chuẩn hoá khi add to cart), dùng trực tiếp
  if (typeof productOrId === 'object' && typeof productOrId?.image === 'string' && productOrId.image.length > 0) {
    const img: string = productOrId.image;
    if (img.startsWith('http') || img.startsWith('/')) return img;
  }

  // Nếu là object sản phẩm, ưu tiên sử dụng thumbnailUrl từ Cloudinary
  if (typeof productOrId === 'object' && typeof productOrId?.thumbnailUrl === 'string' && productOrId.thumbnailUrl.length > 0) {
    return productOrId.thumbnailUrl;
  }

  // Nếu là object OrderItem, ưu tiên sử dụng productImage
  if (typeof productOrId === 'object' && typeof productOrId?.productImage === 'string' && productOrId.productImage.length > 0) {
    const img: string = productOrId.productImage;
    if (img.startsWith('http') || img.startsWith('/')) return img;
  }

  // Nếu có mảng images và phần tử đầu là URL hợp lệ
  if (typeof productOrId === 'object' && Array.isArray(productOrId?.images) && productOrId.images.length > 0) {
    const firstImg = productOrId.images[0];
    if (typeof firstImg === 'string' && (firstImg.startsWith('http') || firstImg.startsWith('/'))) {
      return firstImg;
    }
  }

  // Fallback: sử dụng API backend nếu có id
  if (typeof productOrId === 'object' && (productOrId?.id || productOrId?.product_id || productOrId?.productId)) {
    return `http://localhost:9004/api/products/image/${productOrId.id || productOrId.product_id || productOrId.productId}`;
  }

  // Nếu là string/number ID, gọi API backend
  if (typeof productOrId === 'string' || typeof productOrId === 'number') {
    if (productOrId === "no-image.png" || productOrId === "" || productOrId === null || productOrId === undefined) {
      return "/images/products/ring1.jpg";
    }
    return `http://localhost:9004/api/products/image/${productOrId}`;
  }

  // Nếu là URL trực tiếp (http hoặc /)
  if (typeof productOrId === 'string' && (productOrId.startsWith('http') || productOrId.startsWith('/'))) {
    return productOrId;
  }
  
  return "/default-avatar.png";
}

// Chuyển đổi tag/category sản phẩm từ tiếng Anh sang tiếng Việt
export function translateProductTag(tag: string): string {
  switch (tag) {
    case 'all': return 'Tất cả';
    case 'earring': return 'Bông tai';
    case 'ring': return 'Nhẫn';
    case 'bracelet': return 'Vòng tay';
    case 'necklace': return 'Dây chuyền';
    case 'new': return 'Mới';
    case 'best-seller': return 'Bán chạy';
    case 'promotion': return 'Khuyến mãi';
    default: return tag;
  }
}

/**
 * Safely format a number with toLocaleString, handling undefined/null values
 */
export function safeNumberFormat(value: number | undefined | null, fallback: string = '0'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return value.toLocaleString();
}

/**
 * Safely format a number as currency with toLocaleString
 */
export function safeCurrencyFormat(value: number | undefined | null, currency: string = '₫', fallback: string = '0'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return `${value.toLocaleString()}${currency}`;
}
