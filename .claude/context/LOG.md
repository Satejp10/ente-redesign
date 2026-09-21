# Project log — ente-redesign

Append-only history of working sessions. Newest entries at the **bottom**.

**Format rules**
- One entry per working session, headed `## YYYY-MM-DD — <short title>`.
- Never edit or delete a past entry. If something was recorded wrongly, append a
  new `### Correction` block under a later entry saying what was wrong and what
  is true instead.
- Record decisions **with their reasons**, dead ends **with their symptoms**, and
  anything a future session would otherwise re-derive from scratch.
- No secrets. Refer to credentials by name only.

---

## 2026-09-21 — Front-end audit of Ente Photos mobile

**Session:** `session_01BM4Nbwy1PXGxL1AFMySpz4` (Claude Code web)

**Goal:** Audit the Ente Photos **mobile** app (Flutter) ahead of a front-end
redesign. Inventory only — the brief explicitly excluded recommendations.

**Did:**
- Cloned upstream `ente/ente` to `reference/ente` at commit `d3839ab`
  (`--depth 1 --filter=blob:none`, 229 MB) and added `.gitignore` with
  `reference/` so it is never committed. Treated the clone as read-only
  throughout; verified untouched at the end of the session.
- Wrote `AUDIT.md` — 1,946 lines, 11 sections, every claim cited `path:line`:
  screen inventory, navigation map with tap-depth, action inventory
  (photo / multi-select / album / person), gesture inventory, settings tree,
  per-screen state coverage, component inventory with ripgrep call-site counts,
  feature flags, a census over all 2,142 localisation keys, rough edges, and the
  web gallery's virtualization / decrypt / placeholder / scroll behaviour.
- Opened PR #1 as a draft; it was marked ready for review and merged by
  Satejp10 at 07:02Z (merge commit `1829651`).
- Restarted the working branch from `origin/main` afterwards, since a merged PR
  cannot carry follow-up work.
- Generated status report SR-ente-redesign-001 and bootstrapped this log.

**Decisions:**
- *Audit before any design work* — 527 UI files with no existing map; a redesign
  cannot safely drop actions it never enumerated.
- *`AUDIT.md` stays inventory-only* — required by the brief, and it keeps the
  document useful regardless of which design direction is eventually chosen.
  Recommendations, when wanted, go in a separate file.
- *Cite `path:line` for every claim, or write `unverified`* — two of the brief's
  own premises turned out to be stale, which is exactly the failure mode
  citations prevent.
- *Pin to upstream `d3839ab`* — line citations are meaningless against a moving
  target. Re-pinning later means re-verifying the citations.

**Corrections to the original brief** (do not reintroduce):
- Ente Photos ships **four** bottom-nav tabs — Home, Albums, Feed, Search
  (`ui/home/home_bottom_nav_bar.dart:155-180`) — not two.
- `ente_components/theme/shadows.dart` has **zero** references; the shadow tiers
  actually in use live in `{APP}/theme/`.
- Settings is a `Scaffold` **drawer** (`ui/tabs/home_widget.dart:891-900`), not a
  pushed route.

**Dead end:**
- Counting localisation-key usage by grepping receiver names (`strings.X`,
  `l10n.X`, `S.of(context).X`) **under-counts**: `models/memories/clip_memory.dart`
  uses a receiver named `locals`, so 48 smart-memory titles scored as dead.
  Five further strings were briefly mis-scored for the same reason
  (`noSessionsFound`, `emptyAlbumShareMessage`, `facesTimelineUnavailable`,
  `noDeleteSuggestion`, `youHaveNoFileSuggestedForDeletion`) — all are live.
  Fixed by extracting every `.identifier` token across all Dart sources and
  intersecting with the key set. The published numbers (1,750 reachable /
  372 Auth-and-Locker-only / 20 fully dead) come from that method. Only
  `trashIsEmpty` is genuinely unreferenced.

**Left deliberately open:**
- Two `unverified` markers remain in `AUDIT.md` rather than guesses: which
  gestures the panorama package binds (`:666`), and whether `SimilarImagesPage`
  has an empty-state branch (`:902`).

**Open questions for the user** (carried into SR-001 §3): whether the next
deliverable is an opinionated recommendations pass or direct visual design;
whether the redesign scope is the whole app or specific surfaces; which of the
three concurrent component layers to standardise on; and whether this is a
re-skin inside Ente's existing Inter/`EnteTheme` language or a new visual
direction.

