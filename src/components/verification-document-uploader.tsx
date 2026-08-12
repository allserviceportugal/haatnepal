"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadedDocument = { path: string; name: string };

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export function VerificationDocumentUploader({ userId }: { userId: string }) {
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError("Only PDF and image files (JPG, PNG) are allowed.");
        return;
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_BYTES) {
      setError("Document must be under 5 MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("verification-documents").upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      setDocument({ path, name: file.name });
    } finally {
      setIsUploading(false);
    }
  }

  async function removeDocument(path: string) {
    const supabase = createClient();
    setDocument(null);
    await supabase.storage.from("verification-documents").remove([path]);
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-orange-300">
        <span className="text-sm font-semibold text-slate-700">
          {isUploading ? "Uploading..." : document ? "Change document" : "Click to upload registration certificate"}
        </span>
        <span className="mt-1 text-xs text-slate-500">PDF or image (JPG, PNG) — max 5 MB</span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {document && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm">
            <p className="font-semibold text-slate-700">📄 {document.name}</p>
          </div>
          <button
            type="button"
            onClick={() => removeDocument(document.path)}
            className="text-xs font-bold text-red-600 hover:text-red-700"
          >
            Remove
          </button>
          <input type="hidden" name="registrationCertificatePath" value={document.path} />
        </div>
      )}
    </div>
  );
}
