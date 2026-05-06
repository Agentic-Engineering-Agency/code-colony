# `@code-colony/landing`

Vite + React + TypeScript marketing page. The rendered tree was originally
ported from a legacy Babel-in-the-browser prototype; only the module system
has changed.

## Source of truth

The visual design and copy live in this directory (`apps/landing/`). The
legacy `landing/` folder at the repo root has been removed. This Vite port
is the current surface.

The components mirror the legacy source one-to-one:

| Legacy file              | Port                       |
| ------------------------ | -------------------------- |
| `landing/app.jsx`        | `src/App.tsx`              |
| `landing/nav.jsx`        | `src/nav.tsx`              |
| `landing/hero.jsx`       | `src/hero.tsx`             |
| `landing/sections.jsx`   | `src/sections.tsx`         |
| `landing/tweaks-panel.jsx` | `src/tweaks-panel.tsx`   |
| `landing/landing.css`    | `src/landing.css`          |
| `landing/code-colony-logo.png` | `public/code-colony-logo.png` |

The only structural change is converting Babel-style `window.X = X` globals
into proper ESM `export` declarations and named imports. The
`/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` markers in `App.tsx` are preserved so
the design team's tweak-panel host can keep rewriting the defaults block.

## Scripts

Run from this directory (or use `npm --prefix apps/landing run …` from the
repo root).

```bash
npm install         # install Vite + React + TS
npm run dev         # local dev server on http://localhost:5173
npm run build       # tsc --noEmit && vite build → dist/
npm run preview     # preview the production build
npm run typecheck   # tsc --noEmit
```

## Deploy

The production deploy is managed by Alchemy (`alchemy/landing.ts`). Deploys
run automatically via `cd-prod.yml` on pushes to `main`.

## Known TODOs

- `VideoFrame` in `src/hero.tsx` still points at `../video/Code Colony Demo.html`.
  The production-hosted demo URL lands with **AGE-53**; the placeholder is
  marked with a `TODO(AGE-53)` comment.
- The waitlist submit handlers (`WaitlistModal` in `src/nav.tsx`,
  `FinalCTASection` in `src/sections.tsx`) currently flip a local "done" flag.
  Wiring them to a real Convex mutation or Worker endpoint is tracked
  separately under AGE-50.
