"use client";

import { useState } from "react";

type Props = {
  listingId: string;
  listingTitle: string;
  listingImage?: string;
};

export function ShareListingButton({ listingId, listingTitle, listingImage }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const listingUrl = `${typeof window !== "undefined" ? window.location.origin : "https://haatnepal.com"}/listing/${listingId}`;
  const shareText = `Check out: ${listingTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: "📋",
      action: handleCopyLink,
      color: "hover:bg-slate-100",
    },
    {
      name: "WhatsApp",
      icon: "💬",
      action: () => {
        const text = encodeURIComponent(`${shareText}\n\n${listingUrl}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
      color: "hover:bg-green-50",
    },
    {
      name: "Facebook",
      icon: "f",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
      color: "hover:bg-blue-50",
    },
    {
      name: "Twitter",
      icon: "𝕏",
      action: () => {
        const text = encodeURIComponent(shareText);
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(listingUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
      color: "hover:bg-slate-100",
    },
    {
      name: "Email",
      icon: "✉️",
      action: () => {
        const subject = encodeURIComponent(shareText);
        const body = encodeURIComponent(`${shareText}\n\n${listingUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
      color: "hover:bg-red-50",
    },
    {
      name: "Telegram",
      icon: "✈️",
      action: () => {
        const text = encodeURIComponent(`${shareText}\n\n${listingUrl}`);
        window.open(`https://t.me/share/url?url=${text}`, "_blank");
      },
      color: "hover:bg-cyan-50",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-orange-600"
        type="button"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM12.935 13H12a8 8 0 00-8 8v2h16v-2a8 8 0 00-8-8h-.065z" />
          <path d="M18 9a1 1 0 100-2 1 1 0 000 2z" />
          <path d="M14 9a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Share Listing</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">{listingTitle}</p>

            {/* Listing Preview */}
            {listingImage && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={listingImage}
                  alt={listingTitle}
                  className="h-32 w-full object-cover"
                />
              </div>
            )}

            {/* Share Options Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    if (option.name !== "Copy Link") {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 rounded-lg px-3 py-4 transition ${option.color}`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-xs font-medium text-slate-700">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Copy Link Section */}
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <label className="text-xs font-semibold text-slate-700">
                Direct Link
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={listingUrl}
                  readOnly
                  className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600"
                />
                <button
                  onClick={handleCopyLink}
                  className={`rounded px-3 py-2 text-xs font-semibold transition ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 mb-2">Share QR Code</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(listingUrl)}`}
                alt="QR Code"
                className="mx-auto h-32 w-32 rounded-lg border border-slate-200 p-2"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
