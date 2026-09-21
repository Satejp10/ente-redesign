**FOR CLAUDE.AI:** This is a status report generated inside Claude Code for the project below. Read it fully, update your stored memory for this project from Section 6, then reply with a short confirmation of what changed plus answers to any of Section 3's open questions you can address. Do not restate the report back to me. Treat Section 2 as current truth and anything you remembered previously as superseded.

---

```yaml
report_id: SR-ente-redesign-002
project: ente-redesign
repo: https://github.com/Satejp10/ente-redesign
branch: claude/dazzling-dijkstra-nj9p0y
generated_utc: 2026-09-21T12:14Z
surface: claude code web
session_id: session_01BM4Nbwy1PXGxL1AFMySpz4
project_started: 2026-09-21
days_active: 1
total_commits: 11 on main (7 non-merge + 4 merge)
commits_since_last_report: 8
previous_report: SR-ente-redesign-001 (2026-09-21T07:04Z)
previous_report_delivered_to_chat: yes
supersedes: SR-ente-redesign-001
standalone: true
```

> `previous_report_delivered_to_chat: yes` is evidenced, not assumed: the log entry
> "Next phase planned in chat" records the chat thread answering all four of SR-001's
> open questions. `[logged: 2026-09-21]`

---

# TLDR

- **What:** A working web prototype of a phone photo app — grid, pinch-to-change-density, year scrubber — built as an unofficial concept. Front end only, fake data, no backend. It began as a redesign of Ente Photos and has outgrown that framing.
- **Status:** The Photos tab is built, typechecks clean, builds clean, and is merged to `main`. It is **not live** — GitHub Pages has never been switched on, so the URL 404s.
- **Changed since SR-001:** The project pivoted from auditing Ente's Flutter app to building an original web app; the Photos grid shipped (PRs #3–#5); continuous deploy is wired and green but idle.
- **Blocked:** Two things, both needing the owner. Pages must be switched on by hand (no workflow can do it). And the app needs a new name before anything else is worth doing.
- **Next:** Settle the name, rename the repo, then switch Pages on — one job instead of two, since renaming changes the URL.
- **Needs a decision from you:** **The name.** Four were proposed and none chosen. Details in §3.1.

---

# 1. Delta since SR-ente-redesign-001

**Shipped:**
- `app/` — a SvelteKit 2 / Svelte 5 / Tailwind 4 static prototype, 16 source files, 1,331 lines. The Photos tab is complete; Albums and Search are stubs. `[verified: git ls-files 'app/src' | xargs wc -l]`
- `.github/workflows/pages.yml` — typecheck, build and publish on every push to `main`. `[verified: read the file; run 35597592034 on main concluded success]`
- `CLAUDE.md` — the project's hard rules, carried out of the (uncommitted) `HANDOFF.md`. `[verified: read]`
- `README.md` rewritten to open with the prototype link. `[verified: read]`
- PRs #3, #4 and #5 opened, reviewed and merged by the owner between 11:47Z and 12:06Z. `[verified: GitHub PR list]`

**Changed direction — twice, and both are material:**

1. **From auditing Ente's Flutter app to building an original web app.** SR-001 described a redesign of Ente Photos in Flutter. That is no longer what this is. It is a SvelteKit web prototype that never touches Flutter, modelled on Google Photos' behaviour via Immich, wearing an original palette. Decided in a chat session, handed back as `HANDOFF.md`, and verified against the repo at the start of this session. `[logged: 2026-09-21]`
2. **The Ente name is coming off it.** Raised by the owner in this session, in their words: *"my reason for starting this was ente's sub part ui but this is turning into a full fetched app. So to avoid tnc/copyright or whatever."* The rename is agreed in principle; only the name itself is unsettled. `[verified: this session]`

**New problems:**
- **The site is not live and cannot self-start.** `actions/configure-pages` with `enablement: true` cannot create a Pages site — GitHub refuses the Actions token on that API. This was my error, shipped in #4, caught by a red `main`, and corrected in #5. See §2.5. `[verified: curl → HTTP 404; workflow run 35597139860 conclusion=failure]`
- **`docs/` is not byte-reproducible.** Rebuilding with no source change still produces a diff, because `docs/_app/version.json` carries a build timestamp and the content hashes move with it. `[verified: npm run build on an unchanged tree → 16 changed/added/deleted paths in git status]`

**Dropped:** Nothing.

---

# 2. Full state (standalone)

