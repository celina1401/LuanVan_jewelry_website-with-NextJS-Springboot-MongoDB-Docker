import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch('https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10');
    const text = await res.text();
    const xml = await parseStringPromise(text);
    // Duyệt xml để lấy tỷ giá USD
    const exrates = xml.ExrateList.Exrate;
    let rate = null;
    for (const ex of exrates) {
      if (ex.$.CurrencyCode === 'USD') {
        rate = parseFloat(ex.$.Sell.replace(/,/g, ''));
        break;
      }
    }
    if (rate) {
      return NextResponse.json({ rate });
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 