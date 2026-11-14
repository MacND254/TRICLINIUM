'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SlideItem {
  id: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

interface HeroSliderProps {
  slides?: SlideItem[];
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 'default-1',
    headline: 'Advanced CCTV Surveillance & Smart Security Systems',
    subheadline: 'Protect your property with ultra-high-definition 4K AI cameras, smart video doorbells, wireless home alarm systems, and 24/7 remote smartphone monitoring across Kenya.',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'Explore Security Products',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Get Free Security Quote',
    secondaryCtaLink: '/contact',
  },
  {
    id: 'default-2',
    headline: 'Smart Home Alarms, Video Doorbells & Door Cams',
    subheadline: 'Triple-path 4G cellular backup, pet-immune motion sensors, loud 115dB solar sirens, and two-way video doorbells that alert you before intruders enter.',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'View Alarm Systems',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Installation Services',
    secondaryCtaLink: '/services',
  },
  {
    id: 'default-3',
    headline: 'Video Intercoms, 360° Nanny Cams & Whole-Home Mesh Wi-Fi',
    subheadline: 'Screen visitors at your gate with 7-inch touch monitors, check on loved ones with smart pan-tilt nanny cameras, and enjoy bufferless 4K CCTV streaming throughout your property.',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1920&q=85',
    primaryCtaText: 'Explore All Systems',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Book Site Assessment',
    secondaryCtaLink: '/contact',
  },
];

export function HeroSlider({ slides }: HeroSliderProps) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const slide = activeSlides[currentIdx];

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.imageUrl}
          alt={slide.headline}
          className="h-full w-full object-cover object-center brightness-50 transition-all duration-700 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-8 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span>Certified Security Integrator · 100% Guaranteed Protection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {slide.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            {slide.subheadline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href={slide.primaryCtaLink}>
              <Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20">
                <span>{slide.primaryCtaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {slide.secondaryCtaText && slide.secondaryCtaLink && (
              <Link href={slide.secondaryCtaLink}>
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/60 backdrop-blur-sm text-slate-200 hover:bg-slate-800 hover:text-white">
                  <span>{slide.secondaryCtaText}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIdx === idx ? 'w-8 bg-sky-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
