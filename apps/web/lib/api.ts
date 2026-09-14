import type { ExperienceItem, Photo, Project } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPhotos(params?: { featured?: boolean; limit?: number }): Promise<Photo[]> {
  const search = new URLSearchParams();
  if (params?.featured !== undefined) search.set("featured", String(params.featured));
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  const qs = search.toString();
  return getJson<Photo[]>(`/api/photos${qs ? `?${qs}` : ""}`);
}

export function fetchProjects(limit?: number): Promise<Project[]> {
  return getJson<Project[]>(`/api/projects${limit !== undefined ? `?limit=${limit}` : ""}`);
}

export function fetchExperience(): Promise<ExperienceItem[]> {
  return getJson<ExperienceItem[]>("/api/experience");
}