**Generated:** report SR-ente-redesign-001.

---

## 2026-09-21 — Next phase planned in chat (no code)

**Session:** Claude.ai chat thread (not Claude Code)

**Goal:** Decide what the audit feeds into, and hand the result back to Claude
Code as `HANDOFF.md` (HO-ente-redesign-001).

**Did:**
- Answered the four open questions SR-001 left for the user (below).
- Chose the "Ash" palette and wrote `HANDOFF.md`.

**Decisions:**
- *Build a web prototype, not Ente's Flutter app* — a demo needs fast iteration,
  and the real build needs Flutter + Android SDK + Rust with a
  rebuild-and-reinstall loop every time. (Rejected: editing the real app.)
- *Scope: Photos grid → viewer → multi-select, one PR each* — each piece gets
  judged on the phone before the next starts. (Rejected: a written gap-analysis
  pass first; the owner chose to go straight to screens.)
- *Look: "Ash"* — it fixes three faults in Ente's
  `mobile/apps/photos/lib/theme/colors.dart`: a primary that is Spotify's exact
  `#1DB954`, untinted pure-black/white neutrals, and status colors shared
  byte-for-byte between light and dark. (Rejected: Liquid Glass, vetoed by the
  owner; three other style tiles.)
- *Behaviour reference: Google Photos on Android, via Immich* — Immich is open
  source and deliberately Google-Photos-like. Immich mobile shows how it should
  look on a phone; Immich web shows how to build it on the web.
- *Stack: SvelteKit 2 + Svelte 5 + Tailwind 4, static build* — exactly Immich
  web's stack, so its timeline code reads 1:1 as reference. (Rejected: React,
  which would need every Immich pattern translated; plain JS, too much
  hand-rolled state for virtualization and gestures.)
- *Hosting: GitHub Pages from `main`, folder `/docs`* — needs no workflow file.
- *Dark mode follows the OS setting only.*

**Answers to SR-001's open questions:** straight to screens, no recommendations
document; scope is the grid/viewer/multi-select loop, not the whole app; the
component-layer question is moot now the build is not Flutter; and this is a new
visual direction ("Ash"), not a re-skin of Ente's language.

**Left open:** whether Immich source may be lifted under AGPL (default until
decided: re-implement, never paste); whether to follow Ash or Immich's own look
where they disagree (default: Ash on the Immich/Google layout); the Feed tab
(out of scope for now).

---

## 2026-09-21 — Audit of HANDOFF.md, then the Photos grid

**Session:** `session_01BM4Nbwy1PXGxL1AFMySpz4` (Claude Code web)

**Goal:** Verify `HANDOFF.md` against the real repo per its Section 0, then, on
the owner's go-ahead, scaffold `app/` and build the Photos tab.

**Did — audit:**
- Verified the handoff against the repo. It was largely accurate. Seven
  divergences found and reported; details in the drift report. The substantive
  one: `AUDIT.md` and SR-001 describe redesigning Ente's **Flutter** app, while
  the handoff redefines the project as a **web prototype that never touches
  Flutter**. That is a deliberate later pivot, so the handoff wins.
- Confirmed all three "Ash" rationale claims against
  `reference/ente/mobile/apps/photos/lib/theme/colors.dart`: `:322`
  `_primary500 = Color.fromRGBO(29, 185, 84, 1)` is `#1DB954` exactly; `:266`
  and `:271` are pure black and pure white; `green`/`red` and their Dark/Darker
  tiers go into both `lightScheme` (`:185-193`) and `darkScheme` (`:238-245`)
  unchanged.
- Cloned `reference/immich` at `202015e` (166 MB) and confirmed the stack claim
  from `web/package.json`: svelte 5.56.10, @sveltejs/kit ^2.56.1, tailwindcss
  ^4.2.4, and — usefully — `@sveltejs/adapter-static` ^3.0.8 already in their
  deps. They are further ahead on the toolchain than the handoff said (Vite 8,
  TypeScript 6 via the Go port) and web is a pnpm workspace; neither matters for
  reading their code.

**Did — build:**
- Scaffolded `app/` by hand rather than via `npx sv create`, and built the
  Photos tab: seeded 3,200-photo library across four years, virtualized day-
  grouped grid, three-level pinch density, right-edge year scrubber, fade-in
  tiles with tap-to-retry, tab bar with Albums/Search stubs, PWA manifest with
  generated icons, Ash tokens in light and dark.
