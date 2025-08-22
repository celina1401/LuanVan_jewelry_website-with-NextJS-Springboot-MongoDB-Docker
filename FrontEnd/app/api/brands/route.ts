import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type Brand = { name: string; taxCode?: string };
// Resolve data directory from environment (Docker) or local dev fallback
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'brands.json');

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf8');
  }
}

async function readBrands(): Promise<Brand[]> {
  await ensureDataFile();
  const content = await fs.readFile(dataFilePath, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBrands(brands: Brand[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(brands, null, 2), 'utf8');
}

export async function GET() {
  try {
    const brands = await readBrands();
    return NextResponse.json(brands, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read brands' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string | undefined = body?.name?.trim();
    const taxCode: string | undefined = body?.taxCode?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const brands = await readBrands();
    const normalizedTax = (s?: string) => (s || '').replace(/\s+/g, '').toLowerCase();
    const exists = brands.some(b =>
      b.name.toLowerCase() === name.toLowerCase() ||
      (!!taxCode && normalizedTax(b.taxCode) === normalizedTax(taxCode))
    );
    if (exists) {
      return NextResponse.json({ error: 'Brand already exists' }, { status: 409 });
    }
    const newBrand: Brand = { name, taxCode };
    const next = [...brands, newBrand].sort((a, b) => a.name.localeCompare(b.name));
    await writeBrands(next);
    return NextResponse.json(newBrand, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add brand' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


