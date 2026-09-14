# Portfolio Phase 2 — Frontend UI + Backend Endpoints (Design Spec)

Date: 2026-09-14 | Status: Approved | Approach: A (monorepo penuh via `@myproject/db`)

## 1. Goal
Halaman Utama & Gallery di `apps/web` (Next.js App Router) dengan data live dari backend NestJS `apps/api` yang membaca Prisma models di `packages/db`.

## 2. Non-goals
- Auth, upload foto, admin CMS, pagination server-side, search/filter kompleks.
- Migrasi DB produksi (cukup schema + generate + migrate dev bila `DATABASE_URL` tersedia).

## 3. Architecture
- `packages/db`: sumber kebenaran. `PrismaClient` + `prisma.config.ts` + `schema.prisma` (Photo, Project, Experience). Export singleton `db` + re-export tipe.
- `apps/api` (NestJS, port 3001, global prefix `api`): `PrismaModule` global menyediakan `PrismaClient` (Prisma 7 + `@prisma/adapter-pg` + `pg` Pool dari `DATABASE_URL`). Modules: `PhotosModule` (`GET /api/photos?featured=&limit=`), `ProjectsModule` (`GET /api/projects?limit=`), `ExperienceModule` (`GET /api/experience`). CORS enabled. Validasi query minimal (parse bool/int manual, tanpa class-validator agar ringan).
- `apps/web` (Next.js 16, React 19, Tailwind): server components untuk layout/statis + client components per section untuk fetch state. `lib/api.ts` fetch ke `${NEXT_PUBLIC_API_URL}/api/...` (`NEXT_PUBLIC_API_URL=http://localhost:3001`), `cache: 'no-store'`, throw on `!ok`. `lib/types.ts` mirror tipe Prisma (tanpa import server code ke client bundle selain tipe).

## 4. Components (`apps/web/components/`)
- `Navbar.tsx`: sticky, responsive (hamburger mobile), links Home `/`, Gallery `/gallery`, Projects `/projects`, Experience `/experience`. Active-link highlight via `usePathname`.
- `Hero.tsx`: headline, subcopy, CTA ke gallery & projects. Props statis.
- `PhotoCard.tsx`: image (`next/image`), badge kategori, caption, hover zoom overlay, `onOpen` untuk lightbox. Props: `photo`.
- `PhotoGrid.tsx`: client, props `featuredOnly?`/`limit?`; state loading/error/data; grid masonry via CSS columns; skeleton grid saat loading; `ErrorState` + retry saat gagal; klik kartu → `Lightbox`.
- `ProjectCard.tsx`: title, description, tech pills, Repo & Live Demo links (conditional render). Murni presentasional.
- `ProjectsSection.tsx` (client): fetch list, loading skeleton, error+retry, grid `ProjectCard`.
- `ExperienceTimeline.tsx`: client fetch + vertical timeline (dot + line), type badge, period. Loading/error states.
- `Lightbox.tsx`: dialog sederhana (fixed overlay, prev/next, Esc close, body scroll lock). Tanpa dep eksternal.
- `Skeleton.tsx`, `ErrorState.tsx`, `SectionHeading.tsx`: primitives reuse.
- `app/page.tsx`: Hero + Featured Photos (`<PhotoGrid featuredOnly limit=6/>`) + Latest Projects (`<ProjectsSection limit=3/>`) + Experience preview.
- `app/gallery|projects|experience/page.tsx`: halaman penuh reuse component yang sama dengan limit besar.

## 5. Data flow
`ClientSection (useEffect)` → `lib/api.ts fetch()` → `http://localhost:3001/api/<resource>` → NestJS controller → PrismaService → Postgres → JSON → render / skeleton / error.

## 6. Error handling
- API: global prefix + CORS; Prisma connection error → 500 JSON; query parsing defensif (default aman).
- Web: `!ok` → throw `Error(status)`; tangkap di section → `ErrorState` + tombol Retry (re-fetch via key increment); skeleton saat `loading`; data kosong → empty state copy.

## 7. Env & ports
- API: `PORT=3001`, `DATABASE_URL` (Postgres). Web dev port 3000. `apps/web/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## 8. Testing / verification
- `bunx tsc --noEmit` per package berubah; `bun run build` web; `vitest` API bila ada; manual: web render dengan API hidup, skeleton terlihat (throttle), error state terlihat (matikan API), lightbox navigasi + Esc.

## 9. Rollout order
1. `packages/db`: adapter dep (`@prisma/adapter-pg`, `pg`, `@types/pg`) + export `db` tetap.
2. `apps/api`: PrismaModule + 3 resource modules + main.ts prefix/CORS/port + e2e smoke.
3. `apps/web`: Tailwind install + globals + lib + components + pages + env.
4. Verifikasi penuh + commit.
