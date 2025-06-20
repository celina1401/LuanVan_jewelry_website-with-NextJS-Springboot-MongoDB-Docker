"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "./button"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const slides = [
  {
    id: 1,
    title: "Discover Exquisite Jewellery",
    subtitle: "Crafted with passion and precision",
    image: "/images/slider/slide1.jpg",
    link: "/slider",
  },
  {
    id: 2,
    title: "Timeless Elegance",
    subtitle: "Find your perfect piece",
    image: "/images/slider/slide2.jpg",
    link: "/slider",

  },
  {
    id: 3,
    title: "Unforgettable Gifts",
    subtitle: "Browse our curated collections",
    image: "/images/slider/slide3.jpg",
    link: "/slider",

  },
]

export function HeroSlider() {
  const { userId, isLoaded } = useAuth()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const autoplayRef = React.useRef<NodeJS.Timeout>()

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      console.log("Scrolling prev");
    }
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      console.log("Scrolling next");
    }
  }, [emblaApi])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    const prev = emblaApi.canScrollPrev();
    const next = emblaApi.canScrollNext();
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(prev);
    setCanScrollNext(next);
    console.log(`onSelect called: canScrollPrev=${prev}, canScrollNext=${next}, selectedIndex=${emblaApi.selectedScrollSnap()}`);
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
    if (!emblaApi) {
      console.log("emblaApi not available yet");
      return;
    }
    
    console.log("emblaApi available, setting up listeners");
    
    // Call onSelect immediately after emblaApi is available
    onSelect()

    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    startAutoplay()

    // Cleanup
    return () => {
      stopAutoplay()
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
      console.log("Embla API listeners cleaned up");
    }
  }, [emblaApi, onSelect, startAutoplay, stopAutoplay])

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  return (
    <section className="relative w-full overflow-hidden rounded-lg shadow-xl md:rounded-2xl">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide) => (
            <div key={slide.id} className="embla__slide relative flex-none w-full h-[400px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-lg md:text-xl mb-6">{slide.subtitle}</p>
                  {isLoaded ? (
                    <Link href={userId ? "/products" : "/login"}>
                      <Button size="lg" variant="secondary">
                        Shop Now
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" variant="secondary" disabled>
                      Loading...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add navigation buttons */}
        <button
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 rounded-full p-2 z-10 disabled:opacity-50"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 rounded-full p-2 z-10 disabled:opacity-50"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        {/* Add pagination dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${selectedIndex === index ? "bg-white" : "bg-gray-400"}`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 