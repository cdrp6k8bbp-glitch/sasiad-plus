"use client";

import { useState } from "react";
import Image from "next/image";

function imageUrl(imageKey: string): string {
  return `/api/images/${imageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export default function ListingGallery({
  imageKeys,
  title,
}: {
  imageKeys: string[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasMultipleImages = imageKeys.length > 1;

  function selectPrevious() {
    setSelectedIndex((current) =>
      current === 0 ? imageKeys.length - 1 : current - 1,
    );
  }

  function selectNext() {
    setSelectedIndex((current) =>
      current === imageKeys.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div>
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[36px] bg-gradient-to-br from-green-50 to-emerald-100 md:min-h-[500px]">
        <Image
          src={imageUrl(imageKeys[selectedIndex])}
          alt={`${title} — zdjęcie ${selectedIndex + 1}`}
          fill
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, calc(100vw - 2rem)"
          fetchPriority="high"
          className="object-cover"
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={selectPrevious}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-slate-800 shadow-lg transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={selectNext}
              aria-label="Następne zdjęcie"
              className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-slate-800 shadow-lg transition hover:bg-white"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/75 px-3 py-1 text-sm font-bold text-white">
              {selectedIndex + 1}/{imageKeys.length}
            </span>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {imageKeys.map((imageKey, index) => (
            <button
              key={imageKey}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Pokaż zdjęcie ${index + 1}`}
              aria-current={selectedIndex === index}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-4 transition ${
                selectedIndex === index
                  ? "border-green-600"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={imageUrl(imageKey)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
