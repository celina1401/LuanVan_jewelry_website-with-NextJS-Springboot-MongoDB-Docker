import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DELETE /api/cloudinary/delete
// Body: { publicId: string }
export async function DELETE(req: Request) {
  try {
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
    const apiKey = process.env.CLOUDINARY_API_KEY as string;
    const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Missing Cloudinary credentials" }, { status: 500 });
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`;
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const url = `${endpoint}?public_ids[]=${encodeURIComponent(publicId)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Cloudinary delete failed: ${text}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}


