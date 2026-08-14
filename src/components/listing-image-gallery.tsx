"use client";

import { useState, useEffect } from "react";
import type { ListingImage } from "@/lib/supabase/types";

interface ListingImageGalleryProps {
  images: ListingImage[];
  alt: string;
}

export function ListingImageGallery({ images, alt }: ListingImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showModal) return;
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, images.length]);

  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
        <div className="flex h-[420px] w-full items-center justify-center text-slate-400">
          No photos yet
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <>
      {/* Main image */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 cursor-pointer flex items-center justify-center" onClick={() => setShowModal(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.url}
          alt={alt}
          className="h-[300px] w-full object-contain hover:brightness-95 transition-all sm:h-[420px]"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((image, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.url}
              alt={alt}
              onClick={() => setSelectedIndex(idx)}
              className={`h-20 w-full rounded-xl object-cover cursor-pointer transition-all ${
                idx === selectedIndex
                  ? "ring-2 ring-orange-500"
                  : "hover:brightness-90"
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close gallery"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-sm font-semibold bg-black bg-opacity-50 px-3 py-1 rounded">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Main image */}
          <div className="flex items-center justify-center max-w-4xl max-h-[80vh] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[selectedIndex].url}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>

          {/* Left arrow */}
          {images.length > 1 && (
            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Previous image"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {images.length > 1 && (
            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Next image"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Backdrop click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setShowModal(false)}
          />
        </div>
      )}
    </>
  );
}