- Wrote `CLAUDE.md` carrying the project's hard rules, per HANDOFF Section 10.

**Decisions:**
- *Fold the layout insets into `buildLayout` rather than the scroll container's
  padding* — one coordinate system means tile positions, scroll offsets and
  scrubber fractions all mean the same thing. Padding on the scroller would have
  put a constant offset between them, which is exactly the kind of off-by-60px
  that shows up only on a phone.
- *One thumbnail request size (400px) for every density level* — asking for a
  different width per level would change the URL and re-download every visible
  photo on each pinch step, which is precisely when the app must not stutter.
- *Change density during the pinch, not on release* — copied from Immich mobile
  (`timeline_pinch_zoom.dart`), and it is what makes the gesture feel like direct
  manipulation rather than a toggle.
- *Hold the photo under the fingers still through a density change* — without
  the anchor, the grid re-flows around the top of the viewport and whatever you
  were looking at jumps off screen. Reads as a bug even though the feature works.
- *Scrubber gets its own 38px gutter rather than overlaying the grid* — first
  attempt let it overlay, and the year labels were unreadable over light photos.
- *`ssr = false` and `trailingSlash = 'always'`* — the grid needs a real viewport
  to measure, and directory-style routes are served correctly by every static
  host rather than relying on extensionless-URL rewriting.
- *No spinner anywhere* — a failed thumbnail shows a tap-to-retry glyph over its
  placeholder colour. An endless spinner is the failure mode being designed out.

**Verified in headless Chromium** (Playwright, 412×915, touch enabled), not by
eye: 30 tiles in the DOM against a 157,109px timeline and unchanged after a deep
scroll; pinch dispatched as real two-finger touch points moves 3 → 2 → 5
columns and survives reload; the scrubber drag shows "March 2025" and jumps;
aborting every image yields 30 retry affordances and zero spinners; zero console
errors. **Smoothness on a real phone is not verified and is the owner's call.**

**Dead ends:**
- Routing headless Chromium through the sandbox's `HTTPS_PROXY` to fetch
  thumbnails: the proxy swallows loopback requests too, so the local page itself
  returned blank (`title: ''`, zero tiles). `bypass: '127.0.0.1,localhost'` did
  not help. Fixed by pre-fetching 120 photos with curl and fulfilling
  `**/picsum.photos/**` from disk inside the test. Harness-only; a real phone
  reaches picsum directly.
- `NODE_PATH` does not work for ESM imports — the global `playwright` had to be
  imported by absolute path.

**Left open:** the two questions the handoff itself left open (AGPL lifting, Ash
vs Immich's look where they disagree) are still unanswered; both are running on
their stated defaults.

**Next:** the viewer (open a photo), then multi-select — one PR each.

---

## 2026-09-21 — Continuous deploy to Pages

**Session:** `session_01BM4Nbwy1PXGxL1AFMySpz4` (Claude Code web) — same session as
the entry above, recorded separately rather than editing it.

**Why:** PR #3 merged, but nothing was live. GitHub Pages had never been switched
on, so the built site sat in `docs/` on `main` with no one serving it. The owner
asked for continuous deployment and a link at the top of the README.

**Did:**
- Added `.github/workflows/pages.yml`: typecheck, build, publish on every push to
  `main`. Uses `actions/configure-pages@v5` with `enablement: true`, which turns
  Pages on through the API if it has never been enabled — so the site can go live
  without anyone visiting Settings.
- Linked <https://satejp10.github.io/ente-redesign/> at the top of `README.md`.

**Resolved an unverified claim:** `HANDOFF.md` Section 3 said "Cloud sessions may
not be allowed to push `.github/workflows/` (unverified)", and chose the
`/docs` Pages route to avoid it. **They can** — probe-pushed a workflow file
successfully at 11:5xZ. The `/docs` output stays committed anyway as a fallback
for the "deploy from a branch" source, which costs nothing and means either
Pages setting produces a working site.

**Not doable from here:** there is no GitHub Pages tool in this session's GitHub
access, so Pages cannot be enabled by API call from the session itself. The
workflow's `enablement: true` is the way round that; if the repository blocks it,
the owner flips one switch in Settings once.

**Next:** unchanged — the viewer (open a photo), then multi-select.
