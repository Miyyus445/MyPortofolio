import type { ExperienceItem, Photo, Project } from "./types";

export const mockPhotos: Photo[] = [
  {
    id: "mock-photo-1",
    title: "Golden Hour di Pantai",
    description: "Contoh data lokal saat backend tidak tersedia.",
    descriptionId: null,
    imageUrl: "https://picsum.photos/seed/portfolio-photo-1/800/600",
    category: "Landscape",
    camera: "Canon EOS R6",
    instagramUrl: null,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-photo-2",
    title: "City Lights",
    description: "Contoh data lokal saat backend tidak tersedia.",
    descriptionId: null,
    imageUrl: "https://picsum.photos/seed/portfolio-photo-2/800/600",
    category: "Street",
    camera: "Sony A7III",
    instagramUrl: null,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-photo-3",
    title: "Potret Studio",
    description: "Contoh data lokal saat backend tidak tersedia.",
    descriptionId: null,
    imageUrl: "https://picsum.photos/seed/portfolio-photo-3/800/600",
    category: "Portrait",
    camera: "Fujifilm X-T4",
    instagramUrl: null,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-photo-4",
    title: "Gunung Berkabut",
    description: "Contoh data lokal saat backend tidak tersedia.",
    descriptionId: null,
    imageUrl: "https://picsum.photos/seed/portfolio-photo-4/800/600",
    category: "Landscape",
    camera: "Canon EOS R6",
    instagramUrl: null,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
];

export const mockProjects: Project[] = [
  {
    id: "mock-project-1",
    title: "Portfolio Website (Offline Preview)",
    description:
      "Contoh data lokal yang tampil otomatis ketika API backend tidak merespons.",
    repoUrl: null,
    demoUrl: null,
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-project-2",
    title: "Photo Gallery App",
    description:
      "Contoh project lokal untuk memastikan halaman tetap terisi saat backend down.",
    repoUrl: null,
    demoUrl: null,
    techStack: ["React", "Node.js"],
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-project-3",
    title: "API Dashboard",
    description: "Contoh project lokal ketiga sebagai pengisi tampilan.",
    repoUrl: null,
    demoUrl: null,
    techStack: ["TypeScript", "Prisma"],
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
];

export const mockExperience: ExperienceItem[] = [
  {
    id: "mock-exp-1",
    role: "Frontend Developer",
    organization: "Contoh Perusahaan (Lokal)",
    period: "2023 — Sekarang",
    description:
      "Contoh data lokal yang tampil otomatis ketika API backend tidak merespons.",
    type: "Work",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-exp-2",
    role: "Freelance Photographer",
    organization: "Independent",
    period: "2021 — 2023",
    description: "Contoh pengalaman lokal agar timeline tetap terisi.",
    type: "Freelance",
    createdAt: new Date().toISOString(),
  },
];
