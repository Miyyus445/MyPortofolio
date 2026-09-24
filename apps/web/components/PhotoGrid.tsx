"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPhotos } from "../lib/api";
import type { Photo } from "../lib/types";
import { ErrorState } from "./ErrorState";
import { Lightbox } from "./Lightbox";
import { PhotoCard } from "./PhotoCard";
import { Skeleton } from "./Skeleton";

interface Props {
  featuredOnly?: boolean;
  limit?: number;
}

function parseGenres(category: string | null | undefined): string[] {
  if (!category) return [];
  return category.split(",").map((c) => c.trim()).filter(Boolean);
}

export function PhotoGrid({ featuredOnly = false, limit }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [cameraFilter, setCameraFilter] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchPhotos({ featured: featuredOnly ? true : undefined, limit });
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setPhotos(sorted);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }, [featuredOnly, limit, attempt]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCameraFilter = (camera: string) => {
    setCameraFilter(cameraFilter === camera ? null : camera);
  };

  const handleFilterByCameraFromLightbox = (camera: string) => {
    setCameraFilter(camera);
    setActive(null);
  };

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const p of photos) {
      for (const g of parseGenres(p.category)) {
        set.add(g);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [photos]);

  const filteredPhotos = photos.filter((p) => {
    if (cameraFilter && p.camera !== cameraFilter) return false;
    if (genreFilter && !parseGenres(p.category).includes(genreFilter)) return false;
    return true;
  });

  if (status === "loading") {
    return (
      <div className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-3" aria-busy="true" aria-label="Memuat foto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mb-6" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500">Belum ada foto.</p>
      </div>
    );
  }

  return (
    <>
      {allGenres.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter genre">
          <button
            type="button"
            onClick={() => setGenreFilter(null)}
            aria-pressed={genreFilter === null}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              genreFilter === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Semua
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setGenreFilter(genreFilter === genre ? null : genre)}
              aria-pressed={genreFilter === genre}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                genreFilter === genre
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
      {cameraFilter && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Filter: {cameraFilter}
          </span>
          <button
            onClick={() => setCameraFilter(null)}
            className="text-blue-600 hover:underline text-sm"
          >
            Hapus filter
          </button>
        </div>
      )}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">
            Tidak ada foto yang cocok dengan filter.{" "}
            <button
              onClick={() => {
                setCameraFilter(null);
                setGenreFilter(null);
              }}
              className="text-blue-600 hover:underline"
            >
              Tampilkan semua
            </button>
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-3">
          {filteredPhotos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} onOpen={() => setActive(i)} onFilterByCamera={handleCameraFilter} />
          ))}
        </div>
      )}
      <Lightbox
        photos={filteredPhotos}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
        onFilterByCamera={handleFilterByCameraFromLightbox}
      />
    </>
  );
}
