"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import DOCUMENT_SVG from "./DOCUMENT_SVG";
import { useAuth } from "@/app/context/AuthContext";

interface BoundingBoxProps {
  onUploadSuccess?: (doc: any) => void;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({ onUploadSuccess }) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload document. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group p-2 inline-block w-full max-w-xl">
      {/* Top-Left Crosshair */}
      <div className="transition duration-200 absolute -top-1.5 group-hover:-translate-x-2 group-hover:-translate-y-2 left-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Top-Right Crosshair */}
      <div className="transition duration-200 absolute -top-1.5 right-1 group-hover:-translate-y-2 group-hover:translate-x-2 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Bottom-Left Crosshair */}
      <div className="transition duration-200 group-hover:translate-y-2 group-hover:-translate-x-2 absolute -bottom-1.5 left-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Bottom-Right Crosshair */}
      <div className="transition duration-200 group-hover:translate-y-2 group-hover:translate-x-2 absolute -bottom-1.5 right-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      <div className="relative overflow-hidden px-8 pt-8 pb-6 border-dashed border border-zinc-300 group bg-white text-zinc-900 font-sans">
        <div className="absolute scale-60 -right-8 group-hover:-translate-x-1 transition duration-150">
          <DOCUMENT_SVG classname="group-hover:skew-y-0" />
        </div>
        <div className="absolute scale-60 top-13 -right-1 group-hover:-translate-x-4 transition duration-150">
          <DOCUMENT_SVG classname="group-hover:skew-y-0" />
        </div>

        {/* Content Area */}
        <div className="space-y-1 pr-24">
          <div className="flex items-center">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Start Signing with <span className="text-fuchsia-700">Docsy.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-zinc-600 font-normal">
            Upload your document to begin placing your secure signature.
          </p>
        </div>

        {/* Action Button & Input */}
        <div className="mt-6 flex flex-col items-start gap-3">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleButtonClick}
            disabled={uploading}
            className="group cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase border border-zinc-200 font-semibold rounded bg-zinc-50 text-zinc-700 transition-all duration-200 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Document"}
            <Upload className="w-3.5 h-3.5 font-semibold" />
          </button>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoundingBox;
