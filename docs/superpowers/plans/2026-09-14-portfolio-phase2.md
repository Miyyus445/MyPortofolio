# Portfolio Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build live portfolio home + gallery UI in `apps/web` backed by new NestJS endpoints in `apps/api` reading Prisma models in `packages/db`.

**Architecture:** `packages/db` exports Prisma singleton (Prisma 7 + `pg` adapter). `apps/api` adds a global `PrismaModule` plus Photos/Projects/Experience resource modules under global prefix `api` on port 3001. `apps/web` adds Tailwind, typed `lib/api.ts` fetch layer, reusable components, and 4 routes.

**Tech Stack:** NestJS 12 (ESM, `.js` import suffix), Prisma 7.10, Next.js 16 App Router, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), Bun workspaces, Vitest + Supertest.

**Spec:** `docs/superpowers/specs/2026-09-14-portfolio-phase2-design.md`

## Global Constraints

- API is ESM (`"type": "module"`): all relative imports MUST use `.js` suffix (e.g. `./prisma.service.js`).
- API dev port is 3001 (`app.listen(3001)`); web dev port stays 3000.
- Web `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/web/.env.local`.
- No auth, no admin CMS, no server-side pagination.
- Every task ends with its own verification + commit; do not bundle unrelated changes.

---

### Task 1: DB adapter dependencies + Prisma singleton with pg adapter

**Files:**
- Modify: `packages/db/package.json`
- Modify: `packages/db/src/index.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` env at runtime.
- Produces: `db: PrismaClient` (named export from `@myproject/db`), re-exported Prisma types (`Photo`, `Project`, `Experience`).

- [ ] **Step 1: Add adapter dependencies**

Run:
```bash
bun add @prisma/adapter-pg pg --cwd packages/db
bun add -d @types/pg --cwd packages/db
```

- [ ] **Step 2: Rewrite Prisma singleton with adapter**

`packages/db/src/index.ts` becomes:
```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalThis.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export * from "@prisma/client";
```

- [ ] **Step 3: Verify types**

Run: `bunx tsc --noEmit -p packages/db/tsconfig.json`
Expected: PASS (no output). Note: `prisma generate` needs `DATABASE_URL`; run as `DATABASE_URL="postgresql://user:password@localhost:5432/db" bun run generate` inside `packages/db` if client is stale.

- [ ] **Step 4: Commit**

```bash
git add packages/db/package.json packages/db/src/index.ts bun.lock
git commit -m "feat(db): add pg adapter and Prisma singleton"
```

---

### Task 2: API PrismaModule (global) + deps

