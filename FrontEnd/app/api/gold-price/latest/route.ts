import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getDataFilePath() {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  return path.join(dataDir, 'gold-history.json');
}

export async function GET(req: NextRequest) {
  try {
    // Đọc giá vàng mới nhất từ file json (ưu tiên DATA_DIR; fallback public)
    let history: any[] = [];
    try {
      const file = await fs.readFile(getDataFilePath(), 'utf-8');
      history = JSON.parse(file);
    } catch {
      try {
        const publicFile = await fs.readFile(path.join(process.cwd(), 'public', 'gold-history.json'), 'utf-8');
        history = JSON.parse(publicFile);
      } catch {
        history = [];
      }
    }
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
    let exchangeRate = 26536; // Tỷ giá mặc định dự phòng
    try {
      const vcbRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vcb-rate`);
      if (vcbRes.ok) {
        const vcbData = await vcbRes.json();
        if (vcbData.rate) {
          exchangeRate = vcbData.rate;
          console.log('[API] Lấy được tỷ giá Vietcombank:', exchangeRate);
        } else {
          console.log('[API] Vietcombank không trả về tỷ giá, dùng mặc định:', exchangeRate);
        }
      } else {
        console.log('[API] Lỗi response Vietcombank, dùng mặc định:', exchangeRate);
      }
    } catch (e) {
      console.log('[API] Không lấy được tỷ giá Vietcombank, dùng mặc định:', exchangeRate);
    }
    
    // Tính toán giá vàng
    // 1 oz = 31.1035 gram
    // 1 chỉ = 3.75 gram
    const pricePerGramUSD = latest / 31.1035;
    const pricePerGramVND = pricePerGramUSD * exchangeRate * ratio;
    const pricePerChiVND = pricePerGramVND * 3.75;
    
    // Không áp dụng VAT (theo yêu cầu của user)
    const vatAndFees = 1; // Không có VAT
    const finalPricePerChi = pricePerChiVND * vatAndFees;
    
    console.log('[API] Giá vàng USD/oz:', latest);
    console.log('[API] Tỷ giá USD/VND:', exchangeRate);
    console.log('[API] Tuổi vàng:', age, 'Hệ số:', ratio);
    console.log('[API] Giá vàng USD/gram:', pricePerGramUSD.toFixed(4));
    console.log('[API] Giá vàng VND/gram:', Math.round(pricePerGramVND));
    console.log('[API] Giá vàng VND/chỉ:', Math.round(finalPricePerChi));
    
    return NextResponse.json({ 
      pricePerGram: Math.round(pricePerGramVND), 
      pricePerChi: Math.round(finalPricePerChi),
      rawPriceUSD: latest,
      exchangeRate: exchangeRate,
      ratio: ratio,
      vatAndFees: vatAndFees
    });
  } catch (error) {
    console.error('[API] Lỗi:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 