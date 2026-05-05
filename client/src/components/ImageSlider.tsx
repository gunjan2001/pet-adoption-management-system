// src/components/ImageSlider.tsx
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Core styles — always required
import "swiper/css";
// Module styles
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface ImageSliderProps {
  images: { id: number; url: string | null }[];
  alt: string;
}

export default function ImageSlider({ images, alt }: ImageSliderProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-3xl bg-amber-50 flex items-center justify-center border border-amber-100">
        <span className="text-6xl">🐾</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
        <img
          src={images[0]?.url ?? ""}
          alt={alt}
          draggable={false}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // ── Multi-image Swiper ────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* ── Main slider ─────────────────────────────────────────────────── */}
      <div className="image-slider-main rounded-3xl overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Keyboard, A11y]}
          // Touch / swipe — Swiper handles this natively out of the box
          touchStartPreventDefault={false}   // don't block native scroll intent
          touchReleaseOnEdges               // hand back scroll at the first/last slide
          // Navigation arrows
          navigation={{
            prevEl: ".swiper-btn-prev",
            nextEl: ".swiper-btn-next",
          }}
          // Dot pagination
          pagination={{ clickable: true, dynamicBullets: true }}
          // Thumbnail sync
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          // Keyboard arrow-key support
          keyboard={{ enabled: true, onlyInViewport: true }}
          // Accessibility
          a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
          loop={images.length > 1}
          className="relative aspect-square w-full bg-gray-50"
        >
          {images.map((image, i) => (
            <SwiperSlide key={image.id}>
              <img
                src={image.url ?? ""}
                alt={`${alt} — image ${i + 1}`}
                draggable={false}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}

          {/* Custom nav buttons — styled to match project design system */}
          <button
            className="swiper-btn-prev absolute left-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/90 hover:bg-white
                       flex items-center justify-center shadow-lg
                       transition-all hover:scale-105 active:scale-95
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous image"
          >
            {/* Chevron left */}
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            className="swiper-btn-next absolute right-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/90 hover:bg-white
                       flex items-center justify-center shadow-lg
                       transition-all hover:scale-105 active:scale-95
                       disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next image"
          >
            {/* Chevron right */}
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </Swiper>
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────────── */}
      <div className="image-slider-thumbs">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView="auto"
          spaceBetween={8}
          watchSlidesProgress          // required for thumbs module
          className="!pb-1"
        >
          {images.map((image, i) => (
            <SwiperSlide key={image.id} className="!w-16 cursor-pointer">
              <div className="aspect-square w-16 rounded-xl overflow-hidden border-2 border-transparent transition-all swiper-thumb-slide">
                <img
                  src={image.url ?? ""}
                  alt={`${alt} thumbnail ${i + 1}`}
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Scoped styles ────────────────────────────────────────────────── */}
      <style>{`
        /* Amber dot pagination to match design system */
        .image-slider-main .swiper-pagination-bullet {
          background: #D1D5DB;
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.2s;
        }
        .image-slider-main .swiper-pagination-bullet-active {
          background: #F59E0B;
          width: 24px;
          border-radius: 9999px;
        }

        /* Active thumbnail highlight */
        .image-slider-thumbs .swiper-slide-thumb-active .swiper-thumb-slide {
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px #FDE68A;
          transform: scale(1.05);
        }
        .image-slider-thumbs .swiper-slide:not(.swiper-slide-thumb-active) .swiper-thumb-slide {
          opacity: 0.55;
        }
        .image-slider-thumbs .swiper-slide:not(.swiper-slide-thumb-active):hover .swiper-thumb-slide {
          opacity: 0.85;
          border-color: #FCD34D;
        }
      `}</style>
    </div>
  );
}