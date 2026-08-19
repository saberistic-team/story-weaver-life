# StoryPass — Milestone 2: Depth

Milestone 1 shipped the core loop: discover, read, sign up, play, polish, reveal. Milestone 2 makes the platform feel like a living canon — tools for continuity, lineage, and long-form reading.

## Goals

- Give creators and players a shared memory of every story (Story Bible).
- Let stories branch while preserving what "really happened" (canon + forks).
- Turn completed chapters into books and series with real reading progression.
- Reward consistent readers and writers with streaks, achievements, and levels.

## Scope

### 1. Story Bible

A per-universe (and optionally per-series/book) reference wiki that keeps multiplayer games coherent.

- Entries: characters, locations, factions, rules/magic systems, timeline, mysteries, themes, voice notes.
- Entry state: draft / canon / deprecated / spoiler.
- Visibility: public / players-only / spoiler-gated by chapter.
- Rich text editor for descriptions and rules.
- Auto-linking: when a contribution or chapter mentions a bible entry, surface a tooltip/card.
- AI ContinuityManager can read bible entries when generating challenges or checking continuity.

### 2. Canon modes and lineage

Define what counts as "official" story and let creators approve or branch contributions.

- Canon modes per contribution/chapter: canon, alternate, apocryphal, draft.
- Forks: a chapter or game can declare itself a fork of another, with `forked_from_chapter_id` / `forked_from_game_id`.
- Lineage view: visual tree showing forks, sequels, and canon path.
- Creator/studio review queue: approve polished contributions into canon or mark as alternate.

### 3. Book assembly

Move from "a chapter is a published game" to "books are curated collections of chapters".

- Book creation UI: add/remove/reorder chapters, set front matter, dedication, cover.
- Chapter placement: link a completed game to a chapter slot in a book.
- Book reading view: continuous scroll or chapter-by-chapter, persistent progress.
- Table of contents, next/previous, "last read" bookmark.

### 4. Series pages

A richer home for a series than the Milestone 1 grid.

- Series overview: description, genre, tone, cover, creator team, stats.
- Tabbed view: books, standalone chapters, live games, community polls, bible.
- Reading order recommendations.
- "Catch up" CTA for new readers.

### 5. Reading progression

Track and resume reading across the library.

- `reading_progress` table already exists; wire it to the reader UI.
- Progress bars on books/series cards.
- "Continue reading" shelf on the home page and `/discover`.
- Mark chapters as read, bookmark favorite passages.

### 6. Streaks, achievements, and levels

Gamification layer built on the existing `achievements`, `wallets`, and `spark_transactions` tables.

- Daily/weekly streak tracking for reading and writing.
- Achievement definitions in config: first contribution, completed game, published chapter, streaks, bible edits, canon votes.
- Storyteller levels computed from Story Points + achievements.
- Public badges on profiles and creator cards.
- Notification feed when achievements unlock.

## Technical notes

- All privileged writes happen via server functions; no entitlement decisions in the browser.
- Reuse existing tables: `story_bible_entries`, `reading_progress`, `achievements`, `spark_transactions`, `story_point_transactions`.
- Add migrations only for new columns/views needed (e.g., `forked_from_chapter_id`, bible entry state/visibility, achievement definitions).
- Keep RLS tight: bible spoilers and draft entries must not leak to unauthorized readers.
- UI routes: `/universes/:slug/bible`, `/series/:slug/books`, `/books/:slug/read`, `/creators/:username/achievements`, plus studio review pages under `_authenticated`.

## Out of scope for Milestone 2

- Stripe/plans (Milestone 4).
- Full social feed, moderation queue, reports (Milestone 3 and 5).
- Advanced analytics/revenue dashboard (Milestone 5).

## Deliverable

A coherent "depth" layer: readers can follow series and books with progress; players write inside a canon-aware world; creators maintain a Story Bible and review lineage; streaks and achievements reward habit.
