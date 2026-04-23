// src/components/ImageSlider.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageSliderProps {
  images: { id: number; url: string | null }[];
  alt: string;
}

export default function ImageSlider({ images, alt }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-3xl bg-amber-50 flex items-center justify-center border border-amber-100">
        <span className="text-6xl">🐾</span>
      </div>
    );
  }

  // If only one image, show it without navigation
  if (images.length === 1) {
    return (
      <div className="aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
        <img
          src={images[0]?.url ?? ""}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 group">
        <img
          src={images[currentIndex]?.url ?? ""}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-amber-500 ring-2 ring-amber-200"
                : "border-gray-200 hover:border-amber-300 opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={image.url ?? ""}
              alt={`${alt} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Dots indicator (mobile-friendly alternative) */}
      <div className="flex justify-center gap-2 sm:hidden">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-amber-500 w-6"
                : "bg-gray-300 hover:bg-amber-300"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
