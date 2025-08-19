"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader } from "./card"
import { Badge } from "./badge"
import { useCart } from "../../contexts/cart-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react";
import { getProductImageUrl, translateProductTag } from "../../lib/utils";
import { ProductsEmptyState, LoadingSpinner } from "@/lib";

// Lấy danh sách sản phẩm từ backend
interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string;
  thumbnailUrl?: string; // URL ảnh chính từ Cloudinary
  images?: string[]; // Danh sách ảnh từ Cloudinary
  category: string;
  rating: number;
  reviews: number;
  // ratings?: number[]; // mảng điểm đánh giá
  isNew?: boolean;
  gender?: string;
  goldAge?: string;
  karat?: string;
  weight?: number;
  wage?: number;
}

interface ProductGridProps {
  category: string
  priceRange: string
  goldAge: string
  sortBy: string
  gender: string
}

// Hook quản lý danh sách sản phẩm yêu thích trong localStorage
function useFavorites() {
  const [favorites, setFavorites] = React.useState<(string | number)[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string | number) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  const isFavorite = (id: string | number) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}

// // Hàm tính điểm đánh giá trung bình từ mảng ratings
// function calculateAverageRating(ratings: number[] = []) {
//   if (!ratings || ratings.length === 0) return 5.0;
//   const total = ratings.reduce((sum, r) => sum + r, 0);
//   return total / ratings.length;
// }

// Hook lấy giá vàng động (theo chỉ) cho từng loại tuổi vàng
function useCurrentGoldPricePerChi(age: string | undefined) {
  const [price, setPrice] = React.useState<number | null>(null);
  useEffect(() => {
    if (!age) return;
    fetch(`/api/gold-price/latest?age=${age}`)
      .then(res => res.json())
      .then(data => {
        if (data.pricePerChi) setPrice(data.pricePerChi);
      });
  }, [age]);
  return price;
}

