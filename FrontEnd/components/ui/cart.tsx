// "use client"

// import * as React from "react"
// import Image from "next/image"
// import { Button } from "./button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
// import { useCart } from "../../contexts/cart-context"
// import { useRouter } from "next/navigation"
// import { getProductImageUrl } from "../../lib/utils";

// export function Cart() {
//   const { items, removeItem, updateQuantity, total } = useCart()
//   const router = useRouter()

//   if (items.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Giỏ hàng của bạn</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-center text-muted-foreground">
//             Giỏ hàng của bạn đang trống
//           </p>
//         </CardContent>
//       </Card>
//     )
//   }

//   React.useEffect(() => {
//     console.log('Cart items:', items);
//   }, [items]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Giỏ hàng của bạn</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="max-h-[400px] overflow-y-auto pr-2">
//           <div className="space-y-4">
//             {items.map((item) => (
//               <div key={item.id} className="flex items-center gap-4">
//                 <div className="relative h-20 w-20">
//                   <Image
//                     src={getProductImageUrl(item)}
//                     alt={item.name || "Ảnh sản phẩm"}
//                     fill
//                     className="object-cover rounded-md"
//                     onError={(e) => {
//                       const img = e.target as HTMLImageElement;
//                       if (!img.src.includes("default-avatar.png")) {
//                         img.src = "/default-avatar.png";
//                       }
//                     }}
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-medium">{item.name}</h3>
//                   <p className="text-sm text-muted-foreground">
//                     {item.price ? `${item.price.toLocaleString()}₫` : "Không rõ giá"}
//                   </p>

//                   {item.metadata?.color && (
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="text-sm text-gray-500">Màu:</span>
//                       <span
//                         className="inline-block w-4 h-4 rounded-full border"
//                         style={{ backgroundColor: item.metadata.color }}
//                       />
//                     </div>
//                   )}

//                   <div className="flex items-center gap-2 mt-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
//                     >
//                       -
//                     </Button>
//                     <span className="w-8 text-center">{item.quantity}</span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                     >
//                       +
//                     </Button>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => removeItem(item.id, item.metadata)}
//                 >
//                   Xóa
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//       <CardFooter className="flex flex-col gap-4">
//         <div className="flex justify-between w-full text-lg font-medium">
//           <span>Tổng cộng:</span>
//           <span>{total.toLocaleString()}₫</span>
//         </div>
//         <Button className="w-full" onClick={() => router.push("/order")}>
//           Thanh toán
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }

"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { useCart } from "../../contexts/cart-context"
import { useRouter } from "next/navigation"
import { getProductImageUrl } from "../../lib/utils"

export function Cart() {
  const { items, removeItem, updateQuantity } = useCart()
  const router = useRouter()

  const [calculatedPrices, setCalculatedPrices] = React.useState<{ [id: string]: number }>({})

  React.useEffect(() => {
    async function fetchPrices() {
      const result: { [id: string]: number } = {}

      await Promise.all(items.map(async (item) => {
        const metadata = item.metadata as {
          weight?: number
          wage?: number
          goldAge?: string
        } || {}

        const { weight, wage = 0, goldAge } = metadata

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
    }

    if (items.length > 0) {
      fetchPrices()
    }
  }, [items])

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
    return sum + (price * (item?.quantity || 1))
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giỏ hàng của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto pr-2">
          <div className="space-y-4">
            {items.map((item) => (
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
                  <p className="text-sm text-muted-foreground">
                    {calculatedPrices[item.id] !== undefined
                      ? `${calculatedPrices[item.id].toLocaleString()}₫`
                      : "Đang tính giá..."}
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
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between w-full text-lg font-medium">
          <span>Tổng cộng:</span>
          <span>{totalPrice.toLocaleString()}₫</span>
        </div>
        <Button className="w-full" onClick={() => router.push("/order")}>
          Thanh toán
        </Button>
      </CardFooter>
    </Card>
  )
}
