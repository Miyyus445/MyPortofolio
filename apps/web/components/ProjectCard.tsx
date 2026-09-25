"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "../lib/api";
import type { Project } from "../lib/types";

function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  // Izinkan path lokal (/...) dan URL http(s) valid. Tolak string bebas
  // yang membuat next/image melempar "Invalid src prop".
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProjectCard({ project }: { project: Project }) {
  const [imgError, setImgError] = useState(false);
  const rawThumbnail = project.thumbnail?.trim() ?? "";
  // Dukung path lokal relatif (/uploads/...) yang diserve API backend:
  // resolve ke URL absolut, lalu validasi sebelum ke next/image.
  const resolvedThumbnail = rawThumbnail ? resolveImageUrl(rawThumbnail) : "";
  const showImage = isValidImageSrc(resolvedThumbnail) && !imgError;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {showImage ? (
        <Image
          src={resolvedThumbnail}
          alt={project.title}
          width={800}
          height={450}
          unoptimized
          className="h-44 w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{project.title}</h3>
        <p className="mt-1 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span key={tech} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-3 text-sm font-semibold">
          {project.repoUrl ? <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:underline">Repo →</a> : null}
          {project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">Live Demo →</a> : null}
        </div>
      </div>
    </article>
  );
}
