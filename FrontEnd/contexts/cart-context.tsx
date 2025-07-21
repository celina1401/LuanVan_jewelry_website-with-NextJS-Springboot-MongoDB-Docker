"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "./use-toast"
import { getProductImageUrl } from "../lib/utils"

interface CartItem {
  id: string
  productId?: string
  name: string
  price: number
  quantity: number
  image: string
  metadata?: {
    color?: string
    weight?: number
    wage?: number
    goldAge?: string
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string, metadata?: CartItem["metadata"]) => void
  updateQuantity: (id: string, quantity: number, metadata?: CartItem["metadata"]) => void
  total: number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_API_URL = "http://localhost:9005/api"
const PRODUCT_API_URL = "http://localhost:9004/api"

// Fetch cart items and enrich with product data
async function fetchCartWithProductDetails(userId: string) {
  const cartData = await fetch(`${CART_API_URL}/cart?userId=${userId}`, { credentials: "include" }).then(res => res.json())
  const items = cartData.items || []

  if (items.length === 0) return []

  const productIds = items.map((item: any) => item.productId)
  const products = await fetch(`${PRODUCT_API_URL}/products/batch?ids=${productIds.join(",")}`, { credentials: "include" }).then(res => res.json())

  return items.map((item: any, idx: number) => {
    const product = products.find((p: any) => p.id === item.productId)
    return {
      ...item,
      id: item.productId || item.id || `cartitem-${idx}-${Date.now()}`,
      productId: item.productId,
      name: product?.name || "Sản phẩm",
      price: product?.price || 0,
      image: product ? getProductImageUrl(product) : "/default-avatar.png",
      metadata: {
        weight: product?.weight,
        wage: product?.wage,
        goldAge: product?.goldAge,
        color: product?.color,
      }
    }
  })
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { userId, isLoaded } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isLoaded && userId) {
      fetchCartWithProductDetails(userId).then(setItems).catch(() => setItems([]))
    }
  }, [userId, isLoaded])

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    if (!isLoaded || !userId) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm vào giỏ hàng",
        variant: "destructive",
      })
      return
    }

    fetch(`${CART_API_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId,
        productId: item.id,
        quantity
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchCartWithProductDetails(userId).then(setItems).catch(() => setItems([]))
        toast({
          title: "Đã thêm vào giỏ hàng!",
          description: item.name,
        })
      })
      .catch(() => {
        toast({
          title: "Lỗi khi thêm sản phẩm",
          description: item.name,
          variant: "destructive",
        })
      })
  }

  const removeItem = (id: string, metadata?: CartItem["metadata"]) => {
    if (!isLoaded || !userId) return
    const item = items.find(i => i.id === id)
    const productId = (item && (item.productId || item.id)) ? String(item.productId || item.id) : id

    fetch(`${CART_API_URL}/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, productId })
    })
      .then(res => res.json())
      .then(() => fetchCartWithProductDetails(userId).then(setItems).catch(() => setItems([])))
      .catch(() => setItems([]))
  }

  const updateQuantity = (id: string, quantity: number, metadata?: CartItem["metadata"]) => {
    if (!isLoaded || !userId) return
    if (quantity < 1) {
      removeItem(id, metadata)
      return
    }

    const item = items.find(i => i.id === id)
    const productId = (item && (item.productId || item.id)) ? String(item.productId || item.id) : id

    fetch(`${CART_API_URL}/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId,
        productId,
        quantity
      })
    })
      .then(res => res.json())
      .then(() => fetchCartWithProductDetails(userId).then(setItems).catch(() => setItems([])))
      .catch(() => setItems([]))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, clearCart }}>
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
