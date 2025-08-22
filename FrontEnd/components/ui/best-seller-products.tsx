"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader } from "./card"
import { Badge } from "./badge"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "../../contexts/cart-context"
import { useAuth } from "@clerk/nextjs"
import { translateProductTag, getProductImageUrl, safeCurrencyFormat } from "../../lib/utils";

// Interface cho sản phẩm từ database
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  images?: string[];
  category: string;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  bestSeller?: boolean;
  goldAge?: string;
  karat?: string;
  weight?: number;
  wage?: number;
}

export function BestSellerProducts() {
  const { addItem } = useCart()
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 4 }
    }
  })

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [productGoldPrices, setProductGoldPrices] = React.useState<{ [id: string]: number }>({})
  const [goldPricesLoading, setGoldPricesLoading] = React.useState(false)

  // Fetch sản phẩm từ database
  React.useEffect(() => {
    const fetchBestSellerProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Gọi API để lấy sản phẩm bán chạy
        const response = await fetch('/api/products/best-seller')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        console.error('Error fetching best seller products:', err)
        setError('Không thể tải sản phẩm bán chạy')
        // Fallback: sử dụng dữ liệu mẫu nếu API fail
        setProducts([
          {
            id: "1",
            name: "Nhẫn đính hôn kim cương",
            description: "Nhẫn kim cương solitaire cổ điển với viên chủ 1 carat",
            price: 4999,
            thumbnailUrl: "/images/products/ring1.jpg",
            category: "ring",
            rating: 4.9,
            reviews: 128,
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
            goldAge: "18k",
            weight: 4.8,
            wage: 400
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBestSellerProducts()
  }, [])

  // Fetch giá vàng động cho từng sản phẩm
  React.useEffect(() => {
    async function fetchAllGoldPrices() {
      setGoldPricesLoading(true);
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
      setGoldPricesLoading(false);
    }
    if (products.length > 0) fetchAllGoldPrices();
  }, [products])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const handleAddToCart = (product: Product) => {
    if (!isLoaded || !userId) {
      router.push('/login')
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getProductImageUrl(product)
    })
  }

  // Loading state
  if (loading) {
    return (
      <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl text-black dark:text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Sản phẩm bán chạy
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Khám phá những mẫu trang sức được yêu thích và đánh giá cao nhất
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl text-black dark:text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Sản phẩm bán chạy
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Không có sản phẩm
  if (products.length === 0) {
    return (
      <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl text-black dark:text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Sản phẩm bán chạy
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Không có sản phẩm bán chạy nào
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl text-black dark:text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Sản phẩm bán chạy
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Khám phá những mẫu trang sức được yêu thích và đánh giá cao nhất
            </p>
          </div>
        </div>

        <div className="relative mt-8">
          {products.length > 4 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {products.map((product, index) => (
                <div key={product.id} className="flex-[0_0_calc(25%-12px)] min-w-0">
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          priority={index < 4}
                          onError={(e) => {
                            // Fallback nếu ảnh lỗi
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/products/ring1.jpg";
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
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                      <div className="mt-2">
                        {goldPricesLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Đang cập nhật giá vàng...</span>
                          </div>
                        ) : productGoldPrices[product.id] ? (
                          <p className="text-lg font-semibold text-rose-500">
                            {safeCurrencyFormat(productGoldPrices[product.id])}
                          </p>
                        ) : (
                          <p className="text-lg font-semibold">
                            {safeCurrencyFormat(product.price)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Xem tất cả sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 