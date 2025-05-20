"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Input } from "./input"
import { Button } from "./button"
import { Search } from "lucide-react"

interface GoldPrice {
  id: string
  type: string
  buyPrice: number
  sellPrice: number
  timestamp: string
}

interface GoldPriceHistory {
  id: string
  type: string
  price: number
  timestamp: string
}

// Mock data - In real app, this would come from an API
const goldPriceData = [
  { date: "2024-01", price: 2050 },
  { date: "2024-02", price: 2080 },
  { date: "2024-03", price: 2120 },
  { date: "2024-04", price: 2150 },
  { date: "2024-05", price: 2180 },
  { date: "2024-06", price: 2200 },
]

const goldTypes = [
  { type: "SJC 9999", buy: 2200, sell: 2220 },
  { type: "SJC 999", buy: 2190, sell: 2210 },
  { type: "SJC 980", buy: 2180, sell: 2200 },
  { type: "SJC 950", buy: 2170, sell: 2190 },
  { type: "SJC 900", buy: 2160, sell: 2180 },
  { type: "SJC 750", buy: 2150, sell: 2170 },
]

const currentPrice = goldPriceData[goldPriceData.length - 1].price
const priceChange = currentPrice - goldPriceData[goldPriceData.length - 2].price
const priceChangePercentage = ((priceChange / goldPriceData[goldPriceData.length - 2].price) * 100).toFixed(2)

export function GoldPriceChart() {
  const [currentPrices, setCurrentPrices] = React.useState<GoldPrice[]>([])
  const [priceHistory, setPriceHistory] = React.useState<GoldPriceHistory[]>([])
  const [statistics, setStatistics] = React.useState<any>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string>("")

  // Update timestamp when component mounts
  React.useEffect(() => {
    setLastUpdated(new Date().toLocaleString())
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gold Price Chart</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${currentPrice}</span>
              <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
                {priceChange >= 0 ? "+" : ""}{priceChange} ({priceChangePercentage}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goldPriceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short' })
                  }}
                />
                <YAxis 
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long'
                    })
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={{ fill: "#FFD700", strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: "#FFD700" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">24h High</p>
              <p className="text-lg font-semibold">${currentPrice + 20}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">24h Low</p>
              <p className="text-lg font-semibold">${currentPrice - 20}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gold Price Table</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by type..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Buy</TableHead>
                  <TableHead className="text-right">Sell</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goldTypes.map((gold) => (
                  <TableRow key={gold.type}>
                    <TableCell className="font-medium">{gold.type}</TableCell>
                    <TableCell className="text-right">${gold.buy}</TableCell>
                    <TableCell className="text-right">${gold.sell}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Last updated: {lastUpdated}</p>
            <p className="mt-1">Prices are in USD per ounce</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 