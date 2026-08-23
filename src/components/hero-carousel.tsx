"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export type Slide = {
  image: string;
  overline: string;
  title: string;
  highlight?: string; // palavra do título destacada em dourado
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
};

function Title({ title, highlight }: { title: string; highlight?: string }) {
  if (!highlight || !title.includes(highlight)) {
    return <>{title}</>;
  }
  const [before, after] = title.split(highlight);
  return (
    <>
      {before}
      <span className="text-gradient-gold">{highlight}</span>
      {after}
    </>
  );
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (n: number) => setIndex((i) => (n + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <section
      className="relative border-b border-ink-600 overflow-hidden h-[440px] md:h-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt={s.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
          <div className="relative h-full mx-auto max-w-6xl px-4 flex items-center">
            <div className="max-w-xl">
              <p className="text-gold font-semibold tracking-[0.2em] text-xs md:text-sm uppercase">
                {s.overline}
              </p>
              <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold leading-tight">
                <Title title={s.title} highlight={s.highlight} />
              </h1>
              <p className="mt-4 text-gray-200 max-w-md">{s.subtitle}</p>
              <div className="mt-8">
                <Link
                  href={s.ctaHref}
                  className="inline-block rounded-lg bg-gold text-ink px-6 py-3 font-semibold hover:bg-gold-light transition-colors"
                >
                  {s.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Setas */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-ink/60 border border-ink-600 text-white hover:bg-ink/90 hidden sm:flex items-center justify-center"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-ink/60 border border-ink-600 text-white hover:bg-ink/90 hidden sm:flex items-center justify-center"
          >
            ›
          </button>

          {/* Bolinhas */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para o slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
