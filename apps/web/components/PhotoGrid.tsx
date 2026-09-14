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

  if (photos.length === 0) {
    return <p className="text-zinc-500">Belum ada foto.</p>;
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} onOpen={() => setActive(i)} />
        ))}
      </div>
      <Lightbox photos={photos} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  );
}
