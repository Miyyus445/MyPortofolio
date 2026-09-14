"use client";

import { useEffect, useState } from "react";
import { fetchExperience } from "../lib/api";
import type { ExperienceItem } from "../lib/types";
import { ErrorState } from "./ErrorState";
import { Skeleton } from "./Skeleton";

export function ExperienceTimeline() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const data = await fetchExperience();
        if (!cancelled) {
          setItems(data);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setStatus("error");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (status === "loading") {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Memuat experience">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (status === "error") return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  if (items.length === 0) return <p className="text-zinc-500">Belum ada pengalaman.</p>;

  return (
    <ol className="relative space-y-6 border-l border-zinc-200 pl-6 dark:border-zinc-800">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span aria-hidden className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-black dark:bg-white" />
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold dark:bg-zinc-800">{item.type}</span>
          <h3 className="mt-2 font-bold">{item.role} — {item.organization}</h3>
          <p className="text-sm text-zinc-500">{item.period}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
        </li>
      ))}
    </ol>
  );
}
