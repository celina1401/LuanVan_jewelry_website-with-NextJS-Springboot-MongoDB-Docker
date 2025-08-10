import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

// POST /api/cloudinary/sign
// Body: { folder?: string }
// Response: { timestamp, signature, cloudName, apiKey, folder }
export async function POST(req: Request) {
  try {
    const { folder } = await req.json().catch(() => ({}));

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const defaultFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing Cloudinary environment variables" },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = { timestamp };
    const finalFolder = folder || defaultFolder;
    if (finalFolder) paramsToSign.folder = finalFolder;

    const stringToSign = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + apiSecret)
      .digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      cloudName,
      apiKey,
      folder: finalFolder,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create Cloudinary signature" },
      { status: 500 }
    );
  }
}


