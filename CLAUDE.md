# ente-redesign

An **unofficial redesign concept** of the Ente Photos mobile app, built as a web
prototype that runs full-screen from an Android home screen. It covers one loop
only: photo grid → open a photo → select many. The target feel is Google Photos
on Android, minus the forced AI.

This is a hobby demo. Front end only, fake data, no backend.

## Hard rules

- **`reference/` is read-only and never committed.** It holds upstream clones of
  `ente/ente` and `immich-app/immich` for reading. Do not modify anything inside
  it. It is gitignored; keep it that way.
- **Never paste Immich source into this repo.** Immich is AGPL-3.0; copying it
  would make this repo a derivative work. Re-implement its patterns instead.
- **`AUDIT.md` stays inventory-only.** It is a point-in-time audit of Ente Photos
  mobile at upstream `d3839ab`, every claim cited `path:line`. No opinions, no
  recommendations, no edits to bring it "up to date" — re-pinning would invalidate
  every citation.
- **No glass or glassmorphism.** Liquid Glass was vetoed for this project. Do not
  apply the `liquid-glass-design` skill here, even though it is the default
  elsewhere.
- **No Ente, Immich or Google logos or brand assets.** Every screen carries an
  "unofficial concept" label.
- **No backend, accounts, uploads, encryption or real APIs.** Fake data only.
- **No AI surfaces** — no "Ask", no suggestion cards, no auto-creations.
- **`docs/` is generated and committed.** GitHub Pages serves the site from
  `main` → `/docs`. Never hand-edit it; rebuild instead.

## Out of scope

Albums and Search content, the Feed tab, settings, memories, editing, sharing.
Tab stubs at most.

## Stack and commands

SvelteKit 2 + Svelte 5 + Tailwind 4, static build (the same stack Immich web
uses, so its timeline code reads as reference 1:1).

```bash
cd app
npm install
npm run dev      # local dev server
npm run build    # writes the static site to ../docs
npm run check    # svelte-check; keep this at zero errors
```

The build is prerendered with `ssr = false`: the grid's geometry depends on a
real viewport, and a server has no viewport to measure. Base path is
`/ente-redesign`; override with `BASE_PATH=''` for a root-hosted preview.

Append `?debug` to the URL for a live count of tiles in the DOM.

## Design tokens — "Ash"

Defined once in `app/src/app.css`. Every token has **separate light and dark
values, status colors included** — that is deliberate. Ente's own
`mobile/apps/photos/lib/theme/colors.dart` passes `green`/`red` and their
Dark/Darker tiers unchanged into both schemes (`:185-193` and `:238-245`), which
is the bug this palette exists to avoid. Ash also avoids Ente's Spotify-exact
`#1DB954` primary (`colors.dart:322`) and its untinted pure-black/white neutrals.

Fonts: Space Grotesk for headings, Inter for UI.

Dark mode follows the OS setting only. There is no in-app theme switch.

## Where things are

| Path | What |
|---|---|
| `AUDIT.md` | Audit of the real Ente Photos mobile app |
| `app/src/lib/data/library.ts` | Seeded synthetic photo library and day grouping |
| `app/src/lib/timeline/layout.ts` | Pure geometry: group placement, visible window, scrubber segments |
| `app/src/lib/timeline/pinch.ts` | Two-finger pinch reported as discrete density steps |
| `app/src/lib/components/Timeline.svelte` | Scroll container, virtualization, pinch anchoring |
| `.claude/context/LOG.md` | Append-only session log — add an entry every session |
| `.claude/context/reports/` | Status reports for pasting back into chat (`/project-status`) |