## 2.1 What this is and why

A **web prototype of a phone photo app**, built to be added to an Android home screen and judged next to Google Photos. It covers one loop: photo grid → open a photo → select many. Only the first of those three exists so far.

It started as a redesign concept for **Ente Photos** (an open-source end-to-end-encrypted photo app) and the first deliverable was a 1,946-line audit of Ente's mobile app, which is still in the repo and still accurate. The motivation was a specific gap found in that audit: Ente has **no pinch-to-change-grid-density gesture at all**, and its grid density is a buried setting. That gap is the seed of the whole prototype.

The project has since outgrown the framing. It is now closer to an original app than a re-skin, which is why the owner wants Ente's name off the repo, the URL and the app.

**What it must NOT become:**
- Not a real product. No backend, accounts, uploads, encryption or real APIs. Fake data only.
- No AI surfaces — no "Ask", no suggestion cards, no auto-creations. This is a deliberate differentiator, not an oversight.
- Not a derivative work of Immich. Immich is AGPL-3.0; its patterns may be read and re-implemented, its source may never be pasted in.
- Not glass. Liquid Glass is the owner's default aesthetic elsewhere and was explicitly vetoed here.

**Hard constraints:**
- `reference/` holds read-only upstream clones (`ente/ente` at `d3839ab`, `immich-app/immich` at `202015e`). Gitignored, never committed, never modified. `[verified: git status in both → empty; git check-ignore -v reference → .gitignore:1]`
- No Ente, Immich or Google logos or brand assets. Every screen carries an "unofficial concept" label.
- `AUDIT.md` stays inventory-only and pinned to `d3839ab`. Re-pinning would invalidate ~700 `path:line` citations.
- `docs/` is generated and committed; never hand-edited.

## 2.2 Timeline

All of it is one calendar day. `[verified: git log]`

- 04:29Z — PR #1 opened: the Ente Photos mobile audit.
- 07:02Z — PR #1 merged.
- 07:19Z — PR #2 merged: SR-001 and the session log.
- *(between)* — a Claude.ai chat session set the new direction and produced `HANDOFF.md`. `[logged]`
- 11:50Z — PR #3 merged: the Photos grid prototype.
- 12:01Z — PR #4 merged: the Pages workflow. Its first run on `main` failed.
- 12:06Z — PR #5 merged: the workflow fix. Run on `main` succeeded.
- This report: 2026-09-21T12:14Z.

Working sessions logged: 4 entries in `.claude/context/LOG.md` across 1 active day.

## 2.3 Where the code is

**Stack:** SvelteKit 2 (`@sveltejs/kit` ^2.56.1) + Svelte 5 (^5.56.0, runes) + Tailwind 4 (^4.2.4 via `@tailwindcss/vite`) + `@sveltejs/adapter-static` ^3.0.8, TypeScript ^5.9, Vite ^7.1. Node 22. `[verified: app/package.json]`

This is deliberately Immich web's own stack, so Immich's timeline code reads as reference 1:1. `[logged: reference/immich/web/package.json]`

**Entry point:** `app/src/routes/+page.svelte` → `app/src/lib/components/Timeline.svelte`.

**Commands:** `cd app && npm run dev | npm run build | npm run check`. Build writes to `../docs`.

