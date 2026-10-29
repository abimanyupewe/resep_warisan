# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured yet.

## Next.js version warning

This is Next.js 16 / React 19 with breaking changes from older versions. Per `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` (`01-app` is the App Router guide) before writing Next.js code, and heed deprecation notices.

## State of the repo

Still the untouched `create-next-app` scaffold: App Router in `app/` (`layout.tsx`, `page.tsx`, `globals.css`), Tailwind CSS v4 via `@tailwindcss/turbopack`, TypeScript, path alias `@/*` → repo root. The product is not built yet.

## Product spec

`dev/dokumen/` (Indonesian, one file per chapter, indexed in `dev/dokumen/README.md`) is the source of truth for what to build. Read the relevant chapter before implementing a feature (e.g. `07-rancangan-data.md` for the schema, `06-kebutuhan-dan-desain.md` for UI rules). Its decisions are tagged **[K]** (decided by the developer) or **[A]** (assumption, changeable). Key constraints:

- "Dapur Uti": a family recipe platform. Anyone can self-register at `/daftar` and is active and signed in immediately (no approval); Better Auth's own sign-up endpoint stays disabled and signups are capped per day in `app/daftar/actions.ts`. `lib/pending.ts` (approval flow) is still used by the admin Anggota filter but no new accounts get that status. Admins can also create accounts directly (email + password, long sessions, admin resets passwords).
- Mobile-first (Android), installable PWA. UI text is Indonesian.
- Stack: Next.js for frontend and backend, Vercel Hobby hosting, Neon Postgres, Cloudinary for photos (compressed before upload), Google Drive daily backup. Everything must stay on free tiers.
- Every save creates a version (restorable); deletes go to a trash first; all members can edit all recipes.
- Ingredients and steps are free text, one per line. Recipes carry a "needs checking" status.
- PDF export is A5, generated in the user's browser (not on the server), selectable by category or recipe owner.
- OCR is deferred to phase 2; MVP attaches handwriting photos only.
