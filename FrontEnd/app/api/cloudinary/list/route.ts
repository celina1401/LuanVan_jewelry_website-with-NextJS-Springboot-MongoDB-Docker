import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/cloudinary/list?folder=slider&max=20
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder") || process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
    const max = Number(url.searchParams.get("max") || 30);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
    const apiKey = process.env.CLOUDINARY_API_KEY as string;
    const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Missing Cloudinary credentials" }, { status: 500 });
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    // Try Search API (POST)
    const searchEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
    const searchBody = {
      expression: `folder:${folder} AND resource_type:image`,
      max_results: Math.min(max, 100),
      sort_by: [{ created_at: "desc" }],
    };
    const searchRes = await fetch(searchEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
      cache: "no-store",
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      return NextResponse.json({ resources: data.resources || [] });
    }

    // Fallback: Admin API list resources with prefix (GET)
    const listEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(
      folder + "/"
    )}&max_results=${Math.min(max, 100)}`;
    const listRes = await fetch(listEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    if (listRes.ok) {
      const data = await listRes.json();
      return NextResponse.json({ resources: data.resources || [] });
    }

    const searchText = await searchRes.text().catch(() => "");
    const listText = await listRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Cloudinary list failed. search:${searchRes.status} ${searchText} | list:${listRes.status} ${listText}` },
      { status: 500 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Failed to list resources" }, { status: 500 });
  }
}


