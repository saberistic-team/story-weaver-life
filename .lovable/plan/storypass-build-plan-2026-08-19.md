# StoryPass — Build Plan

StoryPass is a huge product. Building all 87 sections at once would produce a shallow shell of everything and a working version of nothing. So this plan sequences the work around the one loop that defines the product:

**Discover a story → read it free → sign up at the right moment → join the next chapter → write a few sentences → AI polishes → story reveal → read the finished chapter.**

Milestone 1 below delivers that loop end to end with real data and real multiplayer. Later milestones layer on books/series depth, social, monetization, studio, and admin.

## Milestone 1 — The core loop (this build)

**Foundation**
- Enable Lovable Cloud (database, auth, realtime, storage, server-side AI).
- Design system: dark cinematic app surface, warm paper reading surface, one magical accent, serif display + sans UI. All tokens semantic; no hardcoded colors.
- Auth: email/password + Google. Onboarding: welcome → genres → "read / play / create" → personalized picks. Starter reward (Sparks + Storyteller 1) driven by config, not hardcoded in UI.

**Public storefront (guest-first, SEO-ready)**
- `/` landing with the game visualized, not a generic SaaS page.
- `/discover`, `/series/:slug`, `/books/:slug`, `/stories/:slug`, `/chapters/:id`, `/creators/:username`.
- Real reading experience: editorial typography, chapter nav, progress, contributor attribution.
- Configurable free-chapter threshold, then a soft "create a free account to keep reading" prompt that resumes at the exact position after signup.
- Per-route metadata, canonical URLs, social images, server-rendered content.

**Multiplayer: Pass the Story**
- Game creation + lobby (cover, host, players, rules, invite, live player count).
- Turn engine where the database is authoritative: turn order, start/end times, timeouts, state machine (`draft/waiting/active/paused/processing/completed/published/cancelled`, turns `pending/active/submitted/timed_out/skipped/cancelled`).
- Realtime lobby and turn updates; a stalled player can never block a game.
- Mobile-first game screen: title, round, timer, context per visibility mode (blind/contextual/open), latest contribution, AI challenge, input + counter, submit & pass, reward preview.

**AI layer (server-side, provider-abstracted, job-backed)**
- Services: GameMaster (challenges/twists), ContributionPolisher, StoryArchitect, ContinuityManager, chapter synthesis.
- Three preserved layers: original contribution → polished version(s) → published chapter. Originals are never mutated or deleted.
- Polishing runs asynchronously after submit; gameplay never waits on AI. AI failure marks the job retryable and the game continues.
- Chapter pipeline: game complete → analysis → polish → continuity check → synthesis → draft → creator review → publish.
- "Behind the Story" reader view showing original → polished → published with attribution.

**Reveal + continuation**
- Cinematic story reveal after a game completes.
- End-of-chapter: "JOIN THE NEXT CHAPTER" / "KEEP READING" / "GET NOTIFIED", plus community vote on what happens next (creator canon by default).

**Seed data**
- Realistic fictional content: 6 creators, 8 series, 15 books, 40 chapters, 30 stories, 10 live/pending games, 50+ contributors, plus comments, likes, follows, votes, Sparks, achievements, notifications. Written as literal migration inserts. No lorem ipsum.

## Milestone 2 — Depth
Story Bible (characters, locations, rules, timeline, mysteries, canon, themes, voice), canon modes, forks with lineage, book assembly, series pages, reading progression, streaks, achievements.

## Milestone 3 — Social, gamification, notifications
Follow/like/comment/vote/share/report/block, Story Points vs Sparks ledgers, Storyteller levels and badges, in-app notification center.

## Milestone 4 — Monetization
Stripe checkout/portal, Free / Creator / Pro Creator / Business plans, centralized entitlement + AI usage limits (config-driven, never hardcoded in components).

## Milestone 5 — Creator Studio & Admin
Studio overview/analytics/revenue/AI tools; admin users, reports, moderation queue, content states, payments, AI usage, featured content.

## Technical notes

- Stack: TanStack Start (React + TypeScript), Tailwind, shadcn/ui, Lovable Cloud (Postgres, Auth, Realtime, Storage), server functions for all privileged work.
- Data model per spec, UUID keys, FKs, indexes, timestamps, `created_at`/`updated_at`. Contribution lineage (user → game → turn → contribution → polish versions → chapter placement) is never collapsed into one text blob.
- RLS on every table with explicit grants; public reads via narrow anon SELECT policies with safe-column projection; user-owned data scoped to `auth.uid()`; roles in a separate `user_roles` table with a security-definer `has_role`.
- Turn advancement, submission validation, reward calculation, and AI job dispatch all happen server-side. No secret keys or entitlement decisions in the browser.
- Public pages are top-level SSR routes; authenticated app lives under a protected layout.
- Config tables/constants for free-chapter threshold, starter rewards, Spark amounts, plan limits.

## Open question

Milestone 1 is a large but coherent build. If you'd rather see it in two passes, I can ship the public storefront + reading + conversion first, then the multiplayer + AI loop in the next pass — say the word and I'll split it.
