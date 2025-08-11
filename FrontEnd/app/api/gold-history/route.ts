import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getDataFilePath() {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  return path.join(dataDir, 'gold-history.json');
}

async function ensureDirExists(filePath: string) {
  const dir = path.dirname(filePath);
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

export async function GET() {
  try {
    const DATA_FILE = getDataFilePath();
    try {
      const file = await fs.readFile(DATA_FILE, 'utf-8');
      const history = JSON.parse(file);
      return NextResponse.json(Array.isArray(history) ? history : []);
    } catch {
      return NextResponse.json([]);
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { price, timestamp } = await req.json();
    if (typeof price !== 'number' || !timestamp) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    const DATA_FILE = getDataFilePath();
    await ensureDirExists(DATA_FILE);
    let history = [] as any[];
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