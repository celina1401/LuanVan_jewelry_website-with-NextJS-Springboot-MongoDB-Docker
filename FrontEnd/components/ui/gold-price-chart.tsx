"use client"

import * as React from "react"
import { useState } from 'react';
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Input } from "./input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


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

// Thay thế mock data bằng fetch từ GoldAPI
const GOLD_API_KEY = "goldapi-40qegsmdtz8uim-io"; // <-- Điền API Key tại đây
// API dự phòng:

// goldapi-5p9h9smdppd1qi-io         - Vicao              R
// goldapi-40qegsmdtz23aq-io        - CongTri             R
// goldapi-k15ismdtz65qw-io         - GiaBao              R 
// goldapi-40qegsmdtz8uim-io        - BichTram            R
// goldapi-8raw3zsme5b0qmf-io       - ThaiLe
// goldapi-1cey8cmsme5bmw4g-io      - MinhHao
// goldapi-8raw3zsme5cim88-io       - KKD
// goldapi-grta9sme89c0ge-io        - AnhPhuc1
// goldapi-krl2sme89hruk-io         - AnhPhuc2
// goldapi-5j959sme9ngfoc-io        - BichTram2
// goldapi-6v0i89sme9qwd5c-io       - Lam

const GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD";


export function GoldPriceChart() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [goldData, setGoldData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [exchangeRate, setExchangeRate] = React.useState(25000); // Tỷ giá USD/VND mặc định
  const [history, setHistory] = React.useState<Array<{ price: number, timestamp: string }>>([]);
  const [filterMode, setFilterMode] = useState<'day' | 'week' | 'month'>('day');

  const today = new Date();
  const weekNumber = getWeekNumber(today);
  const formattedToday = formatToday();

  // Hệ số quy đổi các tuổi vàng
  const goldRatios = [
    // { label: '9999', ratio: 0.9999 },
    { label: '999', ratio: 0.999 },
    { label: '99', ratio: 0.99 },
    { label: '24k', ratio: 0.9999 },
    { label: '23k', ratio: 0.958 },
    { label: '17k', ratio: 0.708 },
    { label: '16k', ratio: 0.666 },
    { label: '15k', ratio: 0.625 },
    { label: '14k', ratio: 0.583 },
    { label: '10k', ratio: 0.416 },
  ];

  // Hàm tính giá vàng theo các đơn vị
  function goldPriceInVND(priceUSD: number, exchangeRate: number, purity: number) {
    // Công thức từ hình ảnh:
    // 1. USD/oz → USD/g: priceUSD / 31.1035
    // 2. USD/g → VND/g: (priceUSD / 31.1035) * exchangeRate
    // 3. VND/g → VND/lượng: (priceUSD / 31.1035) * exchangeRate * 37.5
    // 4. Áp dụng hệ số tuổi vàng: * purity
    // 5. Cộng thêm 10% VAT và 3% lợi nhuận
    
    const pricePerGramVND = (priceUSD / 31.1035) * exchangeRate;
    const pricePerLuongVND = pricePerGramVND * 37.5 * purity;
    const pricePerChiVND = pricePerLuongVND / 10;
    
    // Áp dụng VAT (10%) và lợi nhuận (3%)
    const vatAndProfit = 1.03// 3% profit
    const finalPricePerChi = pricePerChiVND * vatAndProfit;
    const finalPricePerLuong = pricePerLuongVND * vatAndProfit;
    
    return {
      chi: Math.round(finalPricePerChi),
      luong: Math.round(finalPricePerLuong),
    };
  }

  // Hàm lấy giá vàng theo tuổi vàng từ API nội bộ
  async function fetchGoldPriceByAge(age: string) {
    try {
      const res = await fetch(`/api/gold-price/latest?age=${age}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  }

  // Lấy giá vàng cho tất cả các loại tuổi vàng từ API
  React.useEffect(() => {
    async function fetchAllGoldPrices() {
      setLoading(true);
      setError(null);
      try {
        // Lấy giá vàng quốc tế từ GoldAPI
        const goldRes = await fetch(GOLD_API_URL, {
          headers: {
            'x-access-token': GOLD_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        if (!goldRes.ok) {
          throw new Error('Không lấy được giá vàng từ GoldAPI');
        }
        
        const goldData = await goldRes.json();
        const internationalPrice = goldData.price; // USD/ounce
        
        // Tính toán giá cho từng loại tuổi vàng
        const results = goldRatios.map((g) => {
          const prices = goldPriceInVND(internationalPrice, exchangeRate, g.ratio);
          return {
            ...g,
            pricePerChi: prices.chi,
            pricePerLuong: prices.luong,
          };
        });
        
        setGoldData(results);
        setLastUpdated(new Date().toLocaleString());
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    fetchAllGoldPrices();
  }, [exchangeRate]);

  // Hàm lấy tỷ giá USD/VND từ Vietcombank
  async function fetchVietcombankUSDRate(): Promise<number | null> {
    try {
      const res = await fetch('/api/vcb-rate');
      if (!res.ok) return null;
      const data = await res.json();
      return data.rate || null;
    } catch {
      return null;
    }
  }

  // Khi load component, tự động lấy tỷ giá Vietcombank và cập nhật mỗi tiếng
  React.useEffect(() => {
    function updateRate() {
      fetchVietcombankUSDRate().then(rate => {
        if (rate) setExchangeRate(rate);
      });
    }
    updateRate(); // Gọi lần đầu
    const interval = setInterval(updateRate, 60 * 60 * 1000); // 1 tiếng
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    async function fetchGoldPrice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(GOLD_API_URL, {
          headers: {
            'x-access-token': GOLD_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Không lấy được giá vàng từ GoldAPI');
        const data = await res.json();
        setGoldData(data);
        setLastUpdated(new Date().toLocaleString());
        // Gửi giá và timestamp lên API để lưu vào file json mỗi 1 tiếng (nếu chưa có bản ghi trong giờ này)
        const now = new Date();
        const currentHour = now.getHours();
        const currentDate = now.toISOString().slice(0, 13); // yyyy-mm-ddThh
        // Kiểm tra history đã có bản ghi trong giờ này chưa
        const hasThisHour = history.some(h => h.timestamp.slice(0, 13) === currentDate);
        if (!hasThisHour) {
          fetch('/api/gold-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: data.price, timestamp: now.toISOString() })
          });
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    fetchGoldPrice();
  }, []);

  // Lấy dữ liệu lịch sử giá vàng từ file json
  React.useEffect(() => {
    async function fetchHistory() {
      try {
        // Ưu tiên đọc từ API để tương thích Docker (ghi file ở /data)
        const res = await fetch('/api/gold-history');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setHistory(data);
        }
      } catch { }
    }
    fetchHistory();
    // Cập nhật mỗi 5s để chart realtime
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Lọc dữ liệu history theo filterMode
  const now = Date.now();
  let filteredHistory = history;
  
  if (filterMode === 'day') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    filteredHistory = history.filter(h => {
      const ts = new Date(h.timestamp).getTime();
      return ts >= startOfDay.getTime() && ts <= endOfDay.getTime();
    });
  } else if (filterMode === 'week') {
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    // Lấy dữ liệu từ 7 ngày trước
    const weekData = history.filter(h => {
      const ts = new Date(h.timestamp).getTime();
      return ts >= oneWeekAgo.getTime();
    });

    // Nhóm theo ngày và lấy điểm dữ liệu mới nhất cho mỗi ngày
    const dailyData = new Map<string, any>();
    weekData.forEach(h => {
      const date = new Date(h.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Giữ lại timestamp mới nhất cho mỗi ngày
      if (!dailyData.has(dayKey) || new Date(h.timestamp) > new Date(dailyData.get(dayKey).timestamp)) {
        dailyData.set(dayKey, h);
      }
    });

    // Chuyển về array và sắp xếp theo thời gian
    filteredHistory = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } else if (filterMode === 'month') {
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    // Lấy dữ liệu từ 30 ngày trước
    const monthData = history.filter(h => {
      const ts = new Date(h.timestamp).getTime();
      return ts >= oneMonthAgo.getTime();
    });

    // Nhóm theo ngày và lấy điểm dữ liệu mới nhất cho mỗi ngày
    const dailyData = new Map<string, any>();
    monthData.forEach(h => {
      const date = new Date(h.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Giữ lại timestamp mới nhất cho mỗi ngày
      if (!dailyData.has(dayKey) || new Date(h.timestamp) > new Date(dailyData.get(dayKey).timestamp)) {
        dailyData.set(dayKey, h);
      }
    });

    // Chuyển về array và sắp xếp theo thời gian
    filteredHistory = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // Debug: Log filtered data
  console.log(`Filter mode: ${filterMode}, Filtered data count: ${filteredHistory.length}`);
  if (filteredHistory.length > 0) {
    console.log('First data point:', filteredHistory[0]);
    console.log('Last data point:', filteredHistory[filteredHistory.length - 1]);
  }

  // Nếu không có dữ liệu sau khi filter, sử dụng dữ liệu gốc (tối đa 50 điểm)
  if (filteredHistory.length === 0 && history.length > 0) {
    console.log('No filtered data, using original data');
    filteredHistory = history.slice(-50); // Lấy 50 điểm dữ liệu gần nhất
  }

  // Nếu muốn lọc nhiều loại vàng, cần fetch nhiều endpoint và map thành mảng. Ở đây chỉ có 1 loại XAU/USD.
  const filteredGoldTypes = goldData ? [goldData] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value;
      const time = new Date(label).toLocaleString();
      return (
        <div className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 p-3 rounded-md shadow-md border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm font-semibold">Thời gian: {time}</p>
          <p className="text-sm">Giá: <span className="font-bold text-yellow-500">{price.toLocaleString()} USD</span></p>
        </div>
      );
    }
    return null;
  };

  function getWeekNumber(date: Date): number {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((+date - +firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((firstJan.getDay() + 1 + days) / 7);
  }

  function formatToday(): string {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  let filterInfoText = "";
  if (filterMode === "day") {
    filterInfoText = `Hôm nay: ${formatToday()}`;
  } else if (filterMode === "week") {
    if (filteredHistory.length > 0) {
      const firstDate = new Date(filteredHistory[0].timestamp);
      const lastDate = new Date(filteredHistory[filteredHistory.length - 1].timestamp);
      filterInfoText = `Tuần từ ${firstDate.toLocaleDateString('vi-VN')} đến ${lastDate.toLocaleDateString('vi-VN')} (${filteredHistory.length} ngày)`;
    } else {
      filterInfoText = `Tuần ${getWeekNumber(today)} năm ${today.getFullYear()}`;
    }
  } else if (filterMode === "month") {
    if (filteredHistory.length > 0) {
      const firstDate = new Date(filteredHistory[0].timestamp);
      const lastDate = new Date(filteredHistory[filteredHistory.length - 1].timestamp);
      filterInfoText = `Tháng từ ${firstDate.toLocaleDateString('vi-VN')} đến ${lastDate.toLocaleDateString('vi-VN')} (${filteredHistory.length} ngày)`;
    } else {
      filterInfoText = `Tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    }
  }


  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
      {/* Chart */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0">
        <Card className="flex flex-col h-full min-h-0 max-h-[600px] rounded-xl shadow bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="mb-2 text-zinc-900 dark:text-zinc-100">Lịch sử giá vàng (USD/oz)</CardTitle>
            <div className="mt-4 flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg transition font-bold shadow-sm focus:outline-none ${filterMode === 'day' ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-black hover:bg-yellow-100'}`}
                onClick={() => setFilterMode('day')}

              >Hôm nay</button>
              <button
                className={`px-4 py-2 rounded-lg transition font-bold shadow-sm focus:outline-none ${filterMode === 'week' ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-black hover:bg-yellow-100'}`}
                onClick={() => setFilterMode('week')}
              >Theo tuần</button>
              <button
                className={`px-4 py-2 rounded-lg transition font-bold shadow-sm focus:outline-none ${filterMode === 'month' ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-black hover:bg-yellow-100'}`}
                onClick={() => setFilterMode('month')}
              >Theo tháng</button>

            </div>

          </CardHeader>
          <div className="ml-6 text-left text-sm text-muted-foreground dark:text-zinc-400">

            {filterInfoText}
          </div>
          <CardContent className="flex-1 h-full p-4">
            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={filteredHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString()} minTickGap={40} /> */}
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (filterMode === "week") {
                      const d = date.getDay(); // 0 = CN, 1 = T2, 2 = T3, 3 = T4, 4 = T5, 5 = T6, 6 = T7
                      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                      return dayNames[d];
                    }
                    if (filterMode === "month") {
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }
                    // Mặc định: theo ngày → hiển thị giờ phút
                    return date.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",

                    });
                  }}
                />


                <YAxis domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="#FFD700" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Bảng giá */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0">
        <Card className="flex flex-col h-full min-h-0 rounded-xl shadow bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="whitespace-nowrap text-zinc-900 dark:text-zinc-100">Bảng giá vàng</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Tìm theo loại..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-[180px] bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={exchangeRate}
                    readOnly
                    className="w-full sm:w-[100px] bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="Tỷ giá USD/VND"
                  />
                  <span className="text-xs text-muted-foreground dark:text-zinc-400 whitespace-normal">
                    Tỷ giá tự động lấy từ Vietcombank
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <Table className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-w-[600px]">
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200 dark:border-zinc-700">
                      <TableHead className="text-left font-semibold py-2 text-zinc-900 dark:text-zinc-100 min-w-[80px]">Tuổi vàng</TableHead>
                      <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100 min-w-[80px]">Tỷ lệ</TableHead>
                      <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100 min-w-[120px]">Giá/chỉ (VNĐ)</TableHead>
                      <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100 min-w-[120px]">Giá/lượng (VNĐ)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-4">Đang tải...</TableCell></TableRow>
                    ) : error ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-4 text-red-500">{error}</TableCell></TableRow>
                    ) : goldData && goldData.length > 0 ? (
                      goldData.filter((g: any) => g.label.toLowerCase().includes(searchTerm.toLowerCase())).map((g: any) => (
                        <TableRow key={g.label} className={g.label === '24k' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                          <TableCell className="font-medium py-2 text-zinc-900 dark:text-zinc-100">{g.label}</TableCell>
                          <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.ratio}</TableCell>
                          <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.pricePerChi.toLocaleString()}</TableCell>
                          <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.pricePerLuong.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-4">Không có dữ liệu</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground dark:text-zinc-400 space-y-1">
              <p className="break-words">Cập nhật lần cuối: {lastUpdated}</p>
              <p className="break-words">Giá tính theo USD/ounce, tỷ giá: {exchangeRate.toLocaleString()} VND/USD</p>
              {/* <p className="break-words">Giá đã bao gồm: 10% VAT + 3% lợi nhuận</p>
              <p className="break-words text-xs">Công thức: (USD/oz ÷ 31.1035) × Tỷ giá × 37.5 × Hệ số tuổi vàng × 1.133</p> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}