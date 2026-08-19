# StoryWeaver — Milestone 5: Polish, Performance & Advanced AI

Milestones 1–4 established the core loop, depth layer, social fabric, and creator economy. Milestone 5 is about making StoryWeaver feel fast, reliable, and magical everywhere — turning it into an app readers and writers want to keep open.

## Goals

- Improve perceived and actual performance across all routes.
- Add offline/PWA capabilities so readers can continue stories without a constant connection.
- Upgrade the AI layer with richer models, memory, and creator-controlled voice tuning.
- Harden realtime gameplay, security, and error handling.
- Finalize onboarding, empty states, and accessibility so the app feels production-ready.

## Scope

### 1. Performance & Caching

- Add TanStack Query stale-time/cache-time tuning per content type.
- Implement route-level code splitting and lazy-load heavy editor/realtime modules.
- Add server-function response caching for public discovery and series pages.
- Optimize image delivery: responsive covers, lazy loading, placeholder blur.
- Add a lightweight service-worker cache layer for static assets and read-only content.

### 2. Progressive Web App (PWA)

- Generate web app manifest (`manifest.json`) with StoryWeaver branding.
- Add installable prompt and standalone viewport meta.
- Implement offline reading: cache published chapters and reading progress locally.
- Queue writes (likes, comments, reading progress) when offline and replay when connected.
- Add app icons and splash screens for mobile home-screen launch.

### 3. Advanced AI Layer

- Integrate a stronger Lovable AI model for chapter synthesis, continuity checks, and GM challenges.
- Add AI "memory": summarize long-running series context and include it in prompts.
- Creator voice profiles: let creators define tone, pacing, and vocabulary constraints the AI respects.
- Optional AI narration / text-to-speech for published chapters.
- Fine-grained AI controls: creators can disable AI suggestions per series or per game.

### 4. Realtime & Gameplay Hardening

- Add optimistic UI for turns, votes, and reactions.
- Implement reconnection handling and missed-event replay for game rooms.
- Add presence indicators (who is typing / online) in games.
- Add server-side turn timeout fallback jobs.
- Improve error boundaries for game room crashes.

### 5. Accessibility & UX Polish

- Audit focus order, color contrast, and ARIA labels across routes.
- Add keyboard shortcuts for readers (next/previous chapter) and writers (submit turn).
- Improve empty states, loading skeletons, and error fallbacks.
- Add a guided first-time onboarding flow for new users.
- Refine mobile navigation and touch targets.

### 6. Security & Reliability

- Run a final security scan and address any new findings.
- Add rate limiting to public API routes and AI server functions.
- Add input sanitization and stricter Zod schemas for user-generated content.
- Add audit logging for creator edits, deletes, and moderation actions.
- Ensure all RLS policies and GRANTs are consistent after Milestone 4 schema changes.

### 7. SEO & Discovery Polish

- Add JSON-LD structured data for series, books, and chapters.
- Generate sitemap.xml and robots.txt.
- Add Open Graph images per series/chapter where missing.
- Improve meta descriptions and canonical URLs.

## Out of scope for Milestone 5

- Native mobile apps (iOS/Android).
- Full creator analytics suite.
- Automated payout rails.
- Multi-language localization.

## Deliverable

A polished, fast, installable StoryWeaver experience with smarter AI, robust realtime gameplay, and production-ready accessibility and SEO — ready for public launch.
