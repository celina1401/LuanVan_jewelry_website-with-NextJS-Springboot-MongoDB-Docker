import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'gold-history.json');

export async function GET(req: NextRequest) {
  try {
    // Đọc giá vàng mới nhất từ file json
    const file = await fs.readFile(DATA_FILE, 'utf-8');
    const history = JSON.parse(file);
    const latest = Array.isArray(history) && history.length > 0 ? history[history.length - 1].price : null;
    if (!latest) return NextResponse.json({ error: 'No gold price' }, { status: 404 });

    // Hệ số quy đổi các tuổi vàng
    const goldRatios: Record<string, number> = {
      '9999': 0.9999, '999': 0.999, '99': 0.99, '24k': 1.0, '23k': 0.958,
      '17k': 0.708, '16k': 0.666, '15k': 0.625, '10k': 0.416, '18k': 0.75
    };

    // Lấy tuổi vàng từ query (?age=18k)
    const { searchParams } = new URL(req.url);
    const age = (searchParams.get('age') || '').toLowerCase();
    const ratio = goldRatios[age] || 1.0;

    // Lấy tỷ giá USD/VND từ Vietcombank
    let exchangeRate = 25000;
    try {
      const vcbRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vcb-rate`);
      const vcbData = await vcbRes.json();
      if (vcbData.rate) exchangeRate = vcbData.rate;
    } catch (e) {
      console.log('[API] Không lấy được tỷ giá Vietcombank, dùng mặc định:', exchangeRate);
    }
    console.log('[API] Tỷ giá USD/VND sử dụng:', exchangeRate);
    const pricePerGram = (latest / 31.1035) * exchangeRate * ratio;
    const pricePerChi = pricePerGram * 3.75;
    console.log('[API] age:', age, 'ratio:', ratio, 'pricePerGram:', pricePerGram, 'pricePerChi:', pricePerChi);
    return NextResponse.json({ pricePerGram: Math.round(pricePerGram), pricePerChi: Math.round(pricePerChi) });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 