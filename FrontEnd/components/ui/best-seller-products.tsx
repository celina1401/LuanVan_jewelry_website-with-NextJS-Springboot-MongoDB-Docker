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
import { translateProductTag } from "../../lib/utils";

const bestSellerProducts = [
  {
    id: 1,
    name: "Nhẫn đính hôn kim cương",
    description: "Nhẫn kim cương solitaire cổ điển với viên chủ 1 carat",
    price: 4999,
    image: "/images/products/ring1.jpg",
    category: "Nhẫn",
    rating: 4.9,
    reviews: 128
  },
  {
    id: 2,
    name: "Vòng tay vàng",
    description: "Vòng tay vàng 14k sang trọng đính kim cương cắt tròn",
    price: 2999,
    image: "/images/products/bracelet1.jpg",
    category: "Vòng tay",
    rating: 4.8,
    reviews: 95
  },
  {
    id: 3,
    name: "Dây chuyền ngọc trai",
    description: "Dây chuyền ngọc trai nước ngọt cao cấp với khóa vàng",
    price: 1999,
    image: "/images/products/necklace1.jpg",
    category: "Dây chuyền",
    rating: 4.7,
    reviews: 76
  },
  {
    id: 4,
    name: "Bông tai kim cương",
    description: "Bông tai kim cương cổ điển tổng trọng lượng 1 carat",
    price: 3499,
    image: "/images/products/earrings1.jpg",
    category: "Bông tai",
    rating: 4.9,
    reviews: 112
  }
]

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

  const handleAddToCart = (product: any) => {
    if (!isLoaded || !userId) {
      router.push('/login')
      return
    }
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image
    })
  }

  return (
    <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Sản phẩm bán chạy
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Khám phá những mẫu trang sức được yêu thích và đánh giá cao nhất
            </p>
          </div>
        </div>

        <div className="relative mt-8">
          {bestSellerProducts.length > 4 && (
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
              {bestSellerProducts.map((product, index) => (
                <div key={product.id} className="flex-[0_0_calc(25%-12px)] min-w-0">
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          priority={index < 4} // Thêm priority cho tất cả sản phẩm bán chạy
                        />
                        <Badge className="absolute top-2 right-2">
                          {translateProductTag(product.category)}
                        </Badge>
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
                              className={`w-4 h-4 ${i < Math.floor(product.rating)
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