"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "./button"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

type Slide = { id: string; image: string; title?: string; subtitle?: string; link?: string }

export function HeroSlider() {
  const { userId, isLoaded } = useAuth()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const autoplayRef = React.useRef<NodeJS.Timeout>()
  const [slides, setSlides] = useState<Slide[]>([])

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
    // console.log(`onSelect called: canScrollPrev=${prev}, canScrollNext=${next}, selectedIndex=${emblaApi.selectedScrollSnap()}`);
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

  // Load slider images from Cloudinary (folder: slider). Fallback to local images.
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cloudinary/list?folder=slider&max=10', { cache: 'no-store' })
        const data = await res.json()
        const resources = (data.resources || []) as Array<{ secure_url: string; public_id: string }>
        if (resources.length > 0) {
          setSlides(resources.map((r) => ({ id: r.public_id, image: r.secure_url })))
          return
        }
      } catch (e) {
        // ignore
      }
      setSlides([
        { id: '1', image: '/images/slider/slide1.jpg', title: 'Khám phá trang sức tinh xảo' },
        { id: '2', image: '/images/slider/slide2.jpg', title: 'Vẻ đẹp vượt thời gian' },
        { id: '3', image: '/images/slider/slide3.jpg', title: 'Món quà khó quên' },
      ])
    }
    load()
  }, [])

  return (
    <section className="relative w-full overflow-hidden rounded-lg shadow-xl md:rounded-2xl">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div key={slide.id} className="embla__slide relative flex-none w-full h-[400px]">
              <Image
                src={slide.image}
                alt={slide.title ?? `Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0} // Thêm priority cho slide đầu tiên
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-lg md:text-xl mb-6">{slide.subtitle}</p>
                  {isLoaded ? (
                    <Link href={userId ? "/products" : "/login"}>
                      {/* <Button size="lg" variant="secondary">
                        Mua ngay
                      </Button> */}
                    </Link>
                  ) : (
                    <Button size="lg" variant="secondary" disabled>
                      Đang tải...
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
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 rounded-full p-2 z-10 disabled:opacity-50"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Trang sau"
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
              aria-label={`Đến trang ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 