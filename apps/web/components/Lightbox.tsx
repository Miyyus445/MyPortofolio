"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { resolveImageUrl } from "../lib/api";
import { translateToIndonesian } from "../lib/translate";
import type { Photo } from "../lib/types";

interface Props {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onFilterByCamera?: (camera: string) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate, onFilterByCamera }: Props) {
  const photo = index === null ? null : photos[index] ?? null;
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
    },
    [index, photos.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = index === null ? "" : "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onKey]);

  useEffect(() => {
    setShowTranslation(false);
    setTranslatedText(null);
  }, [index]);

  const handleTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photo?.descriptionId) {
      setShowTranslation(!showTranslation);
      return;
    }
    if (!photo?.description) return;

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateToIndonesian(photo.description);
      setTranslatedText(result);
      setShowTranslation(true);
    } catch {
      setTranslatedText("Terjemahan gagal");
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!photo?.camera) return;
    if (onFilterByCamera) {
      const camera = photo.camera;
      onClose();
      onFilterByCamera(camera);
    }
  };

  const displayDescription = photo && showTranslation && (photo.descriptionId || translatedText)
    ? photo.descriptionId || translatedText
    : photo?.description;

  if (photo === null || index === null) return null;

  const prev = () => onNavigate((index - 1 + photos.length) % photos.length);
  const next = () => onNavigate((index + 1) % photos.length);

  return (
    <div role="dialog" aria-modal="true" aria-label={photo.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 md:grid-cols-[1.5fr_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kolom Kiri: Foto penuh */}
        <div className="relative flex min-h-[280px] items-center justify-center bg-black md:min-h-[480px]">
          <Image
            src={resolveImageUrl(photo.imageUrl)}
            alt={photo.title}
            width={1200}
            height={900}
            unoptimized
            className="max-h-[50vh] w-full object-contain md:max-h-[80vh]"
          />
          <button
            type="button"
            aria-label="Previous"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-lg leading-none text-white hover:bg-black/80"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-lg leading-none text-white hover:bg-black/80"
          >
            ›
          </button>
        </div>

        {/* Kolom Kanan: Sidebar ala post Instagram */}
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto p-5 md:max-h-[80vh]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{photo.title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Tutup
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {photo.category && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                {photo.category}
              </span>
            )}
            {photo.camera && (
              <button
                type="button"
                onClick={handleCameraClick}
                title="Filter galeri dengan kamera ini"
                className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {photo.camera}
              </button>
            )}
          </div>

          {displayDescription && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{displayDescription}</p>
          )}

          {(photo.description || photo.descriptionId) && (
            <button
              type="button"
              onClick={handleTranslateClick}
              className="flex items-center gap-1 self-start text-xs text-blue-600 hover:underline dark:text-blue-400"
              aria-label={showTranslation ? "Tampilkan Inggris" : "Terjemahkan ke Indonesia"}
            >
              {isTranslating ? (
                <span className="animate-pulse">Menerjemahkan...</span>
              ) : showTranslation ? (
                <>English</>
              ) : (
                <>Terjemahkan</>
              )}
            </button>
          )}

          {photo.instagramUrl && (
            <a
              href={photo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 self-start text-xs text-pink-500 hover:text-pink-400"
              aria-label="View on Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
          )}

          <div className="mt-auto flex items-center gap-2 pt-3">
            <button type="button" aria-label="Previous" className="rounded-lg bg-zinc-100 px-3 py-2 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200" onClick={prev}>‹</button>
            <button type="button" aria-label="Next" className="rounded-lg bg-zinc-100 px-3 py-2 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200" onClick={next}>›</button>
            <span className="ml-auto text-xs text-zinc-400">
              {index + 1} / {photos.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
