import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageUrl(productOrId: any): string {
  if (!productOrId || productOrId === "no-image.png" || productOrId === "" || productOrId === null || productOrId === undefined) return "/default-avatar.png";
  if (typeof productOrId === 'object' && (productOrId.id || productOrId.product_id)) {
    return `http://localhost:9004/api/products/image/${productOrId.id || productOrId.product_id}`;
  }
  if (typeof productOrId === 'string' || typeof productOrId === 'number') {
    if (productOrId === "no-image.png" || productOrId === "" || productOrId === null || productOrId === undefined) return "/default-avatar.png";
    return `http://localhost:9004/api/products/image/${productOrId}`;
  }
  if (typeof productOrId === 'string' && (productOrId.startsWith('http') || productOrId.startsWith('/'))) {
    return productOrId;
  }
  return "/default-avatar.png";
}
