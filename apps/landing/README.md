# `@code-colony/landing`

Vite + React + TypeScript port of the design landing page (`landing/` at the
repo root). The rendered tree is intentionally identical to the legacy
Babel-in-the-browser prototype — only the module system has changed.

## Source of truth

The visual design and copy live in `landing/` at the repo root. That folder
is still the design team's editing surface and **must not** be deleted while
this Vite port is in review.

The components here mirror that source one-to-one:

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

The production deploy plan lives in `landing/DEPLOY-PROMPT.md`. For
Cloudflare Pages once the runtime backend is wired:

```bash
# Forward reference — actual deploy lands in a follow-up ticket.
npx wrangler pages deploy dist --project-name code-colony-landing
```

## Known TODOs

- `VideoFrame` in `src/hero.tsx` still points at `../video/Code Colony Demo.html`.
  The production-hosted demo URL lands with **AGE-53**; the placeholder is
  marked with a `TODO(AGE-53)` comment.
- The waitlist submit handlers (`WaitlistModal` in `src/nav.tsx`,
  `FinalCTASection` in `src/sections.tsx`) currently flip a local "done" flag.
  Wiring them to a real Convex mutation or Worker endpoint is tracked
  separately per `landing/DEPLOY-PROMPT.md` Step 2.
