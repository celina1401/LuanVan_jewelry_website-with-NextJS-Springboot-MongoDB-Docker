import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'gold-history.json');

export async function POST(req: NextRequest) {
  try {
    const { price, timestamp } = await req.json();
    if (typeof price !== 'number' || !timestamp) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    let history = [];
    try {
      const file = await fs.readFile(DATA_FILE, 'utf-8');
      history = JSON.parse(file);
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
    history.push({ price, timestamp });
    await fs.writeFile(DATA_FILE, JSON.stringify(history, null, 2), 'utf-8');
    return NextResponse.json({ success: true, history });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 