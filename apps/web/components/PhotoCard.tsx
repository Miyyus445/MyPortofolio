"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "../lib/api";
import { translateToIndonesian } from "../lib/translate";
import type { Photo } from "../lib/types";

function parseGenres(category: string | null | undefined): string[] {
  if (!category) return [];
  return category.split(",").map((c) => c.trim()).filter(Boolean);
}

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
  onFilterByCamera?: (camera: string) => void;
}

export function PhotoCard({ photo, onOpen, onFilterByCamera }: Props) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photo.descriptionId) {
      setShowTranslation(!showTranslation);
      return;
    }
    if (!photo.description) return;

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
    if (photo.camera && onFilterByCamera) {
      onFilterByCamera(photo.camera);
    }
  };

  const displayDescription = showTranslation && (photo.descriptionId || translatedText)
    ? photo.descriptionId || translatedText
    : photo.description;

  const handleOpen = () => onOpen(photo);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  const genres = parseGenres(photo.category);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Buka foto ${photo.title}`}
      className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 break-inside-avoid mb-6"
    >
      <div className="relative overflow-hidden bg-zinc-100 break-inside-avoid mb-6">
        <Image
          src={resolveImageUrl(photo.imageUrl)}
          alt={photo.title}
          width={800}
          height={600}
          unoptimized
          className="w-full h-auto transition duration-300 group-hover:scale-105"
        />
        {genres.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {genres.map((g) => (
              <span
                key={g}
                className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white"
              >
                {g}
              </span>
            ))}
          </div>
        )}
        {photo.camera && (
          <button
            type="button"
            onClick={handleCameraClick}
            className="absolute bottom-3 right-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9px] font-medium text-zinc-300 hover:bg-black/60 transition-colors"
            aria-label={`Filter by ${photo.camera}`}
          >
            {photo.camera}
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm">{photo.title}</h3>
        {displayDescription && (
          <p className={`mt-1 text-sm text-zinc-400 ${!isExpanded ? 'line-clamp-4' : ''}`}>
            {displayDescription}
          </p>
        )}
        {(photo.description || photo.descriptionId) && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-xs text-zinc-500 hover:text-zinc-400 underline flex items-center gap-1"
            >
              {isExpanded ? 'Sembunyikan' : 'Baca selengkapnya...'}
            </button>
            <div className="mt-3 pt-2 border-t border-zinc-800/50">
              <button
                type="button"
                onClick={handleTranslateClick}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                aria-label={showTranslation ? "Tampilkan Inggris" : "Terjemahkan ke Indonesia"}
              >
                {isTranslating ? (
                  <span className="animate-pulse">Menerjemahkan...</span>
                ) : showTranslation ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12a9 9 0 009-9V2a9 9 0 00-9-9H3v14h3m9 9H7a9 9 0 01-9-9V2a9 9 0 019-9h3m9 9v1a9 9 0 01-9 9h-3m-6 0H7a9 9 0 01-9-9V2a9 9 0 019-9h3"/></svg>
                    English
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12a9 9 0 009-9V2a9 9 0 00-9-9H3v14h3m9 9H7a9 9 0 01-9-9V2a9 9 0 019-9h3m9 9v1a9 9 0 01-9 9h-3m-6 0H7a9 9 0 01-9-9V2a9 9 0 019-9h3"/></svg>
                    Terjemahkan
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
