"use client";

import Image from "next/image";
import type { Photo } from "../lib/types";

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
}

export function PhotoCard({ photo, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative overflow-hidden">
        <Image
          src={photo.imageUrl}
          alt={photo.title}
          width={800}
          height={600}
          className="h-auto w-full transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {photo.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{photo.title}</h3>
        {photo.description ? <p className="mt-1 text-sm text-zinc-500">{photo.description}</p> : null}
      </div>
    </button>
  );
}
