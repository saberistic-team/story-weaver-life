# StoryPass — Milestone 4: Creator Studio & Economy

Milestones 1–3 built the core loop, depth layer, and social fabric. Milestone 4 turns the platform into a place creators can own: a studio for managing series, chapters, and story bibles, plus the first paid layer through Stripe subscriptions.

## Goals

- Give creators a central place to manage their worlds, series, and published chapters.
- Let creators edit chapter metadata, canon status, and story bible entries.
- Introduce paid creator subscriptions through Stripe.
- Gate premium features (extra polish styles, premium games, early chapters) behind subscription tiers or Spark spend.

## Scope

### 1. Creator Studio dashboard

- Expand `/_authenticated/studio` from the moderation-only stub into a full dashboard.
- Sections: My Series, My Chapters, My Games, Story Bible, Subscribers, Earnings.
- Quick actions: create a new series, start a new canon game, edit an existing chapter.

### 2. Series management

- Create and edit series metadata: title, tagline, description, genre, voice, canon mode, polish style, cover, public/private, allow forks.
- Route: `/_authenticated/studio/series/$slug/edit` or inline from the studio index.
- Server functions: `updateSeries`, `createSeries` (under authenticated middleware, scoped to creator).

### 3. Chapter management

- List chapters the user created or contributed to.
- Edit chapter title, subtitle, summary, cover, published content, status (published/hidden/under_review), and canon flag.
- Route: `/_authenticated/studio/chapters/$slug/edit`.
- Server functions: `updateChapter`, `deleteChapter` (creator or admin only).

### 4. Story Bible editing

- Add, edit, and deprecate bible entries (characters, locations, items, lore).
- Spoiler-gate entries to specific chapters.
- Approve community-suggested bible additions (creator/moderator).
- Routes: `/_authenticated/studio/series/$slug/bible` and `/_authenticated/studio/series/$slug/bible/new`.

### 5. Stripe subscriptions

- Enable Stripe payments for the project.
- Define plans in `app_config`: free reader, supporter, patron tiers with monthly prices.
- Store Stripe customer IDs and subscription status on `profiles` or a new `subscriptions` table.
- Creator can set a series to require a paid tier for early access or bonus content.
- Checkout flow: `/_authenticated/studio/subscribe` or per-series subscribe CTA.
- Webhook endpoint at `/api/public/stripe` to handle `checkout.session.completed`, `invoice.paid`, and `customer.subscription.deleted`.

### 6. Premium gating

- Paywalled chapters show a preview and a subscribe/unlock CTA.
- Premium game creation costs Sparks or requires an active subscription.
- Extra polish styles (`cinematic`) can be unlocked with Sparks or subscription tier.

### 7. Earnings and payouts (lightweight)

- Track subscription revenue attributed to each creator.
- Studio view shows subscriber count and estimated monthly earnings.
- Full payout automation is out of scope; surface totals only.

## Technical notes

- All writes go through authenticated server functions; no direct client writes to creator-owned tables.
- Reuse existing tables: `series`, `chapters`, `story_bible_entries`, `profiles`, `app_config`.
- New tables likely needed: `subscriptions` (user_id, stripe_customer_id, stripe_subscription_id, status, tier, current_period_end, cancel_at_period_end) and `creator_earnings` (creator_id, amount, period, status).
- Stripe keys stored as secrets; webhook signature verified in the public route.
- Keep RLS tight: only series creators (or admins) can update series/chapter/bible rows.
- Add migrations for new tables and any new columns (e.g., `profiles.stripe_customer_id`, `series.required_tier`).
- UI routes:
  - `/_authenticated/studio` — dashboard.
  - `/_authenticated/studio/series/new` and `/_authenticated/studio/series/$slug/edit`.
  - `/_authenticated/studio/chapters/$slug/edit`.
  - `/_authenticated/studio/series/$slug/bible`.
  - `/_authenticated/studio/subscribers` and `/_authenticated/studio/earnings`.
  - `/api/public/stripe` — Stripe webhook.

## Out of scope for Milestone 4

- Full creator analytics and dashboards.
- Automated payout rails.
- Team/collaborator roles beyond host.
- Mobile-native creator tools.

## Deliverable

A creator-owned studio where writers manage their worlds, edit chapters and bibles, and monetize through Stripe subscriptions — while readers see clear premium gating and upgrade paths.
