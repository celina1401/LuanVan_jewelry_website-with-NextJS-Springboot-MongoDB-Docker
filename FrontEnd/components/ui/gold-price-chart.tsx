"use client"

import * as React from "react"
import { useState } from 'react';

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
const GOLD_API_KEY = "goldapi-758mlsmdmwtv5i-io"; // <-- Điền API Key tại đây
// API dự phòng:

// goldapi-5p9h9smdppd1qi-io         - Vicao



const GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD";
// const GOLD_API_KEY = "YfPgzfA7EvMU4Y0X6UdiwEzWxR9mQ5kK"; // <-- Điền API Key tại đây
// const GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD";

export function GoldPriceChart() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [goldData, setGoldData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [exchangeRate, setExchangeRate] = React.useState(25000); // Tỷ giá USD/VND mặc định
  const [history, setHistory] = React.useState<Array<{price: number, timestamp: string}>>([]);
  const [filterMode, setFilterMode] = useState<'day' | 'week' | 'month'>('day');

  // Hệ số quy đổi các tuổi vàng
  const goldRatios = [
    { label: '9999', ratio: 0.9999 },
    { label: '999', ratio: 0.999 },
    { label: '99', ratio: 0.99 },
    { label: '24k', ratio: 1.0 },
    { label: '23k', ratio: 0.958 },
    { label: '17k', ratio: 0.708 },
    { label: '16k', ratio: 0.666 },
    { label: '15k', ratio: 0.625 },
    { label: '10k', ratio: 0.416 },
  ];

  // Hàm tính giá vàng theo các đơn vị
  function goldPriceInVND(priceUSD: number, exchangeRate: number, purity: number) {
    const perGram = (priceUSD / 31.1035) * exchangeRate * purity;
    const perChi = perGram * 3.75 + 200000;
    const perLuong = perChi * 10;
    return {
      gram: Math.round(perGram),
      chi: Math.round(perChi),
      luong: Math.round(perLuong),
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
        const results = await Promise.all(
          goldRatios.map(async (g) => {
            const data = await fetchGoldPriceByAge(g.label);
            return {
              ...g,
              pricePerChi: data?.pricePerChi || 0,
              pricePerGram: data?.pricePerGram || 0,
              pricePerLuong: (data?.pricePerChi || 0) * 10,
            };
          })
        );
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
        const res = await fetch('/gold-history.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setHistory(data);
        }
      } catch {}
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
    filteredHistory = history.filter(h => now - new Date(h.timestamp).getTime() <= 24 * 60 * 60 * 1000);
  } else if (filterMode === 'week') {
    filteredHistory = history.filter(h => now - new Date(h.timestamp).getTime() <= 7 * 24 * 60 * 60 * 1000);
  } else if (filterMode === 'month') {
    filteredHistory = history.filter(h => now - new Date(h.timestamp).getTime() <= 30 * 24 * 60 * 60 * 1000);
  }

  // Nếu muốn lọc nhiều loại vàng, cần fetch nhiều endpoint và map thành mảng. Ở đây chỉ có 1 loại XAU/USD.
  const filteredGoldTypes = goldData ? [goldData] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value;
      const time = new Date(label).toLocaleString();
      return (
        <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 rounded-md shadow-md border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm font-semibold">Thời gian: {time}</p>
          <p className="text-sm">Giá: <span className="font-bold text-yellow-500">{price.toLocaleString()} USD</span></p>
        </div>
      );
    }
    return null;
  };
  

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
      {/* Chart */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0">
        <Card className="flex flex-col h-full min-h-0 max-h-[400px] rounded-xl shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">Lịch sử giá vàng (USD/oz)</CardTitle>
            <div className="mt-4 flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg transition font-bold shadow-sm focus:outline-none ${filterMode === 'day' ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-black hover:bg-yellow-100'}`}
                onClick={() => setFilterMode('day')}
              >Theo ngày</button>
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
          <CardContent className="flex-1 h-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleTimeString()} minTickGap={40} />
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
        <Card className="flex flex-col h-full min-h-0 rounded-xl shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="whitespace-nowrap text-zinc-900 dark:text-zinc-100">Bảng giá vàng</CardTitle>
              <div className="flex flex-row items-center gap-4 flex-nowrap">
                <Input
                  placeholder="Tìm theo loại..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-[200px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
                <div className="flex flex-row items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={exchangeRate}
                    readOnly
                    className="w-[120px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="Tỷ giá USD/VND"
                  />
                  <span className="text-xs text-muted-foreground dark:text-zinc-400">Tỷ giá tự động lấy từ Vietcombank.</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col">
               <div className="overflow-y-auto max-h-[400px]">
                 <Table className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-700">
                    <TableHead className="text-left font-semibold py-2 text-zinc-900 dark:text-zinc-100">Tuổi vàng</TableHead>
                    <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100">Tỷ lệ</TableHead>
                    <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100">Giá/gram (VNĐ)</TableHead>
                    <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100">Giá/chỉ (VNĐ)</TableHead>
                    <TableHead className="text-right font-semibold py-2 text-zinc-900 dark:text-zinc-100">Giá/lượng (VNĐ)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5}>Đang tải...</TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={5} className="text-red-500">{error}</TableCell></TableRow>
                  ) : goldData && goldData.length > 0 ? (
                    goldData.filter((g: any) => g.label.toLowerCase().includes(searchTerm.toLowerCase())).map((g: any) => (
                      <TableRow key={g.label}>
                        <TableCell className="font-medium py-2 text-zinc-900 dark:text-zinc-100">{g.label}</TableCell>
                        <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.ratio}</TableCell>
                        <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.pricePerGram.toLocaleString()}</TableCell>
                        <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.pricePerChi.toLocaleString()}</TableCell>
                        <TableCell className="text-right py-2 text-zinc-900 dark:text-zinc-100">{g.pricePerLuong.toLocaleString()}</TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5}>Không có dữ liệu</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
               </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground dark:text-zinc-400">
              <p>Cập nhật lần cuối: {lastUpdated}</p>
              <p className="mt-1">Giá tính theo USD/ounce, tỷ giá: {exchangeRate.toLocaleString()} VND/USD</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}