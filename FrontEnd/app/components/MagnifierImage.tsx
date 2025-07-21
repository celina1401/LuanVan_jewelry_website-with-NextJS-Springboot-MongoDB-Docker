"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"

interface MagnifierImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  zoom?: number
  lensSize?: number
}

export const MagnifierImage: React.FC<MagnifierImageProps> = ({
  src,
  alt,
  width = 300,
  height = 300,
  zoom = 1.5,
  lensSize = 160,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPosition({ x, y })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition(null)}
      className="relative border rounded-md overflow-hidden"
      style={{ width, height }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
      />

      {position && (
        <div
          className="absolute pointer-events-none border border-gray-400 shadow-md rounded-full"
          style={{
            width: lensSize,
            height: lensSize,
            top: `${position.y - lensSize / 2}px`,
            left: `${position.x - lensSize / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${width * zoom}px ${height * zoom}px`,
            backgroundPosition: `-${position.x * zoom - lensSize / 2}px -${position.y * zoom - lensSize / 2}px`,
            zIndex: 50,
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        />
      )}
    </div>
  )
}
