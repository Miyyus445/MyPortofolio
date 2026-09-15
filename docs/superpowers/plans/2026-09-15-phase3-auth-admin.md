# Phase 3 Auth & CMS Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JWT admin auth to NestJS API and a protected CMS admin dashboard in Next.js.

**Architecture:** Backend: new `auth` module (`@nestjs/jwt`) with `JwtAuthGuard`, env-based admin credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`). Frontend: `AuthContext` + localStorage token, `middleware.ts` guard for `/admin/*` (cookie check), fetch wrapper injecting `Authorization: Bearer`.

**Tech Stack:** NestJS 12, @nestjs/jwt, bcryptjs (or plain compare if no hashing needed — use bcryptjs), Next.js 16 App Router, React 19, Tailwind 4.

**Spec:** User request Phase 3 (this plan). Existing code: `apps/api/src/app.module.ts`, `apps/api/src/photos|projects|experience/*.controller.ts` (GET-only), `apps/web/lib/api.ts`, `apps/web/app/layout.tsx`.

## Global Constraints

- API global prefix is `api` (`apps/api/src/main.ts:8`) — new endpoints under `/api/auth/*`.
- API is ESM (`"type": "module"`, imports use `.js` suffix) — follow that in new backend files.
- Web `API_URL` pattern: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"` + path `/api/...` — reuse in new code.
- Prisma models: Photo, Project, Experience in `packages/db/prisma/schema.prisma` — no schema change needed.
- Do not break existing public GET endpoints.
- Env example must be updated if new env vars added.

---

### Task 1: Backend auth module (login, me, guard)

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/jwt.strategy.ts` (or guard-only with JwtService verify — prefer strategy-less guard using JwtService for simplicity)
- Modify: `apps/api/src/app.module.ts` (import AuthModule)
- Modify: `apps/api/package.json` (add `@nestjs/jwt`, `bcryptjs`, `@types/bcryptjs`)
- Modify: `apps/api/.env.example` (create if missing: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_EXPIRES_IN`)

**Interfaces:**
- Consumes: `process.env.JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Produces: `POST /api/auth/login {email,password} -> {accessToken, user:{email}}`; `GET /api/auth/me` (Bearer) -> `{email}`; `JwtAuthGuard` exported for Task 2.

- [ ] **Step 1: Add deps + env example**
- [ ] **Step 2: Implement AuthModule/Service/Controller/Guard with JwtModule.register({secret, signOptions:{expiresIn:'1d'}})**
- [ ] **Step 3: Wire into AppModule, build + manual test (login OK/401, me 401/200)**

### Task 2: Protected CRUD for photos, projects, experiences

**Files:**
- Modify: `apps/api/src/photos/photos.controller.ts` + `photos.service.ts`
- Modify: `apps/api/src/projects/projects.controller.ts` + `projects.service.ts`
- Modify: `apps/api/src/experience/experience.controller.ts` + `experience.service.ts`

**Interfaces:**
- Consumes: `JwtAuthGuard` from Task 1
- Produces: `POST/PUT(:id)/DELETE(:id)` + `PATCH /photos/:id/featured` (or PUT with isFeatured) guarded; GETs remain public.

- [ ] **Step 1: Add service methods (create/update/remove, toggleFeatured) using PrismaService**
- [ ] **Step 2: Add guarded controller routes with DTO-less `@Body()` passthrough + ValidationPipe-free minimal checks**
- [ ] **Step 3: Build + verify unauthenticated POST returns 401, GET still public**

### Task 3: Frontend auth infra + login page

**Files:**
- Create: `apps/web/lib/auth-context.tsx` (AuthProvider, useAuth: login/logout/me, localStorage `admin_token` + cookie `admin_token`)
- Create: `apps/web/middleware.ts` (redirect `/admin/*` except `/admin/login` to login if no cookie token)
- Create: `apps/web/app/admin/login/page.tsx`
- Modify: `apps/web/lib/api.ts` (add `authFetch` helper + `loginAdmin`, `fetchMe` functions)

**Interfaces:**
- Consumes: `POST /api/auth/login`, `GET /api/auth/me`
- Produces: `useAuth()` hook, `admin_token` storage, middleware redirect behavior.

- [ ] **Step 1: Extend api.ts with token-aware fetch**
- [ ] **Step 2: Implement AuthContext + middleware**
- [ ] **Step 3: Implement login page (email/password form, error state, redirect to /admin/dashboard)**

### Task 4: Admin dashboard shell + photos management

**Files:**
- Create: `apps/web/app/admin/layout.tsx` (sidebar nav: Dashboard, Photos, Projects, Experience + logout; client guard redirect)
- Create: `apps/web/app/admin/dashboard/page.tsx` (stat cards: counts via fetchPhotos/fetchProjects/fetchExperience)
- Create: `apps/web/app/admin/photos/page.tsx` (list + create/edit form + delete + featured toggle)

**Interfaces:**
- Consumes: `useAuth()`, `authFetch` from Task 3
- Produces: routes `/admin/dashboard`, `/admin/photos`.

- [ ] **Step 1: Layout + dashboard**
- [ ] **Step 2: Photos CRUD UI (form fields: title, description, imageUrl, category, isFeatured checkbox; edit fills form; delete confirm)**
- [ ] **Step 3: Typecheck with `npm run check-types --workspace=web` or `npx tsc --noEmit` in apps/web**

### Task 5: Admin projects + experience management

**Files:**
- Create: `apps/web/app/admin/projects/page.tsx`
- Create: `apps/web/app/admin/experience/page.tsx`

**Interfaces:**
- Consumes: same auth infra
- Produces: routes `/admin/projects` (fields: title, description, techStack comma-separated, repoUrl, demoUrl, thumbnail), `/admin/experience` (fields: role, organization, period, description, type).

- [ ] **Step 1: Projects CRUD UI**
- [ ] **Step 2: Experience CRUD UI**
- [ ] **Step 3: Full web build `npm run build --workspace=web` (or in apps/web), api build `npm run build` in apps/api**
