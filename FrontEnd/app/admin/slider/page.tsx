"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
};

export default function SliderAdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const folder = "slider";

  const load = async () => {
    const res = await fetch(`/api/cloudinary/list?folder=${folder}&max=50`, { cache: "no-store" });
    const data = await res.json();
    setResources(
      (data.resources || []).map((r: any) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        width: r.width,
        height: r.height,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async () => {
    try {
      if (files.length === 0) return;
      toast.info("Đang tải ảnh slider lên Cloudinary...");
      for (const f of files) {
        await uploadToCloudinary(f, { folder });
      }
      toast.success("Upload slider thành công");
      window.location.reload();
      setFiles([]);
      await load();
    } catch (e) {
      toast.error("Upload slider thất bại");
    }
  };

  const onDelete = async (publicId: string) => {
    try {
      const res = await fetch(`/api/cloudinary/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã xóa ảnh slider");
      await load();
    } catch (e) {
      toast.error("Xóa ảnh slider thất bại");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý ảnh Slider</h1>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="border p-2 rounded"
        />
        <button onClick={onUpload} className="px-4 py-2 bg-rose-500 text-white rounded">
          Tải lên
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {resources.map((r) => (
          <div key={r.public_id} className="border rounded overflow-hidden relative group">
            <Image src={r.secure_url} alt={r.public_id} width={400} height={250} className="object-cover w-full h-44" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <a href={r.secure_url} target="_blank" className="px-3 py-1 bg-white rounded text-sm">
                Xem
              </a>
              <button onClick={() => onDelete(r.public_id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


