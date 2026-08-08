"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function BrandingUploader({
  userId,
  folder,
  fieldName,
  initialUrl,
  label,
  aspectClassName,
}: {
  userId: string;
  folder: "profile/logo" | "profile/cover";
  fieldName: string;
  initialUrl: string | null;
  label: string;
  aspectClassName: string;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Photo must be under 5 MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    try {
      const path = `${userId}/${folder}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <input type="hidden" name={fieldName} value={url ?? ""} />

      <label
        className={`flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-orange-300 ${aspectClassName}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-sm font-semibold text-slate-700">
            {isUploading ? "Uploading..." : "Click to upload"}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {url && (
        <button
          type="button"
          onClick={() => setUrl(null)}
          className="text-xs font-semibold text-slate-500 hover:text-red-600"
        >
          Remove
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
