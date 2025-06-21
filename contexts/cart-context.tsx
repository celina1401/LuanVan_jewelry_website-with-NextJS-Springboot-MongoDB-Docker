"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "./use-toast"

// Loại sản phẩm trong giỏ
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  metadata?: {
    color?: string
  }
}

// API context
interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string, metadata?: CartItem["metadata"]) => void
  updateQuantity: (id: string, quantity: number, metadata?: CartItem["metadata"]) => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { userId, isLoaded } = useAuth()
  const { toast } = useToast()

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    if (!isLoaded || !userId) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      })
      return
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (i) =>
          i.id === item.id &&
          i.metadata?.color === item.metadata?.color
      )

      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id && i.metadata?.color === item.metadata?.color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }

      return [...currentItems, { ...item, quantity }]
    })
  }

  const removeItem = (id: string, metadata?: CartItem["metadata"]) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.id !== id ||
          item.metadata?.color !== metadata?.color
      )
    )
  }

  const updateQuantity = (id: string, quantity: number, metadata?: CartItem["metadata"]) => {
    if (quantity < 1) {
      removeItem(id, metadata)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.metadata?.color === metadata?.color
          ? { ...item, quantity }
          : item
      )
    )
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
