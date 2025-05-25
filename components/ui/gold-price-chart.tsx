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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Calendar } from "./calendar"


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
  { date: "2023-01", price: 1800, key: "2023-01" },
  { date: "2023-02", price: 1820, key: "2023-02" },
  { date: "2023-03", price: 1850, key: "2023-03" },
  { date: "2023-04", price: 1880, key: "2023-04" },
  { date: "2023-05", price: 1900, key: "2023-05" },
  { date: "2023-06", price: 1930, key: "2023-06" },
  { date: "2023-07", price: 1950, key: "2023-07" },
  { date: "2023-08", price: 1970, key: "2023-08" },
  { date: "2023-09", price: 2000, key: "2023-09" },
  { date: "2023-10", price: 2020, key: "2023-10" },
  { date: "2023-11", price: 2030, key: "2023-11" },
  { date: "2023-12", price: 2040, key: "2023-12" },
  { date: "2024-01", price: 2050, key: "2024-01" },
  { date: "2024-02", price: 2080, key: "2024-02" },
  { date: "2024-03", price: 2120, key: "2024-03" },
  { date: "2024-04", price: 2150, key: "2024-04" },
  { date: "2024-05-01", price: 2180, key: "2024-05-01" },
  { date: "2024-05-02", price: 2185, key: "2024-05-02" },
  { date: "2024-05-03", price: 2188, key: "2024-05-03" },
  { date: "2024-05-04", price: 2185, key: "2024-05-04" },
  { date: "2024-05-05", price: 2190, key: "2024-05-05" },
  { date: "2024-05-06", price: 2192, key: "2024-05-06" },
  { date: "2024-05-07", price: 2195, key: "2024-05-07" },
  { date: "2024-05-08", price: 2193, key: "2024-05-08" },
  { date: "2024-05-09", price: 2198, key: "2024-05-09" },
  { date: "2024-05-10", price: 2200, key: "2024-05-10" },
  { date: "2024-05-11", price: 2203, key: "2024-05-11" },
  { date: "2024-05-12", price: 2201, key: "2024-05-12" },
  { date: "2024-05-13", price: 2205, key: "2024-05-13" },
  { date: "2024-05-14", price: 2207, key: "2024-05-14" },
  { date: "2024-05-15", price: 2210, key: "2024-05-15" },
  { date: "2024-05-16", price: 2212, key: "2024-05-16" },
  { date: "2024-05-17", price: 2215, key: "2024-05-17" },
  { date: "2024-05-18", price: 2213, key: "2024-05-18" },
  { date: "2024-05-19", price: 2217, key: "2024-05-19" },
  { date: "2024-05-20", price: 2220, key: "2024-05-20" },
  { date: "2024-05-21", price: 2223, key: "2024-05-21" },
  { date: "2024-05-22", price: 2221, key: "2024-05-22" },
  { date: "2024-05-23", price: 2225, key: "2024-05-23" },
  { date: "2024-05-24", price: 2228, key: "2024-05-24" },
  { date: "2024-05-25", price: 2230, key: "2024-05-25" },
  { date: "2024-05-26", price: 2228, key: "2024-05-26" },
  { date: "2024-05-27", price: 2232, key: "2024-05-27" },
  { date: "2024-05-28", price: 2235, key: "2024-05-28" },
  { date: "2024-05-29", price: 2233, key: "2024-05-29" },
  { date: "2024-05-30", price: 2238, key: "2024-05-30" },
  { date: "2024-05-31", price: 2240, key: "2024-05-31" },
  { date: "2024-06-01", price: 2242, key: "2024-06-01" },
  { date: "2024-06-02", price: 2245, key: "2024-06-02" },
  { date: "2024-06-03", price: 2248, key: "2024-06-03" },
  { date: "2024-06-04", price: 2246, key: "2024-06-04" },
  { date: "2024-06-05", price: 2250, key: "2024-06-05" },
  { date: "2024-06-06", price: 2253, key: "2024-06-06" },
  { date: "2024-06-07", price: 2255, key: "2024-06-07" },
  { date: "2024-06-08", price: 2257, key: "2024-06-08" },
  { date: "2024-06-09", price: 2260, key: "2024-06-09" },
  { date: "2024-06-10", price: 2263, key: "2024-06-10" },
  { date: "2025-03-01", price: 2320, key: "2025-03-01" },
  { date: "2025-03-02", price: 2325, key: "2025-03-02" },
  { date: "2025-03-03", price: 2330, key: "2025-03-03" },
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
  const [timeRange, setTimeRange] = React.useState("today") // Default to 'Hôm nay' (approx. 24h)
  const [selectedYear, setSelectedYear] = React.useState<string>("") // Default to empty string

  // Get unique years from data
  const getUniqueYears = () => {
    const years = goldPriceData.map(item => new Date(item.date).getFullYear().toString());
    return ["all", ...Array.from(new Set(years))].sort();
  };

  // Filter data based on selected time range and year
  const getFilteredData = () => {
    // Note: Using a fixed date for 'now' to demonstrate filtering with mock daily data.
    // In a real app, use `new Date()`. Adjust this date to match your mock data range.
    const now = new Date('2024-06-10'); // Using the last date in the detailed mock data

    // Set time to midnight for consistent date comparisons
    now.setHours(0, 0, 0, 0);

    const filteredByTimeRange = (() => {
        switch (timeRange) {
            case "today":
                // Filter for data points from the fixed 'today' onwards
                return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate.getTime() === now.getTime();
                });
            case "yesterday": // This option is not in the current Select, but keeping logic just in case
                 // Filter for data points from the fixed 'yesterday'
                 const yesterday = new Date(now);
                 yesterday.setDate(now.getDate() - 1);
                 return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate.getTime() === yesterday.getTime();
                 });
            case "last7d":
                // Filter for data points in the last 7 full days (including the fixed 'today')
                const last7d = new Date(now);
                last7d.setDate(now.getDate() - 6); // Go back 6 days to include today
                return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= last7d;
                });
            case "last30d": // This option is not in the current Select, but keeping logic just in case
                 // Filter for data points in the last 30 full days (including the fixed 'today')
                 const last30d = new Date(now);
                 last30d.setDate(now.getDate() - 29); // Go back 29 days to include today
                 return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= last30d;
                 });
            case "thisMonth":
                // Filter for data points in the calendar month of the fixed 'now' date
                return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                });
            case "lastMonth":
                // Filter for data points in the previous calendar month relative to the fixed 'now' date
                const lastMonth = new Date(now);
                lastMonth.setMonth(now.getMonth() - 1);
                return goldPriceData.filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
                });
            case "all":
                // If timeRange is 'all', filter by selected year
                if (selectedYear !== "all") {
                    return goldPriceData.filter(item => new Date(item.date).getFullYear().toString() === selectedYear);
                }
                return goldPriceData;
            default:
                // Default to last 6 months (approximate based on months relative to the fixed 'now' date)
                const last6Months = new Date(now);
                last6Months.setMonth(now.getMonth() - 6);
                return goldPriceData.filter(item => {
                   const itemDate = new Date(item.date);
                   return itemDate >= last6Months;
                });
        }
    })();

    // Apply year filter ONLY when timeRange is 'all'
    if (timeRange !== 'all' && selectedYear !== 'all') {
      // This case is ignored based on current logic.
      return filteredByTimeRange;
    }

    return filteredByTimeRange;
  };

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
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">24 giờ</SelectItem> {/* Approx 24h */}
                  <SelectItem value="last7d">7 ngày</SelectItem>
                  <SelectItem value="thisMonth">Tháng này</SelectItem>
                  <SelectItem value="lastMonth">Tháng trước</SelectItem>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueYears().map(year => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? "Tất cả năm" : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-2xl font-bold">${currentPrice}</span>
              <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
                {priceChange >= 0 ? "+" : ""}{priceChange} ({priceChangePercentage}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredData()}>
                <CartesianGrid stroke="#666" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#bbb" }}
                  axisLine={{ stroke: "#888" }}
                  tickLine={{ stroke: "#888" }}
                  tickFormatter={(value) => {
                    // Check if the date value includes a day (YYYY-MM-DD)
                    if (value.includes('-') && value.split('-').length === 3) {
                        const [year, month, day] = value.split('-');
                        return `${month}/${day}`; // Format as MM/DD for daily data
                    } else {
                        // Assume YYYY-MM format for monthly data
                        const [year, month] = value.split('-');
                        return `${year}-${month}`; // Keep YYYY-MM format for monthly data
                    }
                  }}
                />
                <YAxis
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: "#bbb" }}
                  axisLine={{ stroke: "#888" }}
                  tickLine={{ stroke: "#888" }}
                />
                <Tooltip
                  contentStyle={{ background: "#333", border: "1px solid #555", color: "#fff", borderRadius: "4px" }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#FFD700" }}
                  formatter={(value) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, stroke, key, index } = props;
                    // Check if this is the last data point
                    if (index === getFilteredData().length - 1) {
                      return (
                        <svg key={key} x={cx - 4} y={cy - 4} width={8} height={8} fill="#FF0000" stroke="#FF0000" strokeWidth={2}>
                          <circle cx={4} cy={4} r={4} />
                        </svg>
                      );
                    }
                    // Default dot for other data points
                    return (
                      <svg key={key} x={cx - 3} y={cy - 3} width={6} height={6} fill="#FFD700" stroke="#FFD700" strokeWidth={2}>
                        <circle cx={3} cy={3} r={3} key={index} />
                      </svg>
                    );
                  }}
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