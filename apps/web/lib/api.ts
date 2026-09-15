import type {
  ExperienceItem,
  Photo,
  Project,
  AdminUser,
  LoginResponse,
  CreatePhotoInput,
  UpdatePhotoInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateExperienceInput,
  UpdateExperienceInput,
} from "./types";

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

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function authFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const authToken = token ?? getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `Request failed: ${res.status} ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Invalid credentials" }));
    throw new Error(err.message || "Invalid credentials");
  }
  return res.json() as Promise<LoginResponse>;
}

export async function fetchMe(token: string): Promise<AdminUser> {
  return authFetch<AdminUser>("/api/auth/me", {}, token);
}

export async function createPhoto(data: CreatePhotoInput, token?: string): Promise<Photo> {
  return authFetch<Photo>("/api/photos", { method: "POST", body: JSON.stringify(data) }, token);
}

export async function updatePhoto(id: string, data: UpdatePhotoInput, token?: string): Promise<Photo> {
  return authFetch<Photo>(`/api/photos/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
}

export async function deletePhoto(id: string, token?: string): Promise<void> {
  return authFetch<void>(`/api/photos/${id}`, { method: "DELETE" }, token);
}

export async function setPhotoFeatured(id: string, isFeatured: boolean, token?: string): Promise<Photo> {
  return authFetch<Photo>(`/api/photos/${id}/featured`, { method: "PATCH", body: JSON.stringify({ isFeatured }) }, token);
}

export async function createProject(data: CreateProjectInput, token?: string): Promise<Project> {
  return authFetch<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) }, token);
}

export async function updateProject(id: string, data: UpdateProjectInput, token?: string): Promise<Project> {
  return authFetch<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
}

export async function deleteProject(id: string, token?: string): Promise<void> {
  return authFetch<void>(`/api/projects/${id}`, { method: "DELETE" }, token);
}

export async function createExperience(data: CreateExperienceInput, token?: string): Promise<ExperienceItem> {
  return authFetch<ExperienceItem>("/api/experience", { method: "POST", body: JSON.stringify(data) }, token);
}

export async function updateExperience(id: string, data: UpdateExperienceInput, token?: string): Promise<ExperienceItem> {
  return authFetch<ExperienceItem>(`/api/experience/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
}

export async function deleteExperience(id: string, token?: string): Promise<void> {
  return authFetch<void>(`/api/experience/${id}`, { method: "DELETE" }, token);
}
