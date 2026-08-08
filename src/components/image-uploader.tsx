"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadedImage = { path: string; url: string };

const MAX_IMAGES = 8;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function ImageUploader({ userId }: { userId: string }) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) {
      setError(`You can upload up to ${MAX_IMAGES} photos.`);
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          setError("Each photo must be under 5 MB.");
          continue;
        }

        const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, file);

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        setImages((prev) => [...prev, { path, url: data.publicUrl }]);
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function removeImage(path: string) {
    const supabase = createClient();
    setImages((prev) => prev.filter((image) => image.path !== path));
    await supabase.storage.from("listing-images").remove([path]);
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-orange-300">
        <span className="text-sm font-semibold text-slate-700">
          {isUploading ? "Uploading..." : "Click to add photos"}
        </span>
        <span className="mt-1 text-xs text-slate-500">Up to {MAX_IMAGES} photos, 5 MB each</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={isUploading || images.length >= MAX_IMAGES}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.path} className="group relative overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="Listing" className="h-24 w-full object-cover" />
              <input type="hidden" name="imageUrls" value={image.url} />
              <button
                type="button"
                onClick={() => removeImage(image.path)}
                className="absolute right-1 top-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