export function ProductGrid({ category, priceRange, goldAge, sortBy, gender }: ProductGridProps) {
  const { addItem } = useCart()
  const router = useRouter();
  const { toast } = useToast();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [mounted, setMounted] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  // Thêm state lưu giá vàng động cho từng sản phẩm
  const [productGoldPrices, setProductGoldPrices] = React.useState<{ [id: string]: number }>({});

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Fetching products from backend...');
        const res = await fetch('http://localhost:9004/api/products/all');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Products from backend:', data);
        
        // Debug: Kiểm tra từng sản phẩm và ảnh
        if (data && Array.isArray(data)) {
          data.forEach((product: any, index: number) => {
            console.log(`[DEBUG] Product ${index + 1}:`, {
              id: product.id,
              name: product.name,
              thumbnailUrl: product.thumbnailUrl,
              images: product.images,
              image: product.image,
              category: product.category,
              gender: product.gender
            });
          });
        }
        
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Hiển thị thông báo lỗi cho user
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
          variant: "destructive"
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  React.useEffect(() => { setMounted(true); }, []);

  // Fetch giá vàng cho tất cả các loại tuổi vàng duy nhất trong products
  React.useEffect(() => {
    const ages = Array.from(new Set(products.map(p => p.goldAge || p.karat).filter(Boolean)));
    if (ages.length === 0) return;
    Promise.all(
      ages.map(age =>
        fetch(`/api/gold-price/latest?age=${age}`)
          .then(res => res.json())
          .then(data => ({ age, price: data.pricePerChi }))
      )
    ).then(results => {
      const pricesObj: { [age: string]: number } = {};
      results.forEach(({ age, price }) => {
        if (typeof age === "string" && age.length > 0) {
          pricesObj[age] = price;
        }
      });
      // setGoldPrices(pricesObj); // This state is no longer needed
    });
  }, [products]);

  React.useEffect(() => {
    async function fetchAllGoldPrices() {
      const prices: { [id: string]: number } = {};
      await Promise.all(products.map(async (product) => {
        const age = product.goldAge || product.karat;
        if (age && product.weight) {
          try {
            const res = await fetch(`/api/gold-price/latest?age=${age}`);
            const data = await res.json();
            if (data.pricePerChi) {
              prices[product.id] = data.pricePerChi * product.weight + (product.wage || 0);
            }
          } catch {}
        }
      }));
      setProductGoldPrices(prices);
    }
    if (products.length > 0) fetchAllGoldPrices();
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    let filtered = products
      .filter((product) => {
        // Gender filtering
        const matchGender = gender === "all" || product.gender === gender;
        
        // Category filtering - use the original category value from backend
        const matchCategory = category === "all" || product.category === category;
        
        // Gold age filtering - improved logic
        let matchGoldAge = true;
        if (goldAge !== "all") {
          const productGoldAge = (product.goldAge || product.karat || "").toString().toUpperCase().trim();
          const selectedGoldAgeUpper = goldAge.toUpperCase().trim();
          
          // Check exact match first
          if (productGoldAge === selectedGoldAgeUpper) {
            matchGoldAge = true;
          } else if (productGoldAge && selectedGoldAgeUpper) {
            // Check if product gold age contains the selected value (for partial matches)
            // Also handle cases like "18K" vs "18" or "K18"
            const cleanProduct = productGoldAge.replace(/[^0-9K]/g, '');
            const cleanSelected = selectedGoldAgeUpper.replace(/[^0-9K]/g, '');
            
            matchGoldAge = cleanProduct === cleanSelected || 
                          productGoldAge.includes(selectedGoldAgeUpper) || 
                          selectedGoldAgeUpper.includes(productGoldAge);
          } else {
            matchGoldAge = false;
          }
          
          // Debug logging for gold age filtering
          console.log(`Product ${product.name}: productGoldAge="${productGoldAge}", selected="${selectedGoldAgeUpper}", match=${matchGoldAge}`);
        }
        
        // Price range filtering
        let matchPrice = true;
        if (priceRange !== "all") {
          const productPrice = productGoldPrices[product.id] ?? product.price;
          
          if (priceRange.includes("+")) {
            // Handle "5000000+" case
            const min = parseInt(priceRange.replace("+", ""));
            matchPrice = productPrice >= min;
            
          } else {
            // Handle range like "1000000-2000000"
            const [min, max] = priceRange.split("-").map(Number);
            matchPrice = productPrice >= min && productPrice <= max;
            console.log(`Product ${product.name}: price ${productPrice} in range ${min}-${max} = ${matchPrice}`);
          }
        }
        
        const result = matchGender && matchCategory && matchGoldAge && matchPrice;
        console.log(`Product ${product.name}: gender=${matchGender}, category=${matchCategory}, goldAge=${matchGoldAge}, price=${matchPrice}, final=${result}`);
        
        return result;
      })
      .sort((a, b) => {
        // Sort products
        switch (sortBy) {
          case "price-asc":
            return (productGoldPrices[a.id] ?? a.price) - (productGoldPrices[b.id] ?? b.price)
          case "price-desc":
            return (productGoldPrices[b.id] ?? b.price) - (productGoldPrices[a.id] ?? a.price)
          case "newest":
            return b.isNew ? 1 : -1
          case "popular":
          default:
            return b.reviews - a.reviews
        }
      })
    if (sortBy === "favorite") {
      filtered = filtered.filter(product => favorites.includes(product.id as string | number));
    }
    
    return filtered;
  }, [products, category, priceRange, sortBy, favorites, gender, productGoldPrices, goldAge]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (filteredProducts.length === 0) {
    return <ProductsEmptyState />;
  }

  
  return (
    <div className="space-y-6">


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => {
          const totalPrice = productGoldPrices[product.id] ?? product.price;
        return (
          <Card
            key={product.id}
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <CardHeader className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority={index < 6} // Thêm priority cho 6 sản phẩm đầu tiên
                  onError={(e) => {
                    console.error(`Failed to load image for product ${product.id}:`, e);
                    // Fallback to default image if needed
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/default-avatar.png") {
                      target.src = "/default-avatar.png";
                    }
                  }}
                />
                <Badge className="absolute top-2 right-2">
                  {translateProductTag(product.category)}
                </Badge>
                {product.isNew && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Mới
                  </Badge>
                )}
                {/* Icon tim yêu thích */}
                <button
                  className={`absolute bottom-2 right-2 text-xl z-10 transition-colors ${mounted && isFavorite(product.id as string | number) ? "text-rose-500" : "text-gray-300 hover:text-rose-400"}`}
                  onClick={e => { e.stopPropagation(); toggleFavorite(product.id as string | number); }}
                  title={mounted ? (isFavorite(product.id as string | number) ? "Bỏ yêu thích" : "Thêm vào yêu thích") : "Thêm vào yêu thích"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="28" height="28">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {product.description}
              </p>
              <p className="text-lg font-semibold mt-2 text-rose-500">
                {totalPrice ? totalPrice.toLocaleString() + '₫' : '-'}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem({
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    image: getProductImageUrl(product) // Sử dụng getProductImageUrl để lấy ảnh từ Cloudinary hoặc fallback
                  });
                  toast({
                    title: "Đã thêm vào giỏ hàng!",
                    description: product.name,
                  });
                }}
              >
                Thêm vào giỏ hàng
              </Button>
            </CardFooter>
          </Card>
        );
        })}
      </div>
    </div>
  )
} 