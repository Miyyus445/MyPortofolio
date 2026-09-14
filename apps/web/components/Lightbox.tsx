"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { Photo } from "../lib/types";

interface Props {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = index === null ? null : photos[index] ?? null;

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

  if (photo === null || index === null) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={photo.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image src={photo.imageUrl} alt={photo.title} width={1200} height={800} className="max-h-[75vh] w-auto rounded-xl" />
        <div className="mt-3 flex items-center justify-between text-white">
          <p className="font-semibold">{photo.title}</p>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}>‹</button>
            <button type="button" aria-label="Next" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index + 1) % photos.length)}>›</button>
            <button type="button" className="rounded-lg bg-white/10 px-3 py-2" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
