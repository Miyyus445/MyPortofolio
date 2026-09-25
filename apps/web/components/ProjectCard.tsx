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
    <article className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 md:p-3">
      {showImage ? (
        <div className="md:col-span-2 w-full h-full min-h-[280px] relative rounded-xl overflow-hidden bg-zinc-950">
          <Image
            src={resolvedThumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            unoptimized
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : null}
      <div className="md:col-span-1 p-4 md:p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-4 text-sm font-semibold">
          {project.repoUrl ? (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-zinc-200 hover:underline">
              Repo →
            </a>
          ) : null}
          {project.demoUrl ? (
            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-zinc-200 hover:underline">
              Live Demo →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
