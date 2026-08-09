"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UploadedResume = { path: string; name: string };

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export function ResumeUploader({ userId, listingId }: { userId: string; listingId: string }) {
  const [resume, setResume] = useState<UploadedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError("Only PDF, .doc, and .docx files are allowed.");
        return;
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_BYTES) {
      setError("Resume must be under 5 MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      const path = `${userId}/${listingId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      setResume({ path, name: file.name });
    } finally {
      setIsUploading(false);
    }
  }

  async function removeResume(path: string) {
    const supabase = createClient();
    setResume(null);
    await supabase.storage.from("resumes").remove([path]);
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-orange-300">
        <span className="text-sm font-semibold text-slate-700">
          {isUploading ? "Uploading..." : resume ? "Change resume" : "Click to upload resume"}
        </span>
        <span className="mt-1 text-xs text-slate-500">PDF, .doc, or .docx — max 5 MB</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {resume && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm">
            <p className="font-semibold text-slate-700">📄 {resume.name}</p>
          </div>
          <button
            type="button"
            onClick={() => removeResume(resume.path)}
            className="text-xs font-bold text-red-600 hover:text-red-700"
          >
            Remove
          </button>
          <input type="hidden" name="resumePath" value={resume.path} />
        </div>
      )}
    </div>
  );
}
