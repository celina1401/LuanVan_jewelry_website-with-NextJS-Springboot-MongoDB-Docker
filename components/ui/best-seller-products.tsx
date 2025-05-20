"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader } from "./card"
import { Badge } from "./badge"

const bestSellerProducts = [
  {
    id: 1,
    name: "Diamond Engagement Ring",
    description: "Classic solitaire diamond ring with 1 carat center stone",
    price: 4999,
    image: "/images/products/ring1.jpg",
    category: "Rings",
    rating: 4.9,
    reviews: 128
  },
  {
    id: 2,
    name: "Gold Tennis Bracelet",
    description: "Elegant 14k gold bracelet with round cut diamonds",
    price: 2999,
    image: "/images/products/bracelet1.jpg",
    category: "Bracelets",
    rating: 4.8,
    reviews: 95
  },
  {
    id: 3,
    name: "Pearl Necklace",
    description: "Luxurious freshwater pearl necklace with gold clasp",
    price: 1999,
    image: "/images/products/necklace1.jpg",
    category: "Necklaces",
    rating: 4.7,
    reviews: 76
  },
  {
    id: 4,
    name: "Diamond Stud Earrings",
    description: "Classic diamond studs with 1 carat total weight",
    price: 3499,
    image: "/images/products/earrings1.jpg",
    category: "Earrings",
    rating: 4.9,
    reviews: 112
  }
]

export function BestSellerProducts() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Best Sellers
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover our most popular and highly-rated jewelry pieces
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {bestSellerProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-2 right-2">
                    {product.category}
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
                <Button className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 