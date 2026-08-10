"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PremiumAd {
  id: string;
  title: string;
  image: string;
  link: string;
  description?: string;
}

const SAMPLE_ADS: PremiumAd[] = [
  {
    id: "1",
    title: "Premium Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    link: "/c/electronics",
    description: "Latest gadgets and devices",
  },
  {
    id: "2",
    title: "Fashion Collections",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    link: "/c/fashion",
    description: "Trendy clothing & accessories",
  },
  {
    id: "3",
    title: "Real Estate",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    link: "/c/real-estate",
    description: "Properties in prime locations",
  },
  {
    id: "4",
    title: "Home & Living",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
    link: "/c/home-living",
    description: "Furniture & home decor",
  },
  {
    id: "5",
    title: "Vehicles",
    image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?auto=format&fit=crop&w=800&q=80",
    link: "/c/vehicles",
    description: "Cars, bikes & vehicles",
  },
  {
    id: "6",
    title: "Jobs & Services",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    link: "/c/jobs",
    description: "Career opportunities",
  },
];

export function PremiumAdsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SAMPLE_ADS.length) % SAMPLE_ADS.length);
    setIsAutoPlay(false);
  };

  return (
    <div
      className="relative w-full h-full min-h-[220px] sm:min-h-[300px] overflow-hidden rounded-lg bg-slate-200"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {SAMPLE_ADS.map((ad, index) => (
          <Link
            key={ad.id}
            href={ad.link}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover"
                loading={index === currentIndex ? "eager" : "lazy"}
              />
              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold">{ad.title}</h3>
                {ad.description && (
                  <p className="text-sm text-white/90">{ad.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-2 transition hover:bg-white/50"
        aria-label="Previous ad"
      >
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-2 transition hover:bg-white/50"
        aria-label="Next ad"
      >
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SAMPLE_ADS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* "Premium Ad" Badge */}
      <div className="absolute top-3 right-3 z-10 rounded bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
        ⭐ PREMIUM AD
      </div>
    </div>
  );
}
