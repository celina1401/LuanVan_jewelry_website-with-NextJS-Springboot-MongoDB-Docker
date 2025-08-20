"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { useCart } from "../../contexts/cart-context"
import { useRouter } from "next/navigation"
import { getProductImageUrl } from "../../lib/utils"
import { useUser } from "@clerk/nextjs"
import { LoginRequiredPopup } from "@/components/ui/login-required-popup"

export function Cart() {
  const { items, removeItem, updateQuantity } = useCart()
  const router = useRouter()
  const { isSignedIn } = useUser()

  const [calculatedPrices, setCalculatedPrices] = React.useState<{ [id: string]: number }>({})
  const [stockInfo, setStockInfo] = React.useState<{ [id: string]: number }>({})
  const [showLoginPopup, setShowLoginPopup] = React.useState(false)

  React.useEffect(() => {
    async function fetchPrices() {
      const result: { [id: string]: number } = {}
      const stockResult: { [id: string]: number } = {}

      await Promise.all(items.map(async (item) => {
        const metadata = item.metadata as {
          weight?: number
          wage?: number
          goldAge?: string
          category?: string
          brand?: string
          stock?: number
        } || {}

        const { weight, wage = 0, goldAge, stock = 0 } = metadata

        // Lấy thông tin tồn kho từ metadata
        stockResult[item.id] = stock

        if (weight && goldAge) {
          try {
            const res = await fetch(`/api/gold-price/latest?age=${goldAge}`)
            const data = await res.json()
            if (data.pricePerChi) {
              result[item.id] = data.pricePerChi * weight + wage
            }
          } catch (err) {
            console.error("Lỗi lấy giá vàng:", err)
          }
        } else if (item.price) {
          result[item.id] = item.price
        }
      }))

      setCalculatedPrices(result)
      setStockInfo(stockResult)
    }

    if (items.length > 0) {
      fetchPrices()
    }
  }, [items])

  // Kiểm tra xem có sản phẩm nào hết hàng không
  const hasOutOfStockItems = items.some(item => {
    const itemStock = stockInfo[item.id] || 0
    return itemStock < item.quantity
  })

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Giỏ hàng của bạn đang trống
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalPrice = Object.entries(calculatedPrices).reduce((sum, [id, price]) => {
    const item = items.find(i => i.id === id)
    const itemStock = stockInfo[id] || 0
    // Chỉ tính giá cho sản phẩm còn hàng
    if (item && itemStock >= item.quantity) {
      return sum + (price * item.quantity)
    }
    return sum
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giỏ hàng của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto pr-2">
          <div className="space-y-4">
            {items.map((item) => {
              const itemStock = stockInfo[item.id] || 0
              const isOutOfStock = itemStock < item.quantity
              
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <Image
                      src={getProductImageUrl(item)}
                      alt={item.name || "Ảnh sản phẩm"}
                      fill
                      className="object-cover rounded-md"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        if (!img.src.includes("default-avatar.png")) {
                          img.src = "/default-avatar.png"
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {/* Cảnh báo hết hàng */}
                    {isOutOfStock && (
                      <div className="text-red-500 text-sm font-medium mt-1">
                        ⚠️ Hết hàng! Chỉ còn {itemStock} sản phẩm
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isOutOfStock ? (
                        <span className="text-red-500">Không thể tính giá (hết hàng)</span>
                      ) : calculatedPrices[item.id] !== undefined ? (
                        `${calculatedPrices[item.id].toLocaleString()}₫`
                      ) : (
                        "Đang tính giá..."
                      )}
                    </p>

                    {item.metadata?.color && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Màu:</span>
                        <span
                          className="inline-block w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.metadata.color }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || isOutOfStock}
                      >
                        -
                      </Button>
                      <span className={`w-8 text-center ${isOutOfStock ? 'text-red-500' : ''}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isOutOfStock || item.quantity >= itemStock}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id, item.metadata)}
                  >
                    Xóa
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {/* Cảnh báo hết hàng */}
        {hasOutOfStockItems && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Không thể thanh toán</span>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              Một số sản phẩm đã hết hàng. Vui lòng xóa sản phẩm hết hàng hoặc giảm số lượng để tiếp tục.
            </p>
          </div>
        )}
        
        <div className="flex justify-between w-full text-lg font-medium">
          <span>Tổng cộng:</span>
          <span>{totalPrice.toLocaleString()}₫</span>
        </div>
        <Button 
          className="w-full" 
          onClick={() => {
            if (!isSignedIn) {
              setShowLoginPopup(true)
            } else {
              router.push("/order")
            }
          }}
          disabled={hasOutOfStockItems}
        >
          {hasOutOfStockItems ? 'Không thể thanh toán (Hết hàng)' : 'Thanh toán'}
        </Button>
      </CardFooter>
      
      {/* Login Required Popup */}
      <LoginRequiredPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Đăng nhập để thanh toán"
        message="Bạn cần đăng nhập để tiếp tục thanh toán giỏ hàng."
      />
    </Card>
  )
}
