import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageUrl(productOrId: any): string {
  // Nếu là object sản phẩm, ưu tiên sử dụng thumbnailUrl từ Cloudinary
  if (typeof productOrId === 'object' && productOrId.thumbnailUrl) {
    return productOrId.thumbnailUrl;
  }
  
  // Fallback: sử dụng API backend nếu không có Cloudinary URL
  if (typeof productOrId === 'object' && (productOrId.id || productOrId.product_id)) {
    return `http://localhost:9004/api/products/image/${productOrId.id || productOrId.product_id}`;
  }
  
  // Nếu là string/number ID, gọi API backend
  if (typeof productOrId === 'string' || typeof productOrId === 'number') {
    if (productOrId === "no-image.png" || productOrId === "" || productOrId === null || productOrId === undefined) {
      return "/default-avatar.png";
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
