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
  sortBy: string
  gender: string
}

// Hook quản lý danh sách sản phẩm yêu thích trong localStorage
function useFavorites() {
  const [favorites, setFavorites] = React.useState<number[]>(() => {
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

  const toggleFavorite = (id: number) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  const isFavorite = (id: number) => favorites.includes(id);

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

export function ProductGrid({ category, priceRange, sortBy, gender }: ProductGridProps) {
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
        const res = await fetch('http://localhost:9004/api/products/all');
        const data = await res.json();
        console.log('Products from backend:', data);
        
        // Debug: Kiểm tra từng sản phẩm
        // data.forEach((product: any, index: number) => {
        //   console.log(`[DEBUG] Product ${index + 1}:`, {
        //     id: product.id,
        //     name: product.name,
        //     rating: product.rating,
        //     reviews: product.reviews,
        //     category: product.category
        //   });
        // });
        
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
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
        
        // Price range filtering
        let matchPrice = true;
        if (priceRange !== "all") {
          const [min, max] = priceRange.split("-").map(Number);
          const productPrice = productGoldPrices[product.id] ?? product.price;
          
          if (max) {
            matchPrice = productPrice >= min && productPrice <= max;
          } else {
            // Handle "5000000+" case
            matchPrice = productPrice >= min;
          }
        }
        
        return matchGender && matchCategory && matchPrice;
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
      filtered = filtered.filter(product => favorites.includes(product.id as number));
    }
    
    return filtered;
  }, [products, category, priceRange, sortBy, favorites, gender, productGoldPrices]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (filteredProducts.length === 0) {
    return <ProductsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => {
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
                  className={`absolute bottom-2 right-2 text-xl z-10 transition-colors ${mounted && isFavorite(product.id as number) ? "text-rose-500" : "text-gray-300 hover:text-rose-400"}`}
                  onClick={e => { e.stopPropagation(); toggleFavorite(product.id as number); }}
                  title={mounted ? (isFavorite(product.id as number) ? "Bỏ yêu thích" : "Thêm vào yêu thích") : "Thêm vào yêu thích"}
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
              {/* <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    // Sử dụng rating từ backend (đã được tính từ ReviewService)
                    const productRating = product.rating || 0;
                    
                    // Debug log cho sản phẩm đầu tiên
                    if (product.id === products[0]?.id) {
                      console.log(`[DEBUG] Product ${product.id}:`, {
                        name: product.name,
                        rating: product.rating,
                        reviews: product.reviews
                      });
                    }
                    
                    const fullStars = Math.floor(productRating);
                    const hasHalfStar = productRating - fullStars >= 0.25 && productRating - fullStars < 0.75;
                    
                    if (i < fullStars) {
                      return (
                        <svg
                          key={i}
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      );
                    } else if (i === fullStars && hasHalfStar) {
                      return (
                        <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                          <defs>
                            <linearGradient id={`half-star-${product.id}-${i}`}>
                              <stop offset="50%" stopColor="#facc15" />
                              <stop offset="50%" stopColor="#d1d5db" />
                            </linearGradient>
                          </defs>
                          <path fill={`url(#half-star-${product.id}-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      );
                    } else {
                      return (
                        <svg
                          key={i}
                          className="w-4 h-4 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      );
                    }
                  })}
                </div>
                <span className="text-sm text-muted-foreground ml-2">
                  {(product.rating || 0).toFixed(1)} ({product.reviews || 0})
                </span>
              </div> */}
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
                    image: getProductImageUrl(product)
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
  )
} 