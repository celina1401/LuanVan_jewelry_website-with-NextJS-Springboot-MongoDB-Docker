"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader } from "./card"
import { Badge } from "./badge"
import { useCart } from "../../contexts/cart-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Mock data - In real app, this would come from an API
const products = [
  {
    id: 1,
    name: "Diamond Engagement Ring",
    description: "Classic solitaire diamond ring with 1 carat center stone",
    price: 4999,
    image: "/images/products/ring1.jpg",
    category: "Rings",
    rating: 4.9,
    reviews: 128,
    isNew: true
  },
  {
    id: 2,
    name: "Gold Tennis Bracelet",
    description: "Elegant 14k gold bracelet with round cut diamonds",
    price: 2999,
    image: "/images/products/bracelet1.jpg",
    category: "Bracelets",
    rating: 4.8,
    reviews: 95,
    isNew: false
  },
  {
    id: 3,
    name: "Pearl Necklace",
    description: "Luxurious freshwater pearl necklace with gold clasp",
    price: 1999,
    image: "/images/products/necklace1.jpg",
    category: "Necklaces",
    rating: 4.7,
    reviews: 76,
    isNew: true
  },
  {
    id: 4,
    name: "Diamond Stud Earrings",
    description: "Classic diamond studs with 1 carat total weight",
    price: 3499,
    image: "/images/products/earrings1.jpg",
    category: "Earrings",
    rating: 4.9,
    reviews: 112,
    isNew: false
  },
  // Add more products as needed
]

interface ProductGridProps {
  category: string
  priceRange: string
  sortBy: string
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

export function ProductGrid({ category, priceRange, sortBy }: ProductGridProps) {
  const { addItem } = useCart()
  const router = useRouter();
  const { toast } = useToast();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const filteredProducts = React.useMemo(() => {
    let filtered = products
      .filter((product) => {
        // Filter by category
        if (category !== "All" && product.category !== category) {
          return false
        }

        // Filter by price range
        if (priceRange !== "all") {
          const [min, max] = priceRange.split("-").map(Number)
          if (max) {
            if (product.price < min || product.price > max) {
              return false
            }
          } else {
            // Handle "5000+" case
            if (product.price < min) {
              return false
            }
          }
        }

        return true
      })
      .sort((a, b) => {
        // Sort products
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price
          case "price-desc":
            return b.price - a.price
          case "newest":
            return b.isNew ? 1 : -1
          case "popular":
          default:
            return b.reviews - a.reviews
        }
      })
    if (sortBy === "favorite") {
      filtered = filtered.filter(product => favorites.includes(product.id));
    }
    return filtered;
  }, [category, priceRange, sortBy, favorites])

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No products found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden group cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          <CardHeader className="p-0">
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <Badge className="absolute top-2 right-2">
                {product.category}
              </Badge>
              {product.isNew && (
                <Badge variant="secondary" className="absolute top-2 left-2">
                  New
                </Badge>
              )}
              {/* Icon tim yêu thích */}
              <button
                className={`absolute bottom-2 right-2 text-xl z-10 transition-colors ${isFavorite(product.id) ? "text-rose-500" : "text-gray-300 hover:text-rose-400"}`}
                onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
                title={isFavorite(product.id) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
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
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                ({product.reviews})
              </span>
            </div>
            <p className="text-lg font-semibold mt-2">
              ${product.price.toLocaleString()}
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
                  image: product.image
                });
                toast({
                  title: "Đã thêm vào giỏ hàng!",
                  description: product.name,
                });
              }}
            >
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 