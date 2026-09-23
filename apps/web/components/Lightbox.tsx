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
}

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
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

  const displayDescription = photo && showTranslation && (photo.descriptionId || translatedText)
    ? photo.descriptionId || translatedText
    : photo?.description;

  if (photo === null || index === null) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={photo.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image src={resolveImageUrl(photo.imageUrl)} alt={photo.title} width={1200} height={800} unoptimized className="max-h-[75vh] w-auto rounded-xl" />
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-white">
            <p className="font-semibold">{photo.title}</p>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}>‹</button>
              <button type="button" aria-label="Next" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index + 1) % photos.length)}>›</button>
              <button type="button" className="rounded-lg bg-white/10 px-3 py-2" onClick={onClose}>Tutup</button>
            </div>
          </div>
          {displayDescription && (
            <p className="text-white/90 text-sm max-h-32 overflow-y-auto">{displayDescription}</p>
          )}
          {(photo.description || photo.descriptionId) && (
            <button
              type="button"
              onClick={handleTranslateClick}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 self-start"
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
    </div>
  );
}
