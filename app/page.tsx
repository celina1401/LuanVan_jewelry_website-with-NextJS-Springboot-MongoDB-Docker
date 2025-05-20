"use client"

import { Navbar } from "@/components/navbar";
import { HeroSlider } from "@/components/ui/hero-slider";
import { BestSellerProducts } from "@/components/ui/best-seller-products";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSlider />
        <BestSellerProducts />
        
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Exquisite Collections</h3>
                <p className="text-muted-foreground">
                  Discover our carefully curated collection of fine jewellery, crafted with precision and passion.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Timeless Elegance</h3>
                <p className="text-muted-foreground">
                  Experience the perfect blend of traditional craftsmanship and modern design in every piece.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Each piece is crafted with the finest materials and attention to detail.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Luxury Jewellery. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}