# StoryPass — Milestone 3: Social, Gamification, Notifications

Milestones 1 and 2 shipped the core loop and the depth layer. Milestone 3 makes the platform feel alive: readers react to chapters, players follow each other, the economy runs on Sparks and Story Points, and the notification center keeps everyone in the loop.

## Goals

- Turn finished chapters into conversation hubs.
- Build a lightweight, safe social graph (follow, like, comment, share, report, block).
- Make the dual-currency economy visible and meaningful.
- Surface levels, badges, and streaks across the app.
- Deliver an in-app notification center for game turns, reactions, achievements, and canon updates.

## Scope

### 1. Social reactions on chapters

- Like chapters and individual contributions.
- Comment threads on chapters with nested replies.
- Reaction counts update optimistically and sync via Realtime.
- Public "most loved" and "most discussed" sorting on series/chapter lists.

### 2. Follows and creator subscriptions (social layer)

- Follow/unfollow a series, creator, or universe.
- Follower counts on profiles and series cards.
- A "Following" feed showing new chapters, live games, and canon updates from followed series/creators.
- Email-style digest option (stored as preference; actual email in a later milestone).

### 3. Share and invite

- Copy link to chapter, book, series, or game with OG metadata.
- Invite links to live games with a short code/URL.
- Share cards generated from existing cover + title components.

### 4. Reporting and blocking

- Report chapters, comments, contributions, or users.
- Block user: hides their comments, contributions, and profile content from the blocker.
- Reports feed into a lightweight moderation queue visible to moderators and admins.

### 5. Sparks and Story Points ledgers

- `wallets` (Sparks) and `story_point_transactions` (Story Points) already exist.
- Ledger view on profile: every earn/spend with reason and link to source.
- Sparks spent to: create premium games, unlock extra polish styles, boost a chapter, tip a creator.
- Story Points earned for: contributing, completing games, getting likes, canon approvals, streaks, achievements.
- Storyteller level computed from total Story Points; public badge on profile and comments.

### 6. Achievements, streaks, and badges

- Achievement definitions already seeded in `app_config`.
- Award achievements server-side on qualifying actions.
- Daily streak tracking for reading and writing (`last_active_at` already on profiles).
- Public badges next to username in comments, game rooms, and creator cards.
- Achievement unlock toast + notification.

### 7. Notification center

- In-app notification feed using the existing `notifications` table.
- Notification types: your turn, turn submitted, game completed, chapter published, like, comment, follow, achievement unlocked, canon update, report resolution.
- Realtime badge count on the bell icon in the site header.
- Mark as read / mark all read.
- Deep link each notification to the relevant chapter, game, comment, or profile.

### 8. Community polls and votes

- Existing polls table; wire voting UI into series pages and chapter end-of-chapter CTAs.
- Poll results visible after voting or when poll closes.
- Creator can optionally canonize the winning option into the next chapter premise.

## Technical notes

- All writes (follow, like, comment, report, block, vote, notification create, achievement award) go through server functions.
- Use Supabase Realtime for live comment threads, like counts, and notification badges.
- Keep RLS tight: users can only delete their own comments/likes/follows; reports append-only; blocks are private to the blocker.
- Avoid N+1: batch like/follow state for lists; use materialized counts on series/chapter rows where needed.
- UI routes:
  - `/chapters/$slug` — add comments and reactions.
  - `/creators/$username` — add follow button and public ledger/achievements tabs.
  - `/notifications` — notification center under `_authenticated`.
  - `/following` — feed of followed content under `_authenticated`.
  - Moderation queue under `_authenticated/studio/moderation` for moderators/admins.
- Reuse existing tables: `comments`, `likes`, `follows`, `polls`, `poll_votes`, `notifications`, `reports`, `achievements`, `user_achievements`, `wallets`, `spark_transactions`, `story_point_transactions`.
- Add migrations only for columns/views needed (e.g., block list table, notification read status, user preferences).

## Out of scope for Milestone 3

- Email/push delivery (Milestone 4/5).
- Advanced feed algorithms / recommendation engine.
- Direct messaging.
- Stripe and paid plans.

## Deliverable

A social, reward-rich layer: readers react and discuss chapters, players follow creators and each other, Sparks and Story Points drive visible progression, and the notification center ties every event together.
