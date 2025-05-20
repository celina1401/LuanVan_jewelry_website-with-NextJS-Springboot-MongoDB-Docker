"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "./button"
import Link from "next/link"
import { useAuth } from "@/app/api/apiClient"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    title: "Welcome to Luxury Jewellery",
    description: "Discover our exquisite collection of fine jewelry, where timeless elegance meets modern craftsmanship.",
    image: "/images/slider/slide1.jpg"
  },
  {
    title: "Diamond Collection",
    description: "Explore our stunning diamond pieces, each one a masterpiece of precision and beauty.",
    image: "/images/slider/slide2.jpg"
  },
  {
    title: "Gold & Platinum",
    description: "From classic gold to contemporary platinum designs, find your perfect statement piece.",
    image: "/images/slider/slide3.jpg"
  }
]

export function HeroSlider() {
  const { isAuthenticated } = useAuth()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const autoplayRef = React.useRef<NodeJS.Timeout>()

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Autoplay function
  const autoplay = React.useCallback(() => {
    if (!emblaApi) return
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext()
    } else {
      emblaApi.scrollTo(0)
    }
  }, [emblaApi])

  // Start autoplay 5s
  const startAutoplay = React.useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(autoplay, 5000) // 5s
  }, [autoplay])

  // Stop autoplay
  const stopAutoplay = React.useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    startAutoplay()

    // Cleanup
    return () => {
      stopAutoplay()
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect, startAutoplay, stopAutoplay])

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide relative flex-[0_0_100%] min-w-0"
            >
              <div
                className="w-full h-[600px] bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                          {slide.title}
                        </h1>
                        <p className="mx-auto max-w-[700px] md:text-xl">
                          {slide.description}
                        </p>
                      </div>
                      <div className="space-x-4">
                        {isAuthenticated ? (
                          <Link href="/dashboard">
                            <Button size="lg" variant="secondary">
                              Go to Dashboard
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/register">
                            <Button size="lg" variant="secondary">
                              Get Started
                            </Button>
                          </Link>
                        )}
                        <Link href="/about">
                          <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20">
                            Learn More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/30"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
} 