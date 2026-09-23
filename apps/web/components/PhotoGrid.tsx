"use client";

import { useCallback, useEffect, useState } from "react";
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

export function PhotoGrid({ featuredOnly = false, limit }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [cameraFilter, setCameraFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchPhotos({ featured: featuredOnly ? true : undefined, limit });
      setPhotos(data);
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

  const filteredPhotos = cameraFilter
    ? photos.filter((p) => p.camera === cameraFilter)
    : photos;

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat foto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  }

  if (filteredPhotos.length === 0) {
    return (
      <div className="text-center py-8">
        {cameraFilter ? (
          <p className="text-zinc-500">
            Tidak ada foto dengan kamera "{cameraFilter}".{" "}
            <button
              onClick={() => setCameraFilter(null)}
              className="text-blue-600 hover:underline"
            >
              Tampilkan semua
            </button>
          </p>
        ) : (
          <p className="text-zinc-500">Belum ada foto.</p>
        )}
      </div>
    );
  }

  return (
    <>
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
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filteredPhotos.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} onOpen={() => setActive(i)} onFilterByCamera={handleCameraFilter} />
        ))}
      </div>
      <Lightbox photos={filteredPhotos} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  );
}
