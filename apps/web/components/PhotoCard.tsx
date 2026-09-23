"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "../lib/api";
import { translateToIndonesian } from "../lib/translate";
import type { Photo } from "../lib/types";

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
  onFilterByCamera?: (camera: string) => void;
}

export function PhotoCard({ photo, onOpen, onFilterByCamera }: Props) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Buka foto ${photo.title}`}
      className="group mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative overflow-hidden">
        <Image
          src={resolveImageUrl(photo.imageUrl)}
          alt={photo.title}
          width={800}
          height={600}
          unoptimized
          className="h-auto w-full transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {photo.category}
        </span>
        {photo.camera && (
          <button
            type="button"
            onClick={handleCameraClick}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-white transition-colors shadow-sm"
            aria-label={`Filter by ${photo.camera}`}
          >
            {photo.camera}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{photo.title}</h3>
        {displayDescription && (
          <p className="mt-1 text-sm text-zinc-500">{displayDescription}</p>
        )}
        {(photo.description || photo.descriptionId) && (
          <button
            type="button"
            onClick={handleTranslateClick}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            aria-label={showTranslation ? "Tampilkan Inggris" : "Terjemahkan ke Indonesia"}
          >
            {isTranslating ? (
              <span className="animate-pulse">Menerjemahkan...</span>
            ) : showTranslation ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>
                English
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
                Terjemahkan
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
