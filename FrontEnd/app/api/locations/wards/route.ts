import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

function getDataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), 'data')
}

export async function GET() {
  try {
    // Prefer DATA_DIR/ward.json; fallback to public/ward.json
    const dataDir = getDataDir()
    const dataPaths = [
      path.join(dataDir, 'ward.json'),
      path.join(process.cwd(), 'public', 'ward.json'),
    ]

    for (const p of dataPaths) {
      try {
        const file = await fs.readFile(p, 'utf-8')
        const obj = JSON.parse(file)
        return NextResponse.json(obj)
      } catch {}
    }
    return NextResponse.json({}, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


