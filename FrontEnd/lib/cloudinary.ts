export type CloudinarySignResponse = {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder?: string;
};

export async function getCloudinarySignature(folder?: string): Promise<CloudinarySignResponse> {
  const res = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error("Failed to get Cloudinary signature");
  return res.json();
}

export async function uploadToCloudinary(file: File, options?: { folder?: string }) {
  const { folder } = options || {};
  const { timestamp, signature, cloudName, apiKey, folder: signedFolder } = await getCloudinarySignature(folder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  if (signedFolder) formData.append("folder", signedFolder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const res = await fetch(uploadUrl, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to upload to Cloudinary");
  return res.json() as Promise<{
    secure_url: string;
    url: string;
    public_id: string;
    resource_type: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
  }>;
}


