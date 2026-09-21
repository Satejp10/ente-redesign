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