**Working:**
- Typecheck is clean: 158 files, 0 errors, 0 warnings. `[verified: npm run check, this session]`
- Build succeeds and writes a static site to `docs/`. `[verified: npm run build, this session]`
- 3,200 synthetic photos from a fixed seed (`SEED = 20_260_921`) across four years, deliberately lumpy — nothing for a fortnight, then forty from one afternoon — because evenly scattered photos make virtualization look easier than it is. `[verified: app/src/lib/data/library.ts:32-34]`
- Virtualized day-grouped grid: 30 tiles in the DOM against a 157,109px timeline, unchanged after a deep scroll. `[logged: 2026-09-21, headless Chromium 412×915]`
- Pinch changes density across three levels — 5 / 3 / 2 columns — during the gesture, and persists to `localStorage`. `[verified: DENSITY_LEVELS = [5, 3, 2] in density.svelte.ts:13]` `[logged: dispatched as real two-finger touch points, moved 3 → 2 → 5, survived reload]`
- Right-edge year scrubber, 38px gutter, month/year bubble while dragging. `[logged: reported "March 2025", jumped to 85,907px]`
- Tiles fade in over a placeholder colour; a failed image shows tap-to-retry. **There is no spinner anywhere** — the endless spinner is the exact failure mode being designed out (Ente's shared `Gallery` widget has no error state at all, so a failed load spins forever). `[logged]`
- Continuous deploy is wired and green: the latest run on `main` passed. `[verified: run 35597592034, conclusion=success]`

**Broken or incomplete:**
- **The live site 404s.** <https://satejp10.github.io/ente-redesign/> returns HTTP 404 because GitHub Pages has never been enabled on the repository. The workflow detects this and skips the deploy with a warning rather than failing. `[verified: curl -o /dev/null -w '%{http_code}' → 404, this session]`
- **Only one of three screens exists.** Tapping a photo does nothing; there is no viewer and no multi-select. Albums and Search are stubs by design. `[verified: git ls-files app/src]`
- **Phone smoothness has never been verified.** Every behavioural claim above comes from headless Chromium. Whether it *feels* right on a real phone is the owner's judgement and has not been made. `[unverified — deliberately]`

**Uncommitted work in progress:** Clean tree. The branch `claude/dazzling-dijkstra-nj9p0y` was restarted from `origin/main` (`924fffd`) this session after PR #5 merged, since a merged PR cannot carry follow-up work. `[verified: git merge-base --is-ancestor HEAD origin/main succeeded before the reset; git status --short → empty]`

## 2.4 Decisions

Carried forward from SR-001 (still binding): audit before design; `AUDIT.md` inventory-only; `path:line` citations against a pinned commit; `reference/` gitignored and read-only; restart the branch from `main` after each merge.

New since SR-001:

| Decision | Date | Why | Rejected | Reversible? |
|---|---|---|---|---|
| Build a web prototype, not Ente's Flutter app | 2026-09-21 | A demo needs a fast iteration loop; the real app needs Flutter + Android SDK + Rust and a rebuild-reinstall cycle for every change | Editing the real Ente app | Expensive — the whole `app/` tree assumes it |
| Stack: SvelteKit 2 + Svelte 5 + Tailwind 4, static | 2026-09-21 | Exactly Immich web's stack, so their timeline code reads 1:1 as reference | React (every Immich pattern would need translating); plain JS (too much hand-rolled state for virtualization and gestures) | Expensive |
| Palette "Ash", not a re-skin of Ente's | 2026-09-21 | Fixes three real faults in Ente's `colors.dart`: a primary that is Spotify's exact `#1DB954` (`:322`), untinted pure-black/white neutrals (`:266`, `:271`), and status colors shared byte-for-byte between light and dark (`:185-193` vs `:238-245`). All three verified against upstream | Liquid Glass (vetoed by the owner); three other style tiles | Cheap — tokens live in one file |
| Re-implement Immich's patterns, never paste its source | 2026-09-21 | Immich is AGPL-3.0; copying would make this repo a derivative work | Lifting code directly | Locked in |
| Change density *during* the pinch, not on release | 2026-09-21 | Copied from Immich mobile's `timeline_pinch_zoom.dart`; it is what makes the gesture feel like direct manipulation rather than a toggle | Applying on release | Cheap |
| Hold the photo under the fingers still through a density change | 2026-09-21 | Without the anchor the grid re-flows around the top of the viewport and whatever you were looking at jumps off screen — reads as a bug even though the feature works | Letting it re-flow | Cheap |
| One 400px thumbnail size for every density level | 2026-09-21 | A per-level size changes the URL and re-downloads every visible photo on each pinch step — exactly when the grid must not stutter | Per-density sizes | Cheap |
| Layout insets inside `buildLayout`, not as scroller padding | 2026-09-21 | One coordinate system means tile positions, scroll offsets and scrubber fractions all mean the same thing. Padding puts a constant offset between them — the off-by-60px that only shows on a phone | Padding the scroll container | Moderate |
| Scrubber gets its own 38px gutter rather than overlaying the grid | 2026-09-21 | First attempt overlaid it and the year labels were unreadable over light photos | Overlay | Cheap |
| `ssr = false`, `trailingSlash = 'always'` | 2026-09-21 | The grid's geometry needs a real viewport and a server has none; directory-style routes are served correctly by every static host | SSR; extensionless URLs | Cheap |
| No spinner anywhere | 2026-09-21 | The endless spinner is the failure mode being designed out | A spinner on load | Cheap |
| Deploy via GitHub Actions, keep `docs/` committed as a fallback | 2026-09-21 | The live site can never drift from the source; committed `docs/` means the "deploy from a branch" source also works, so either Pages setting produces a site | Pages from `/docs` only (the original plan, chosen to avoid a workflow push that turned out to be allowed) | Cheap |
| Drop the Ente name from the repo, URL and app | 2026-09-21 | The project has outgrown being a redesign of Ente; the owner wants distance from trademark and terms questions | Keeping `ente-redesign` | Cheap **now**, while nothing is live — expensive once the URL is shared |

## 2.5 Dead ends

- **`actions/configure-pages@v5` with `enablement: true` does not turn Pages on.** The first run on `main` (`32f40e4`) failed with `Get Pages site failed. Error: Not Found` / `Create Pages site failed. Error: Resource not accessible by integration`. Everything before it passed. The Actions `GITHUB_TOKEN` is refused on the create-a-Pages-site API regardless of the `permissions:` block, so **no workflow can bootstrap Pages on a repository where it has never been enabled**. A human does it once. Do not retry this without a PAT with Pages scope, which is not worth it for one switch.
- **Routing headless Chromium through the sandbox's `HTTPS_PROXY`** to fetch thumbnails: the proxy swallows loopback requests too, so the page under test returned blank (`title: ''`, zero tiles). `bypass: '127.0.0.1,localhost'` did not help. Fixed by pre-fetching photos with curl and fulfilling the requests from disk inside the test. Harness-only — a real phone reaches the image host directly.
- **`NODE_PATH` does not work for ESM imports.** The globally installed `playwright` had to be imported by absolute path.
- **Counting Ente localisation-key usage by grepping receiver names** (`strings.X` / `l10n.X`) under-counts, because some call sites use other receiver names — it wrongly scored 48 live strings as dead. The audit's published numbers come from full `.identifier` token intersection. Carried forward from SR-001; still true.

## 2.6 Invariants (do not break)

- `reference/` is read-only, gitignored, never committed.
- Never paste Immich source into this repo (AGPL-3.0).
- `AUDIT.md` stays inventory-only, pinned to `d3839ab`.
- No glass or glassmorphism — vetoed for this project specifically.
- No Ente, Immich or Google logos or brand assets; every screen carries an "unofficial concept" label.
- No backend, accounts, uploads, encryption or real APIs.
- No AI surfaces.
- `docs/` is generated; rebuild it in any commit that changes `app/`, never hand-edit it.
- Dark mode follows the OS only — there is no in-app theme switch.
- Work goes on `claude/dazzling-dijkstra-nj9p0y`, restarted from `main` after each merge.
- `.claude/context/LOG.md` is append-only. Corrections go in a new `### Correction` block, never as an edit.

## 2.7 Known issues and debt

- **Pages is off.** Everything else about deployment is done and green; the site cannot serve until one switch is flipped. Deliberate on GitHub's part, not a bug in the repo.
- **`docs/` churns on every rebuild.** Not byte-reproducible because `version.json` carries a build timestamp, so every rebuild commit carries ~16 changed paths of noise. Tolerable; worth revisiting if the diff ever obscures a real change.
- **The prototype's behaviour is verified only in headless Chromium.** No real-device testing has happened.
- **`reference/` clones are ephemeral.** This is a disposable cloud container. A fresh session must re-clone before any citation can be re-checked: `git clone --depth 1 --filter=blob:none https://github.com/ente/ente.git reference/ente` (229 MB) and the same for `immich-app/immich` (166 MB).
- **`HANDOFF.md` is deliberately not in the repo.** Its durable content went into `CLAUDE.md` per its own instruction. A future session reading only the repo will not see it, which is intended.
- **Two `unverified` markers remain in `AUDIT.md`** (panorama gestures at `:666`; `SimilarImagesPage` empty state at `:902`). Flagged rather than guessed.

---

# 3. Open questions for you

1. **What is the app called?** This blocks the rename, which blocks turning Pages on (renaming changes the URL, so doing it after would mean doing the job twice). Four were proposed this session and none was chosen:
   - **Grain** — film grain; short, photographic, nothing in the photo space owns it. *This was my recommendation.*
   - **Pinch** — names the one thing that makes it different, but ties the app to a single feature.
   - **Roll** — as in camera roll; shortest, but a very common word.
   - **Tessera** — a single tile in a mosaic, which is literally what the grid is; rarest, so least likely to clash, but harder to say and spell.
2. **Will you switch Pages on?** Settings → Pages → Source → GitHub Actions, once. Nothing goes live until then, and no automation can do it. Best done after the rename.
3. **May Immich source be lifted, or only re-implemented?** Running on the default *re-implement, never paste* since the project began, because Immich is AGPL-3.0. Worth confirming once rather than re-asking.
4. **Where Ash and Immich's own look disagree, which wins?** Running on the default *Ash*. Low stakes, but it will keep coming up.

---

# 4. Next actions

1. **Settle the name.** Acceptance: one word chosen. Everything below waits on it.
2. **Rename inside the repo, then rename on GitHub.** About seven files and ten lines: the build's base path (`app/svelte.config.js`), the package name, the PWA manifest, the `localStorage` key (`ente-redesign.density`), `README.md` and `CLAUDE.md`. `docs/` rebuilds itself. `AUDIT.md` keeps saying "Ente" and should — it is an audit *of* Ente. Acceptance: `npm run check` and `npm run build` clean, and no `ente-redesign` string outside `AUDIT.md` and the historical log. Caveat: this session's GitHub access is pinned to the current repo name, so a fresh session may be needed after the GitHub-side rename.
3. **Switch Pages on and confirm the site actually serves** — a 200, not an assumption.
4. **Build the viewer** (tap a photo to open it), then **multi-select** — one PR each, each judged on the phone before the next starts.

---

# 5. Verification ledger

**Ran this session:**
`npm run check` → 158 files, 0 errors, 0 warnings ·
`npm run build` → "Wrote site to ../docs", ✔ done ·
`curl https://satejp10.github.io/ente-redesign/` → **HTTP 404** ·
GitHub Actions run `35597592034` on `main` → **success** ·
GitHub Actions run `35597139860` on `main` → **failure** (the `configure-pages` error) ·
`git rev-list --count origin/main` → 11 ·
`git merge-base --is-ancestor HEAD origin/main` → true (branch fully merged, so restarted) ·
`git -C reference/ente status --short` → empty · `git -C reference/immich status --short` → empty ·
`git check-ignore -v reference` → `.gitignore:1` ·
`git ls-files` → 63 tracked files · `git ls-files app/src | xargs wc -l` → 1,331 lines across 16 files ·
`git status --short` after a no-change rebuild → 16 paths changed (the reproducibility finding) ·
GitHub PR list → #1–#5, all merged, timestamps as in §2.2

**Read this session:** `CLAUDE.md`, `README.md`, `.claude/context/LOG.md`, `.claude/context/reports/SR-ente-redesign-001.md`, `.github/workflows/pages.yml`, `app/svelte.config.js`, `app/package.json`, `app/static/manifest.webmanifest`, `app/src/lib/components/{Timeline,Scrubber,TabBar}.svelte`, `app/src/lib/data/library.ts`, `app/src/lib/timeline/density.svelte.ts`.

**Not verified:**
- **Every behavioural claim about the running prototype** (tile counts, timeline height, pinch transitions, scrubber readout) comes from the previous session's headless-Chromium run, logged the same day. Not re-run here — the source has not changed since.
- **Phone smoothness.** Never verified, by anyone, and not claimed.
- **The ~700 `path:line` citations in `AUDIT.md`.** Correct as of upstream `d3839ab` when written; no tooling exists to re-check them.
- **The Ash rationale citations** in `colors.dart` were verified earlier this day against the live clone, not re-checked for this report.

---

# 6. Memory block (for Claude.ai to store)

- The project at https://github.com/Satejp10/ente-redesign is **a web prototype of a phone photo app**, not a Flutter redesign. It started as an Ente Photos redesign concept and outgrew it. Front end only, fake data, no backend. Supersedes anything stored from SR-001.
- Stack: SvelteKit 2 + Svelte 5 (runes) + Tailwind 4, static build via `@sveltejs/adapter-static`, output committed to `docs/`. Chosen because it is Immich web's own stack, so Immich's timeline code reads 1:1 as reference.
- Scope is one loop: **photo grid → viewer → multi-select**. Only the grid exists. Albums and Search are stubs. Out of scope: albums/search content, Feed, settings, memories, editing, sharing.
- Started 2026-09-21. Currently: grid merged to `main`, CI green, **site not live** because GitHub Pages has never been enabled.
- **A GitHub Actions workflow cannot enable Pages** — `configure-pages` with `enablement: true` fails with "Resource not accessible by integration". A human sets Settings → Pages → Source → GitHub Actions once. Do not suggest automating it.
- **Open decision: the app's name.** The owner wants "Ente" off the repo, URL and app because the project outgrew being a redesign. Proposed and unchosen: **Grain** (recommended), **Pinch**, **Roll**, **Tessera**. Renaming is cheap — about seven files, and GitHub redirects the old repo URL — and is cheapest right now because nothing is live yet.
- Decided: palette is **"Ash"**, an original one, because Ente's `colors.dart` has a primary that is Spotify's exact `#1DB954`, untinted pure-black/white neutrals, and status colors shared byte-for-byte between light and dark. Every Ash token has separate light and dark values.
- Decided: pinch changes grid density **during** the gesture (copied from Immich mobile), and the photo under the fingers is held still through the change, because otherwise the grid re-flows and what you were looking at jumps off screen.
- Decided: **one 400px thumbnail size for every density level**, because a per-level size would re-download every visible photo on each pinch step.
- Constraint: **never paste Immich source** — it is AGPL-3.0, so copying makes this repo a derivative work. Re-implement its patterns instead.
- Constraint: **no glass/glassmorphism** here — Liquid Glass is the owner's default elsewhere but was vetoed for this project. **No AI surfaces** — no Ask, no suggestion cards, no auto-creations. **No brand logos**; every screen says "unofficial concept".
- Constraint: `reference/` holds read-only clones (ente @ `d3839ab`, immich @ `202015e`), gitignored, ephemeral — a new session must re-clone. `AUDIT.md` stays inventory-only and pinned.
- Do not: count Ente localisation-string usage by grepping receiver names (`strings.X` / `l10n.X`) — it under-counts. Use full `.identifier` token intersection.
- Do not: route headless Chromium through the sandbox `HTTPS_PROXY` — it swallows loopback too and the page under test goes blank.
- Known gap this project exists to fix: **Ente has no pinch-to-change-density gesture at all**, and its shared `Gallery` widget has **no error state**, so a failed load spins forever. This prototype has no spinner anywhere.
- **Nothing about the prototype's feel on a real phone has been verified.** All behavioural evidence is from headless Chromium.
- Currently blocked on: the name, and the Pages switch. Both need the owner.
- Next: settle the name → rename → switch Pages on → build the viewer, then multi-select.

---

# 7. Appendix

**File inventory:**
- `AUDIT.md` — 1,946-line inventory audit of Ente Photos mobile at upstream `d3839ab` — complete, frozen
- `CLAUDE.md` — project rules, stack, Ash rationale, deployment gotchas — current
- `README.md` — opens with the (not-yet-live) prototype link — current
- `app/src/lib/data/library.ts` — seeded synthetic library and day grouping
- `app/src/lib/timeline/layout.ts` — pure geometry: group placement, visible window, scrubber segments
- `app/src/lib/timeline/density.svelte.ts` — three density levels, persisted
- `app/src/lib/timeline/pinch.ts` — two-finger pinch as discrete density steps
- `app/src/lib/components/Timeline.svelte` — scroll container, virtualization, pinch anchoring
- `app/src/lib/components/{Scrubber,Tile,TabBar,Stub}.svelte` — the rest of the UI
- `docs/` — generated static site, committed
- `.github/workflows/pages.yml` — typecheck, build, publish; skips with a warning until Pages is on
- `.claude/context/LOG.md` — append-only session log, 4 entries
- `.claude/context/reports/SR-ente-redesign-00{1,2}.md` — this report and its predecessor

**Commands:** build `cd app && npm run build` · test `cd app && npm run check` (svelte-check; no unit tests exist) · run `cd app && npm run dev` · deploy automatic on push to `main`, once Pages is enabled.

**Environment:** Node 22, npm 10.9.7. Cloud session, ephemeral container. No environment variables required; `BASE_PATH=''` optionally overrides the base path for a root-hosted preview. Append `?debug` to the URL for a live count of tiles in the DOM.

**Recent commits on `main`:**
- `924fffd` Merge pull request #5 — Stop the Pages workflow failing before Pages is switched on
- `32f40e4` Merge pull request #4 — Deploy to Pages on every push, and link the site from the README
- `028394c` Merge pull request #3 — Add the Photos grid prototype
- `0f68a57` Merge pull request #2 — status report SR-ente-redesign-001
- `1829651` Merge pull request #1 — Add front-end audit of the Ente Photos mobile app
- `c57ee85` Initial commit
