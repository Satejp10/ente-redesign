# ente-redesign

### ▶ [Open the prototype](https://satejp10.github.io/ente-redesign/)

Best judged on a phone. Add it to your home screen for the full-screen version.

---

An **unofficial redesign concept** of the Ente Photos mobile app. Not affiliated
with Ente, Immich or Google. Front end only, fake data, no backend.

A web prototype of one loop — photo grid → open a photo → select many — built to
be added to an Android home screen and judged next to Google Photos.

## What's here

| Path | What |
|---|---|
| `app/` | SvelteKit prototype source |
| `docs/` | Built static site, served by GitHub Pages |
| `AUDIT.md` | Inventory audit of the real Ente Photos mobile app at upstream `d3839ab` |
| `CLAUDE.md` | Project rules and conventions |

## Running it

```bash
cd app
npm install
npm run dev      # http://localhost:5173/ente-redesign/
npm run build    # writes the static site to ../docs
```

Append `?debug` to the URL to see how many tiles are in the DOM at once.

## Deployment

Every push to `main` rebuilds the site and publishes it, via
`.github/workflows/pages.yml`. There is nothing to run by hand and the live site
cannot drift from the source. The build output is also committed to `docs/` so
the "deploy from a branch" Pages source works as a fallback.

## Current state

The Photos tab is live: a 3,200-photo synthetic library across four years,
virtualized so only the visible rows exist in the DOM, with day headers, pinch
to change density across three levels, and a year scrubber on the right edge.
Albums and Search are stubs.