**Files:**
- Modify: `apps/api/package.json` (add `@myproject/db`, `@prisma/client`, `@prisma/adapter-pg`, `pg`)
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`

**Interfaces:**
- Consumes: `db: PrismaClient` from `@myproject/db`.
- Produces: `PrismaService extends PrismaClient` injectable; `PrismaModule` global exporting it.

- [ ] **Step 1: Write the failing e2e probe (module loads)**

Append to `apps/api/test/app.e2e-spec.ts` later; first create service file. No test framework change needed — verification is `nest build` + e2e in Task 3. Create the service now:

`apps/api/src/prisma/prisma.service.ts`:
```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    super({ adapter: new PrismaPg(new Pool({ connectionString })) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

`apps/api/src/prisma/prisma.module.ts`:
```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 2: Add dependencies**

Run:
```bash
bun add @myproject/db @prisma/client @prisma/adapter-pg pg --cwd apps/api
```

- [ ] **Step 3: Verify build**

Run: `bun run build --cwd apps/api`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/api/package.json apps/api/src/prisma bun.lock
git commit -m "feat(api): add global PrismaModule with pg adapter"
```

---

### Task 3: API resource modules (photos, projects, experience) + main.ts prefix/CORS/port

**Files:**
- Create: `apps/api/src/photos/photos.controller.ts`
- Create: `apps/api/src/photos/photos.service.ts`
- Create: `apps/api/src/photos/photos.module.ts`
- Create: `apps/api/src/projects/projects.controller.ts`
- Create: `apps/api/src/projects/projects.service.ts`
- Create: `apps/api/src/projects/projects.module.ts`
- Create: `apps/api/src/experience/experience.controller.ts`
- Create: `apps/api/src/experience/experience.service.ts`
- Create: `apps/api/src/experience/experience.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/main.ts`
- Create: `apps/api/test/portfolio.e2e-spec.ts`

**Interfaces:**
- Consumes: `PrismaService` from Task 2.
- Produces: `GET /api/photos?featured=&limit=`, `GET /api/projects?limit=`, `GET /api/experience` returning Prisma-ordered JSON arrays.

- [ ] **Step 1: Write failing e2e test**

`apps/api/test/portfolio.e2e-spec.ts`:
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Portfolio endpoints (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/photos (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/photos').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/projects (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/projects').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/experience (GET) returns array', async () => {
    const res = await request(app.getHttpServer()).get('/api/experience').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:e2e --cwd apps/api`
Expected: FAIL (404, routes do not exist yet). Note: needs `DATABASE_URL` set for module init; run as `DATABASE_URL="postgresql://user:password@localhost:5432/db" bun run test:e2e --cwd apps/api`. If no live DB is reachable, `$connect` fails — in that case temporarily point at any Postgres (local docker) or skip to Step 3 and verify after DB is up; do NOT mock Prisma.

- [ ] **Step 3: Implement photos resource**

`apps/api/src/photos/photos.service.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(featured?: boolean, limit?: number) {
    return this.prisma.photo.findMany({
      where: featured === undefined ? undefined : { isFeatured: featured },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
```

`apps/api/src/photos/photos.controller.ts`:
```ts
import { Controller, Get, Query } from '@nestjs/common';
import { PhotosService } from './photos.service.js';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  findAll(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    const isFeatured = featured === undefined ? undefined : featured === 'true';
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.photos.findAll(isFeatured, Number.isNaN(take) ? undefined : take);
  }
}
```

`apps/api/src/photos/photos.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller.js';
import { PhotosService } from './photos.service.js';

@Module({
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
```

- [ ] **Step 4: Implement projects resource**

`apps/api/src/projects/projects.service.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(limit?: number) {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
```

`apps/api/src/projects/projects.controller.ts`:
```ts
import { Controller, Get, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    const take = limit === undefined ? undefined : Number.parseInt(limit, 10);
    return this.projects.findAll(Number.isNaN(take) ? undefined : take);
  }
}
```

`apps/api/src/projects/projects.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
```

- [ ] **Step 5: Implement experience resource**

`apps/api/src/experience/experience.service.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

`apps/api/src/experience/experience.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common';
import { ExperienceService } from './experience.service.js';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  findAll() {
    return this.experience.findAll();
  }
}
```

`apps/api/src/experience/experience.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller.js';
import { ExperienceService } from './experience.service.js';

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService],
})
export class ExperienceModule {}
```

- [ ] **Step 6: Wire modules + main.ts**

`apps/api/src/app.module.ts`: add imports `PrismaModule, PhotosModule, ProjectsModule, ExperienceModule` (keep existing ObserveModule, AppController, AppService).

`apps/api/src/main.ts` becomes:
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
```

- [ ] **Step 7: Run e2e to verify it passes**

Run: `DATABASE_URL="postgresql://user:password@localhost:5432/db" bun run test:e2e --cwd apps/api`
Expected: PASS (requires reachable Postgres; start one if needed).

- [ ] **Step 8: Commit**

```bash
git add apps/api/src apps/api/test bun.lock apps/api/package.json
git commit -m "feat(api): add photos projects experience endpoints on :3001/api"
```

---

### Task 4: Web Tailwind setup + base styles

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/postcss.config.mjs`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/next.config.js`

**Interfaces:**
- Consumes: nothing. Produces: Tailwind utilities available app-wide; remote images allowed.

- [ ] **Step 1: Install Tailwind**

Run:
```bash
bun add -d tailwindcss @tailwindcss/postcss postcss --cwd apps/web
```

- [ ] **Step 2: Create postcss config**

`apps/web/postcss.config.mjs`:
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Replace globals.css with Tailwind import + theme**

`apps/web/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --background: #fafafa;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
}
```

- [ ] **Step 4: Allow placeholder remote images**

`apps/web/next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Verify build**

Run: `bun run build --cwd apps/web`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/postcss.config.mjs apps/web/app/globals.css apps/web/next.config.js bun.lock
git commit -m "feat(web): set up tailwind css"
```

---

### Task 5: Web data layer (`lib/types.ts` + `lib/api.ts`) + env

**Files:**
- Create: `apps/web/lib/types.ts`
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/.env.local`

**Interfaces:**
- Consumes: `GET {API_URL}/api/photos|projects|experience`.
- Produces: `fetchPhotos(params)`, `fetchProjects(limit?)`, `fetchExperience()` returning typed arrays; `Photo`, `Project`, `ExperienceItem` types.

- [ ] **Step 1: Write types**

`apps/web/lib/types.ts`:
```ts
export interface Photo {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  techStack: string[];
  thumbnail: string | null;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  type: string;
  createdAt: string;
}
```

- [ ] **Step 2: Write fetch layer**

`apps/web/lib/api.ts`:
```ts
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
```

- [ ] **Step 3: Write env file**

`apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 4: Verify types**

Run: `bunx tsc --noEmit -p apps/web/tsconfig.json`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib apps/web/.env.local
git commit -m "feat(web): add typed api client for portfolio backend"
```

---

### Task 6: Web primitives + Navbar + Hero

**Files:**
- Create: `apps/web/components/SectionHeading.tsx`
- Create: `apps/web/components/Skeleton.tsx`
- Create: `apps/web/components/ErrorState.tsx`
- Create: `apps/web/components/Navbar.tsx`
- Create: `apps/web/components/Hero.tsx`

**Interfaces:**
- Consumes: nothing. Produces: presentational primitives + nav + hero used by pages.

- [ ] **Step 1: Write SectionHeading**

```tsx
interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description ? <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Write Skeleton + ErrorState**

`Skeleton.tsx`:
```tsx
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}
```

`ErrorState.tsx`:
```tsx
"use client";

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
      <p className="font-medium text-red-700 dark:text-red-300">Gagal memuat data</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write Navbar (client, responsive)**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Photo Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Portfolio
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                pathname === link.href ? "text-black dark:text-white" : "text-zinc-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </nav>
      {open ? (
        <div className="border-t border-zinc-200 px-4 py-2 md:hidden dark:border-zinc-800">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 4: Write Hero**

```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Photographer & Software Engineer</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Capturing light, shipping software.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Portfolio fotografi dan proyek IT — jelajahi galeri foto pilihan, project terbaru, dan riwayat pengalaman.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/gallery" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
          Lihat Galeri
        </Link>
        <Link href="/projects" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Lihat Projects
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify types**

Run: `bunx tsc --noEmit -p apps/web/tsconfig.json`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components
git commit -m "feat(web): add navbar hero and ui primitives"
```

---

### Task 7: Web photo components (PhotoCard, PhotoGrid, Lightbox)

**Files:**
- Create: `apps/web/components/PhotoCard.tsx`
- Create: `apps/web/components/PhotoGrid.tsx`
- Create: `apps/web/components/Lightbox.tsx`

**Interfaces:**
- Consumes: `Photo` type, `fetchPhotos` from Task 5, `Skeleton`/`ErrorState` from Task 6.
- Produces: `<PhotoGrid featuredOnly? limit? />` with loading skeleton, error+retry, and lightbox.

- [ ] **Step 1: Write PhotoCard**

```tsx
"use client";

import Image from "next/image";
import type { Photo } from "../lib/types";

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
}

export function PhotoCard({ photo, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative overflow-hidden">
        <Image
          src={photo.imageUrl}
          alt={photo.title}
          width={800}
          height={600}
          className="h-auto w-full transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {photo.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{photo.title}</h3>
        {photo.description ? <p className="mt-1 text-sm text-zinc-500">{photo.description}</p> : null}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Write Lightbox**

```tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { Photo } from "../lib/types";

interface Props {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = index === null ? null : photos[index] ?? null;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
    },
    [index, photos.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = index === null ? "" : "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onKey]);

  if (photo === null || index === null) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={photo.title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image src={photo.imageUrl} alt={photo.title} width={1200} height={800} className="max-h-[75vh] w-auto rounded-xl" />
        <div className="mt-3 flex items-center justify-between text-white">
          <p className="font-semibold">{photo.title}</p>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}>‹</button>
            <button type="button" aria-label="Next" className="rounded-lg bg-white/10 px-3 py-2" onClick={() => onNavigate((index + 1) % photos.length)}>›</button>
            <button type="button" className="rounded-lg bg-white/10 px-3 py-2" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write PhotoGrid with loading/error/lightbox state**

```tsx
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
```

- [ ] **Step 4: Verify types**

Run: `bunx tsc --noEmit -p apps/web/tsconfig.json`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/PhotoCard.tsx apps/web/components/PhotoGrid.tsx apps/web/components/Lightbox.tsx
git commit -m "feat(web): add photo grid with lightbox loading error states"
```

---

### Task 8: Web ProjectCard + ProjectsSection + ExperienceTimeline

**Files:**
- Create: `apps/web/components/ProjectCard.tsx`
- Create: `apps/web/components/ProjectsSection.tsx`
- Create: `apps/web/components/ExperienceTimeline.tsx`

**Interfaces:**
- Consumes: `Project`, `ExperienceItem` types; `fetchProjects`, `fetchExperience`; `Skeleton`, `ErrorState`.
- Produces: `<ProjectsSection limit? />`, `<ExperienceTimeline />`.

- [ ] **Step 1: Write ProjectCard**

```tsx
import Image from "next/image";
import type { Project } from "../lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {project.thumbnail ? (
        <Image src={project.thumbnail} alt={project.title} width={800} height={450} className="h-44 w-full object-cover" />
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
```

- [ ] **Step 2: Write ProjectsSection with loading/error**

```tsx
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat projects">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    );
  }

  if (status === "error") return <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />;
  if (projects.length === 0) return <p className="text-zinc-500">Belum ada project.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write ExperienceTimeline**

```tsx
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
```

- [ ] **Step 4: Verify types**

Run: `bunx tsc --noEmit -p apps/web/tsconfig.json`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ProjectCard.tsx apps/web/components/ProjectsSection.tsx apps/web/components/ExperienceTimeline.tsx
git commit -m "feat(web): add projects and experience sections"
```

---

### Task 9: Web routes (home, gallery, projects, experience) + layout

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/page.tsx` (delete `apps/web/app/page.module.css` usage)
- Create: `apps/web/app/gallery/page.tsx`
- Create: `apps/web/app/projects/page.tsx`
- Create: `apps/web/app/experience/page.tsx`

**Interfaces:**
- Consumes: all components from Tasks 6–8.
- Produces: `/`, `/gallery`, `/projects`, `/experience` routes.

- [ ] **Step 1: Update layout with Navbar**

`apps/web/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "../components/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Portfolio — Photography & Engineering",
  description: "Photography gallery, IT projects, and experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500 sm:px-6">
          © {new Date().getFullYear()} Portfolio. Built with Next.js + NestJS.
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite home page**

`apps/web/app/page.tsx`:
```tsx
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { Hero } from "../components/Hero";
import { PhotoGrid } from "../components/PhotoGrid";
import { ProjectsSection } from "../components/ProjectsSection";
import { SectionHeading } from "../components/SectionHeading";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Photography" title="Featured Photos" description="Koleksi foto pilihan." />
        <PhotoGrid featuredOnly limit={6} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Engineering" title="Latest Projects" description="Project IT terbaru." />
        <ProjectsSection limit={3} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Background" title="Experience" description="Riwayat kerja dan kredensial." />
        <ExperienceTimeline />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Write gallery page**

`apps/web/app/gallery/page.tsx`:
```tsx
import { PhotoGrid } from "../../components/PhotoGrid";
import { SectionHeading } from "../../components/SectionHeading";

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Gallery" title="Photo Gallery" description="Semua foto fotografi." />
      <PhotoGrid />
    </section>
  );
}
```

- [ ] **Step 4: Write projects page**

`apps/web/app/projects/page.tsx`:
```tsx
import { ProjectsSection } from "../../components/ProjectsSection";
import { SectionHeading } from "../../components/SectionHeading";

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Work" title="IT Projects" description="Daftar project beserta tech stack." />
      <ProjectsSection />
    </section>
  );
}
```

- [ ] **Step 5: Write experience page**

`apps/web/app/experience/page.tsx`:
```tsx
import { ExperienceTimeline } from "../../components/ExperienceTimeline";
import { SectionHeading } from "../../components/SectionHeading";

export default function ExperiencePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading eyebrow="Career" title="Experience" description="Riwayat kerja dan kredensial." />
      <ExperienceTimeline />
    </section>
  );
}
```

- [ ] **Step 6: Verify types + build**

Run: `bunx tsc --noEmit -p apps/web/tsconfig.json`
Expected: PASS.
Run: `bun run build --cwd apps/web`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app apps/web/components
git commit -m "feat(web): add home gallery projects experience pages"
```

---

### Task 10: Full verification (API + Web live)

**Files:** none (verification only).

- [ ] **Step 1: Migrate + seed check (if DB reachable)**

Run: `DATABASE_URL="postgresql://user:password@localhost:5432/db" bunx prisma migrate dev --name init --schema=packages/db/prisma/schema.prisma`
Expected: migration applied. If no DB available, record as blocked and continue with type/build checks.

- [ ] **Step 2: Start API and smoke-test endpoints**

Run in one shell: `DATABASE_URL="..." bun run start:dev --cwd apps/api` then:
```bash
curl http://localhost:3001/api/photos
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/experience
```
Expected: each returns `200` with JSON array.

- [ ] **Step 3: Start web and verify UI states**

Run: `bun run dev --cwd apps/web`, open `http://localhost:3000`, `/gallery`, `/projects`, `/experience`.
Expected: hero + sections render; skeleton visible on throttled network; stop API → error state + Retry appears; lightbox opens, arrows navigate, Esc closes.

- [ ] **Step 4: Run automated checks**

Run: `bun run check-types` (repo root), `bun run lint` (repo root).
Expected: PASS.

- [ ] **Step 5: Commit any fixes separately (no combined fix commit)**
