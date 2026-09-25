"use client";

import { useEffect, useState } from "react";
import { fetchProjects } from "../lib/api";
import type { Project } from "../lib/types";
import { ErrorState } from "./ErrorState";
import { ProjectCard } from "./ProjectCard";
import { Skeleton } from "./Skeleton";

export function ProjectsSection({ limit }: { limit?: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const data = await fetchProjects(limit);
        if (!cancelled) {
          setProjects(data);
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
  }, [limit, attempt]);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto" aria-busy="true" aria-label="Memuat projects">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (status === "error") return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  if (projects.length === 0) return <p className="text-zinc-500">Belum ada project.</p>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
