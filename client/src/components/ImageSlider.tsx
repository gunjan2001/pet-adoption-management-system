// src/components/ImageSlider.tsx
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
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

        {/*
          KEY FIX: The aspect-ratio must live on a plain <div>, NOT on the
          <Swiper> component. Swiper renders its own wrapper divs internally
          and doesn't propagate className-based aspect-ratio to them, which
          caused the slide to expand to full viewport height on mobile.

          The outer div establishes a square box via padding-bottom trick
          (100% = width). The inner absolute div fills it completely.
          Swiper + its slides are forced to 100% width/height via CSS below.
        */}
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            <Swiper
              modules={[Navigation, Pagination, Thumbs, Keyboard, A11y]}
              touchStartPreventDefault={false}
              touchReleaseOnEdges
              navigation={{
                prevEl: ".swiper-btn-prev",
                nextEl: ".swiper-btn-next",
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              keyboard={{ enabled: true, onlyInViewport: true }}
              a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
              loop={images.length > 1}
              className="image-slider-swiper w-full h-full bg-gray-50"
            >
              {images.map((image, i) => (
                <SwiperSlide key={image.id} className="image-slider-slide">
                  <img
                    src={image.url ?? ""}
                    alt={`${alt} — image ${i + 1}`}
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}

              {/* Prev button */}
              <button
                className="swiper-btn-prev absolute left-3 top-1/2 -translate-y-1/2 z-10
                           w-10 h-10 rounded-full bg-white/90 hover:bg-white
                           flex items-center justify-center shadow-lg
                           transition-all hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Next button */}
              <button
                className="swiper-btn-next absolute right-3 top-1/2 -translate-y-1/2 z-10
                           w-10 h-10 rounded-full bg-white/90 hover:bg-white
                           flex items-center justify-center shadow-lg
                           transition-all hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </Swiper>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────────── */}
      <div className="image-slider-thumbs">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView="auto"
          spaceBetween={8}
          watchSlidesProgress
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
        /* Force Swiper's internal wrapper divs to fill the container.
           Without this, .swiper-wrapper and .swiper-slide default to
           auto height and blow past the aspect-ratio box on mobile. */
        .image-slider-swiper,
        .image-slider-swiper .swiper-wrapper,
        .image-slider-slide {
          height: 100% !important;
        }

        /* Amber pill-shaped active dot */
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