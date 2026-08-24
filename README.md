# Story Weaver

STORYPASS

Complete Lovable Master Build Prompt

Build a production-quality, full-stack, responsive web application called StoryPass.

Working tagline:

Start a story. Pass it on. See where it goes.

Secondary positioning:

Write a little. Create something bigger.

Core concept:

StoryPass is a social storytelling platform where people collaboratively create stories through timed games. One person starts a story, other people contribute a few sentences, the story is passed from person to person, AI introduces challenges and helps polish the writing, and the completed collaborative game becomes a polished chapter.

Multiple chapters become books.

Multiple books become series.

Series can eventually become shared fictional universes.

The platform must combine:

Public story discovery

Guest reading

Multiplayer collaborative storytelling

AI-assisted writing

AI Game Master

AI editorial polishing

Story continuity

Books and serialized fiction

Story branching/forks

Reader communities

Creator profiles

Gamification

Virtual Sparks economy

Creator subscriptions

Business experiences

Analytics

Moderation

Realtime gameplay

The most important product principle is:

Humans create the unpredictability. AI organizes, challenges, polishes, and expands it.

Do not build StoryPass as a generic AI chatbot or AI story generator.

The user should feel that they are participating in a living story with other people, not prompting an AI to write a story for them.

1. PRODUCT VISION

StoryPass should eventually become a new type of social publishing platform where:

Stories are created collaboratively.

Games create chapters.

Chapters create books.

Books create series.

Series can belong to universes.

Readers can become contributors.

Contributors can become creators.

Creators can build communities around fictional worlds.

AI helps maintain continuity across long-running stories.

Ordinary users can contribute meaningful writing without being professional writers.

Finished stories feel like real books, not transcripts of a game.

The long-term product loop is:

Discover → Read → Get invested → Sign up → Join a story → Contribute → AI Polish → Story Reveal → Read the finished chapter → Vote → Continue → Build a Book → Build a Series

2. THE MOST IMPORTANT PRODUCT INSIGHT

StoryPass has two different products connected together:

Public Story Storefront

This is where people who do not have accounts can:

Discover stories

Read stories

Explore series

Read books

Discover creators

See live games

See story statistics

Read shared content

The public storefront should be useful and compelling before registration.

Authenticated Story Playground

This is where users:

Join games

Write contributions

Earn Sparks

Vote

Comment

Follow creators

Create stories

Build series

Manage Story Bibles

Publish chapters

Build books

The product should convert users from:

Reader → Participant → Contributor → Creator

Do not force account creation before the visitor understands the product.

3. PRODUCT IDENTITY

Working brand:

StoryPass

Tagline:

Start a story. Pass it on. See where it goes.

Core emotional promise:

You don't just read the story. You become part of it.

The UI should feel:

Cinematic

Literary

Magical

Social

Modern

Playful but sophisticated

Avoid:

Generic AI startup visuals

Excessive purple gradients

Generic SaaS templates

Childish gamification

Overloaded dashboards

ChatGPT-like interfaces

The visual system should be consistent across all areas while allowing each experience to have a distinct personality.

4. EXPERIENCE PERSONALITIES

Use the same design language throughout the product, but tailor the UI by context.

Discovery

Netflix-like browsing behavior, but original visual design.

Gameplay

Immersive multiplayer game interface.

Reading

Beautiful editorial / digital-book experience.

Creation

Modern productivity interface.

Creator Studio

Professional analytics/creator workspace.

Story Reveal

Cinematic, dramatic presentation.

5. CORE CONTENT HIERARCHY

Use this hierarchy:

Universe
  ↓
Series
  ↓
Book
  ↓
Chapter
  ↓
Story Game
  ↓
Turn
  ↓
Contribution


Important distinctions:

Story Game

The multiplayer creation experience.

Contribution

The original text written by an individual player.

Chapter

The canonical literary artifact produced from a completed game.

Book

A collection of chapters.

Series

A collection of books sharing characters, world, themes, and continuity.

Universe

An optional container for multiple related series.

A story game is not the same thing as a chapter.

The game is the creation mechanism.

The chapter is the resulting artifact.

6. USER TYPES

Reader

Primarily:

Reads

Discovers

Follows creators

Likes

Comments

Votes

Completes books

Participates in community

Contributor

Primarily:

Joins collaborative games

Writes contributions

Earns Sparks

Builds Story Points

Builds reputation

Receives attribution in finished stories

Creator

Can:

Create stories

Create series

Create books

Create games

Configure Story Bible

Control canon

Configure AI

Manage community

Publish chapters

View analytics

Pro Creator

Advanced creation and audience tools.

Business

Private team/workspace experience.

Admin

Platform moderation and operations.

One normal user account can read and contribute without formally becoming a "creator."

7. AUTHENTICATION & ONBOARDING

Use Supabase Auth.

Support at minimum:

Email/password

Google OAuth

Onboarding flow:

Step 1

Welcome to StoryPass.

Step 2

Choose favorite genres.

Examples:

Mystery

Horror

Fantasy

Sci-Fi

Romance

Thriller

Comedy

Adventure

Step 3

Ask:

How do you want to use StoryPass?

Read

Play

Create

Allow multiple selections.

Step 4

Present personalized stories and live games.

Do not send a new user to an empty dashboard.

8. PUBLIC STOREFRONT / GUEST MODE

This is a mandatory part of the product.

A visitor who is not signed in must still be able to meaningfully use the product.

Allow guest users to:

Browse public stories

Read public chapters

Read books

Explore series

View creator profiles

See live games

View story statistics

View selected story branches

View public comments

View public contributor attribution

Do NOT immediately show a registration wall.

The visitor should first experience the product.

Public story pages should be indexable and optimized for sharing/search.

9. GUEST READING CONVERSION

Create configurable conversion points.

Example:

Chapter 1

Free.

Chapter 2

Free.

Chapter 3

Prompt:

You're getting close. Create a free StoryPass account to keep reading.

CTA:

Continue Reading Free

After signup:

Resume reading at the exact position

Grant configurable starter Sparks

Add Storyteller Level 1

Recommend related stories

Offer next-chapter participation

The exact chapter threshold must be configurable by the platform.

Do not hardcode a specific paywall position into UI components.

10. READ → PLAY CONVERSION

At the end of an eligible chapter:

Show:

You just read how this story unfolded.

Now help write what happens next.

CTA:

JOIN THE NEXT CHAPTER

Secondary:

KEEP READING

If the next chapter is not yet active:

GET NOTIFIED WHEN IT STARTS

If a live game is currently available:

PLAY NOW

This is one of the primary growth loops.

11. SHARING / ORGANIC ACQUISITION

Every public story, chapter, book, series, and creator profile should have clean public URLs.

When someone shares a story, the recipient lands directly on that story.

Do not redirect shared links to the homepage.

Every public content page should include:

Title

Cover

Genre

Creator

Story stats

Read CTA

Follow CTA

Join Next Chapter CTA when available

Share CTA

This should make each story page function as both:

content and acquisition funnel.

12. NEW USER STARTER REWARD

After signup, give the user a configurable starter reward.

Example:

✨ +100 Sparks

Also give:

Storyteller Level 1

Optional starter achievement:

First Story

Then immediately show:

Choose your next adventure

3 recommended stories

2 live games

1 featured creator

Do not make signup feel like a transaction.

Make it feel like unlocking participation.

13. READING PROGRESSION

Create a lightweight reader progression system.

Users can earn Story Points from meaningful activities:

Reading chapters

Completing books

Voting

Joining games

Contributing

Completing challenges

Do not reward every page view.

Do not create obvious bot farming incentives.

Use milestone-based rewards where possible.

Example achievements:

First Chapter

Bookworm

Genre Explorer

First Contribution

First Game

Five Games

Story Finisher

Community Favorite

14. READER STREAKS

Optional lightweight streak system:

3-Day Story Streak

Reward users for meaningful activity such as:

Reading a chapter

Participating in a vote

Joining a game

Writing a contribution

Do not make the product feel like a productivity tracker.

Streaks should support storytelling, not dominate it.

15. FLAGSHIP GAME: PASS THE STORY

Implement "Pass the Story" as the flagship multiplayer mode.

Example premise:

The last astronaut returned to Earth after 47 years. Everyone was waiting for her except her.

A creator configures:

Number of players

Number of rounds

Turn duration

Contribution length

Genre

Visibility

AI Game Master

Challenges

Public/private

Rewards

Community voting

Players join.

Each player receives the relevant story context and contributes.

Then the story passes to another player.

16. GAME VISIBILITY MODES

Support:

Blind

Player sees:

Premise

Minimal context

Latest contribution

Contextual

Player sees:

Premise

Story summary

Last 2–3 contributions

This is the default.

Open

Player can see the entire story history.

Creator chooses this when setting up the game.

17. GAME CONFIGURATION

Creator can define:

Title

Premise

Cover

Genre

Player minimum

Player maximum

Number of rounds

Turn duration

Maximum contribution length

Visibility mode

AI Game Master on/off

Challenge frequency

Timeout behavior

Public/private

Invite-only

Audience voting

Reward amount

Canon mode

Do not expose technical AI settings such as model temperature to normal users.

Use human-friendly controls.

18. GAME LOBBY

Show:

Cover

Story title

Host

Genre

Description

Current players

Maximum players

Rules

AI configuration summary

Start state

Invite option

Join CTA

Use live player count.

19. GAME REALTIME SYSTEM

Use Supabase Realtime.

Realtime events should include:

Player joined

Player left

Game started

Turn started

Contribution submitted

Turn completed

Turn timed out

Game completed

Game paused

Game resumed

The server/database must be authoritative for:

Turn order

Turn start

Turn end

Game status

Do not rely solely on the client's clock.

20. TURN STATES

Use:

pending
active
submitted
timed_out
skipped
cancelled


Game states:

draft
waiting
active
paused
processing
completed
published
cancelled


21. TIMEOUT BEHAVIOR

If a user fails to submit:

Mark turn timed_out

Advance the game

Lock the turn

Do not award normal contribution rewards

Optionally invoke AI bridge behavior if enabled

Record the event

A player must never be able to block the game indefinitely.

If a game host disconnects, the game must remain recoverable.

22. GAME SCREEN

This is the highest-priority screen in the entire application.

It should be immersive and distraction-free.

Example:

THE LAST TRAIN

Round 7 / 12

Maya looked at the clock.

11:47 PM.

The train had already left.


YOUR TURN

00:47


[ Continue the story... ]


✨ Challenge
Include a secret in your turn.

+25 Sparks


[ SUBMIT & PASS → ]


Show:

Story title

Round

Timer

Relevant story context

Latest contribution

AI challenge

Input field

Character count

Submit CTA

Reward preview

Progress

Optimize this screen for mobile.

23. AI GAME MASTER

Create a dedicated AI service abstraction for the Game Master.

It can:

Generate story starters

Generate twists

Generate challenges

Introduce constraints

Control pacing

Create genre-specific events

Detect repetitive patterns

Suggest tension

Create special rounds

Examples:

TWIST: Someone in the story is lying.

CHALLENGE: Introduce a new character without naming them.

CHALLENGE: End your contribution with a question.

AI challenges are stored as first-class game entities.

AI must never silently rewrite a player's contribution during gameplay.

24. THE CRITICAL AI FEATURE: CONTRIBUTION POLISHING

This is a core MVP feature.

When a user submits a contribution, preserve three layers.

Layer 1 — Original Contribution

The exact text written by the user.

Never alter it.

Layer 2 — AI Polished Contribution

An AI-assisted version that improves:

Grammar

Clarity

Flow

Sentence structure

Readability

Literary polish

while preserving:

Meaning

Key ideas

Intent

Story facts

Author attribution

Layer 3 — Published Chapter

The final chapter after all contributions have been synthesized.

The data model must preserve all three.

Conceptually:

Original Contribution
        ↓
AI Polished Contribution
        ↓
Published Chapter


25. CONTRIBUTION POLISHING UX

Do not interrupt gameplay unnecessarily.

Recommended behavior:

Player submits contribution.

Game continues immediately.

AI polishing happens asynchronously.

User can later view:

Original

and

Polished

The player can optionally review/edit the polished version when appropriate.

Creators should be able to configure whether polishing is:

automatic

suggested

disabled

Default:

Automatic backstage polishing, with no interruption to gameplay.

26. POLISHING STYLES

Creators can choose:

Light

Grammar and clarity only.

Balanced

Improve readability and narrative flow while preserving voice.

Cinematic

More expressive literary editing.

Do not let Cinematic mode invent major new story events.

27. VOICE PRESERVATION

The AI should not make all users sound the same.

The Story Bible should include optional:

Series Voice

Examples:

dark

humorous

restrained

lyrical

conversational

fast-paced

atmospheric

As the series grows, approved chapters should inform the editorial style.

AI should preserve the creator's and series' established voice.

28. "BEHIND THE STORY"

Create a dedicated reader experience showing how a chapter was made.

Example:

ORIGINAL

Maya opened the door and the guy from the train was there...

        ↓

AI POLISHED

Maya opened the door.

The man from the train stood on the other side.

He was smiling.

        ↓

PUBLISHED

Maya opened the door.

The man from the train stood on the other side.

He was smiling.

But he was not the same man she remembered.


Label contributor attribution clearly.

This experience turns the creation process into content.

It should be accessible through:

How It Was Created

or

Behind the Story

29. AI STORY ARCHITECT

Provide creators with an AI Story Architect.

It can help generate:

Premises

Titles

Genres

Tone

Characters

Locations

Conflicts

Plot possibilities

Chapter ideas

Story arcs

Future directions

All generated material must be editable.

Do not automatically make AI suggestions canonical.

30. AI CONTINUITY MANAGER

Continuity system should check:

Character facts

Relationships

Location facts

Timeline

World rules

Canon events

Open mysteries

If a contribution conflicts with established information:

Show:

⚠️ Continuity Note

Then:

Keep

Edit

Ask AI to revise

Do not silently reject contributions.

31. STORY BIBLE

Each serious series has a Story Bible.

Sections:

Characters

name

description

personality

relationships

status

first appearance

important events

Locations

name

description

significance

World Rules

rules

constraints

technology

magic

historical facts

Timeline

chronological events

Mysteries

unresolved questions

Canon

approved facts

approved events

Themes

themes

tone

voice

Creators can manually edit everything.

AI can suggest updates.

Canonical changes require creator approval.

32. CANON CONTROL

Support:

Creator

Creator decides canon.

Collaborative

Community voting influences canon.

Chaos

Community has substantial influence.

Default:

Creator

The mode should be configurable per series.

AI can recommend.

AI cannot independently declare canon.

33. COMMUNITY STORY VOTING

At the end of a chapter:

WHAT SHOULD HAPPEN NEXT?

Example:

Maya discovers the hidden station — 42%

Daniel disappears — 31%

The train changes reality — 27%

Support:

vote

change vote before deadline

vote closing

final result

creator decision

Creator may:

Follow Community

or

Override

Record the decision.

34. FORKING / ALTERNATE STORIES

Creators can enable or disable forks.

Users can fork eligible stories.

Types:

Private Fork

Visible only to the fork creator.

Public Fork

A public alternate branch.

Maintain lineage:

Story
 └── Chapter 8
      ├── Canon
      ├── Fork A
      └── Fork B


Store:

parent story/chapter

fork creator

fork time

branch name

branch description

A fork should retain its history.

35. CHAPTER CREATION PIPELINE

When a game completes:

Game Complete
      ↓
AI Analysis
      ↓
Contribution Polishing
      ↓
Continuity Check
      ↓
Narrative Synthesis
      ↓
Draft Chapter
      ↓
Creator Review
      ↓
Canonical Chapter


Creator options:

Accept

Edit

Regenerate

Reorder

Publish

Archive

Never delete the original contributions as part of this process.

36. CHAPTER DATA

Each chapter should contain:

title

subtitle

summary

cover

sequence number

raw content

published content

source game

contributors

canonical status

book

series

creation date

publication date

37. BOOK CREATION

Creator can select chapters and create:

BOOK ONE

Book contains:

title

subtitle

description

cover

chapters

author

contributors

series

status

publication date

Statuses:

draft
in_progress
complete
published
archived


Reading a book should feel like reading a coherent digital book rather than browsing individual game turns.

38. SERIES CREATION

Series contains:

title

description

cover

creator

books

Story Bible

followers

contributors

analytics

canonical decisions

When creating Book 2:

AI should automatically use the existing Story Bible and previous canonical content for context.

39. UNIVERSES

Support a lightweight Universe entity.

Example:

The Last Train Universe

  The Last Train
  The Conductor
  The Forgotten Station


Universes should be architecturally supported but not overbuilt in MVP.

40. READING EXPERIENCE

The reading interface should feel like a premium digital book.

Use:

editorial typography

comfortable line length

clean margins

chapter navigation

reading progress

table of contents

author

contributor attribution

Primary views:

Published Story

How It Was Created

Do not clutter reading mode with social UI.

41. SERIES PAGE

Show:

cinematic hero

cover

title

description

genre

creator

follower count

books

chapters

contributors

community statistics

Primary actions:

START READING

JOIN THE STORY

Secondary:

FOLLOW

FORK

SHARE

42. HOMEPAGE / DISCOVERY

Authenticated home should include:

Continue Reading

🔴 Live Now

Trending Stories

Trending Series

Recommended For You

New Stories

Popular Creators

Games For You

Completed Books

Community Favorites

Live games should show:

title

genre

players

maximum players

status

time

join CTA

43. SEARCH

Search across:

stories

books

series

creators

Filters:

genre

live now

newest

trending

completed

creator

44. CREATOR PROFILE

Display:

avatar

name

bio

Story Level

followers

following

series

books

stories

achievements

recent contributions

Separate:

Created

from:

Contributed To

This distinction is important.

45. CREATOR STUDIO

Navigation:

Overview

Stories

Series

Books

Games

Story Bible

Community

Analytics

Revenue

AI Tools

Settings

Dashboard metrics:

readers

active games

contributors

published chapters

followers

engagement

Sparks generated

subscribers

top stories

Use real data.

46. STORY BUILDER

Create a guided creation workflow.

Step 1

Choose:

Story

Series

Game

Step 2

Enter premise.

Step 3

AI Story Architect proposes:

title

genre

tone

characters

setting

central conflict

possible story direction

Step 4

Creator edits.

Step 5

Create Story Bible.

Step 6

Configure story control:

creator

collaborative

chaos

Step 7

Configure AI.

Step 8

Create first game.

47. GAME CREATOR

Creator configuration:

title

premise

cover

genre

player count

rounds

turn duration

contribution length

visibility

AI Game Master

challenge frequency

timeout behavior

rewards

public/private

invite-only

community voting

story control

48. SOCIAL FEATURES

Support:

Follow

Like

Comment

Vote

Share

Fork

Invite

Report

Block

Do not build a generic social-media feed.

Stories and games are the center of the social graph.

49. NOTIFICATIONS

Support notifications for:

Game starting

Your turn

Game completed

Contribution selected

Chapter published

Story forked

New follower

Comment

Like

Vote closing

Book completed

New chapter from followed series

Followed creator goes live

Create an in-app notification center.

50. GAMIFICATION

Create:

Story Points

Used for progression.

Sparks

Used as in-app currency.

Keep them distinct.

Story Points = reputation/progression.

Sparks = spendable virtual currency.

51. SPARKS ECONOMY

Example configurable rewards:

ActivitySparksComplete game+25Daily challenge+10Selected contribution+50Win a story game+100Community favorite+75Referral+50

Possible spending:

AI generation

Premium game participation

Special challenges

Story boosts

AI character interactions

Cosmetic features

Do not make Sparks cash-redeemable in MVP.

Do not represent Sparks as real currency.

Create a real transaction ledger.

52. READER REWARDS

Meaningful behavior should receive modest rewards.

Examples:

Finish a book

Participate in a vote

Join a game

Complete first contribution

Complete genre challenge

Avoid paying users simply for generating page views.

53. STORYTELLER REPUTATION

Create levels:

Storyteller 1 → Storyteller 50

Users gain Story Points through:

Completing games

Good contributions

Reader likes

Community participation

Winning competitions

Completing challenges

Badges:

Horror Master

Mystery Master

Plot Twister

Comedy Writer

World Builder

Collaboration Pro

Visual style should remain sophisticated.

54. SUBSCRIPTIONS

Implement configurable Stripe plans.

FREE

Public reading

Limited games

Limited AI

Basic profile

Follow creators

Earn Sparks

Limited story creation

CREATOR

Increased AI

Unlimited stories

Unlimited series

Story Bible

Advanced Game Master

Larger games

Private games

Creator analytics

Custom covers

Advanced creation controls

PRO CREATOR

Everything above plus:

Advanced AI

AI characters

Larger experiences

Advanced analytics

Creator branding

Subscriber-only stories

Advanced monetization infrastructure

Collaboration tools

BUSINESS

Private workspace

Team members

Private stories

Private games

Branding

Usage management

Admin controls

Analytics

Prices and limits must be configurable.

Do not hardcode plan names/prices throughout components.

55. STRIPE

Use Stripe for:

Checkout

Upgrade

Downgrade

Cancellation

Billing portal

Subscription synchronization

Payment status

Never store raw card information.

Build a centralized entitlement layer.

56. FUTURE CREATOR ECONOMY

Architect for future:

Premium stories

Paid games

Creator memberships

Tips

Story packs

AI characters

Story worlds

Creator revenue sharing

Do not require complicated payout/royalty mechanics for MVP.

57. CONTRIBUTOR ATTRIBUTION

Every contribution must permanently preserve:

contributor

game

turn

chapter

original text

polished text

timestamp

Finished chapters should show:

Created by Sarah
Written collaboratively by 24 contributors

Every contributor should have a contribution history.

58. CREATOR / COMMUNITY OWNERSHIP MODEL

For the product architecture and MVP:

Creator owns/manages the Series.

Contributors receive attribution.

Contributions are licensed through platform terms for collaborative story creation.

Avoid implementing complicated fractional IP ownership or royalties in MVP.

Architect contribution records so future revenue-sharing can be added.

Do not present legal ownership mechanics as settled legal advice.

59. MODERATION

Public collaborative content requires moderation.

Implement:

Report user

Report story

Report contribution

Block user

Moderation queue

Content status

User suspension

Content removal

AI moderation abstraction

Content states:

published
reported
under_review
hidden
removed


60. ADMIN DASHBOARD

Create real admin functionality.

Sections:

Users

Stories

Series

Books

Games

Reports

Payments

Subscriptions

AI Usage

Sparks

Story Points

Featured Content

Settings

Admin actions:

Search user

Suspend user

Review content

Remove content

Feature story

Feature creator

Adjust Sparks

Inspect subscriptions

Inspect AI usage

Inspect game state

61. BUSINESS WORKSPACE

Create an organization model.

Support conceptually:

Organization

Members

Roles

Private stories

Private games

Usage tracking

Branding

Do not overbuild enterprise infrastructure.

Structure the model for future SSO and enterprise integrations.

62. DATA MODEL

Use PostgreSQL.

Core tables/entities:

users
profiles

subscription_plans
subscriptions
entitlements

wallets
spark_transactions
story_points_transactions

achievements
user_achievements

universes
series
books
chapters

stories
story_versions
story_forks

games
game_players
game_turns
game_challenges
game_events
game_results

contributions
contribution_polish_versions

characters
locations
story_rules
timeline_events
story_mysteries
canon_events
story_themes
story_voice

follows
likes
comments
votes
notifications
reports
blocks

creator_products
purchases
creator_earnings

organizations
organization_members

ai_jobs
ai_usage

admin_actions


Use UUIDs.

Add:

foreign keys

indexes

created_at

updated_at

appropriate unique constraints

63. IMPORTANT DATA MODEL RELATIONSHIP

A contribution must retain lineage.

Conceptually:

User
 ↓
Game
 ↓
Turn
 ↓
Contribution
 ├── Original Text
 ├── AI Polished Version(s)
 └── Chapter Placement


A chapter must retain:

Chapter
 ├── Source Game
 ├── Raw Contributions
 ├── Published Content
 ├── Contributors
 └── Canon Status


Never collapse these into a single text blob.

64. REALTIME ARCHITECTURE

Use Supabase Realtime for multiplayer state.

The database is the source of truth.

Use server-side actions/functions where needed to:

Advance turns

Validate submissions

enforce limits

calculate rewards

trigger AI jobs

synchronize game states

65. AI ARCHITECTURE

Create an abstraction layer so models/providers can be changed.

Services:

StoryArchitect
GameMaster
ContinuityManager
ContributionPolisher
StoryEditor
CharacterAgent
Narrator


Persist AI requests as jobs.

Track:

user

feature

provider

model

tokens/usage if available

status

timestamps

result metadata

Do not call AI APIs directly from browser code using secret keys.

66. AI FAILURE HANDLING

AI operations should be asynchronous where appropriate.

If AI is unavailable:

Do not block gameplay.

Store original contribution.

Mark AI job failed/retryable.

Allow game to continue.

Allow chapter processing to retry.

AI must enhance the experience, not become a single point of failure for gameplay.

67. AI USAGE LIMITS

Centralize feature entitlements.

Example:

FREE:

Limited AI actions.

CREATOR:

Higher AI allowance.

PRO CREATOR:

Higher allowance.

BUSINESS:

Organization-level allowance.

Do not hardcode usage limits inside individual components.

68. SEARCH ENGINE OPTIMIZATION

Public pages should be SEO-friendly.

Optimize:

Story pages

Series pages

Book pages

Creator pages

Each page should have:

title metadata

description metadata

canonical URL

social image

structured content where appropriate

Public story pages should render meaningful content even before JavaScript finishes loading where practical.

69. LANDING PAGE

Hero:

START A STORY.

PASS IT ON.

SEE WHERE IT GOES.

Supporting statement:

Collaborative stories built one turn at a time by people and AI.

Primary:

PLAY A STORY

Secondary:

CREATE A STORY

Show a visual representation of the game.

Sections:

How it works

Read stories

Live games

AI Game Master

AI-powered polishing

Books and series

Story branching

Creator experience

Plans

Final CTA

Do not make the page feel like a generic AI SaaS landing page.

70. PUBLIC STORY PAGE

A public story page should include:

Cover

Title

Genre

Description

Creator

Contributor count

Reader count

Likes

Chapter information

Read CTA

Follow CTA

Next chapter CTA

Join game CTA when relevant

Share CTA

For unauthenticated visitors:

Allow substantial reading before signup.

71. GROWTH LOOP

Build this intentionally:

Search / Social / Shared Link
        ↓
Public Story Page
        ↓
Read
        ↓
Get Emotionally Invested
        ↓
Signup Prompt at Meaningful Threshold
        ↓
Signup
        ↓
Starter Sparks
        ↓
Onboarding
        ↓
Join Next Chapter
        ↓
Contribute
        ↓
AI Polish
        ↓
Story Reveal
        ↓
Finished Chapter
        ↓
Book
        ↓
Series
        ↓
Follow Creator
        ↓
Invite Friend / Share


Treat this as a first-class product loop.

72. DEMO / SEED DATA

The first build must not feel empty.

Create realistic fictional seed data.

At minimum:

6 creators

8 series

15 books

40 chapters

30 stories

10 live/pending games

50+ fictional users/contributors

comments

likes

followers

achievements

Sparks

Story Points

notifications

votes

Genres:

Mystery

Horror

Sci-Fi

Fantasy

Romance

Thriller

Comedy

Adventure

Use real-feeling fictional content.

Never use lorem ipsum.

73. EMPTY STATES

Examples:

No Stories

Your next story starts here.

Create Story

No Games

No live stories right now.

Browse Stories

No Followers

Your first readers are out there.

No Chapters

Your first chapter starts with one contribution.

Empty states should be helpful and action-oriented.

74. ERROR STATES

Create friendly error states for:

Game disconnected

Turn expired

AI unavailable

Story unavailable

Permission denied

Payment failed

Subscription inactive

Network issue

Content removed

Do not expose raw technical errors.

75. MOBILE

This is a responsive web application.

Gameplay must be mobile-first.

Desktop navigation:

Home
Discover
Play
Library
Create
----------------
Following
My Stories
My Series
----------------
Sparks
Profile


Mobile bottom navigation:

Home
Play
Create
Library
Profile


Top bar:

search

notifications

profile

76. VISUAL DESIGN

Base interface:

Dark cinematic environment.

Reading surface:

Warm cream / paper-like surface.

Primary accent:

One distinctive magical accent color.

Typography:

Serif for story titles

Sans-serif for application UI

Use restrained animation.

Use motion primarily for:

Turn changes

Live status

Story reveal

Rewards

Navigation transitions

Do not overanimate.

77. ACCESSIBILITY

Implement:

semantic HTML

keyboard navigation

visible focus

accessible forms

sufficient contrast

accessible controls

reduced motion support

meaningful alt text

78. PERFORMANCE

Prioritize:

fast initial load

lazy loading

optimized images

pagination

efficient database queries

selective realtime subscriptions

Do not load entire books or story histories unnecessarily.

79. SECURITY

Use:

Supabase Row Level Security

server-side authorization

protected admin routes

secure secrets

server-side AI operations

server-side Stripe operations

input validation

rate limiting where practical

Never trust client-only entitlement checks.

80. ROUTES

Create a coherent route structure.

Public:

/
 /discover
 /stories/:slug
 /series/:slug
 /books/:slug
 /chapters/:id
 /creators/:username
 /pricing
 /login
 /signup


Authenticated:

/home
/play
/live
/library
/following
/profile
/notifications
/wallet
/create


Game:

/game/:id
/game/:id/play
/game/:id/reveal


Creation:

/create/story
/create/series
/create/game


Creator:

/creator
/creator/stories
/creator/series
/creator/books
/creator/games
/creator/story-bible/:id
/creator/analytics
/creator/revenue
/creator/settings


Admin:

/admin
/admin/users
/admin/stories
/admin/series
/admin/games
/admin/reports
/admin/payments
/admin/ai


81. TECHNICAL STACK

Use:

Frontend

React

TypeScript

Tailwind CSS

shadcn/ui

Backend

Supabase

PostgreSQL

Supabase Auth

Supabase Storage

Supabase Realtime

server-side functions/actions as needed

Payments

Stripe

AI

Provider abstraction.

The architecture should support swapping models/providers without redesigning the application.

82. ENGINEERING PRINCIPLES

Use:

TypeScript

reusable components

modular services

strongly typed database access

centralized entitlement logic

structured AI interfaces

database-backed state

proper loading/error states

clear separation of presentation/business logic

Avoid:

giant components

duplicated logic

client-only business rules

fake metrics

fake API calls

hardcoded story data

hardcoded subscription limits

secret keys in frontend code

83. WHAT NOT TO BUILD IN MVP

Do not overbuild:

native mobile apps

crypto

NFTs

complex royalties

fractional IP ownership

marketplace payouts

advanced recommendation ML

enterprise SSO

complex voice generation

full character marketplace

massive-scale multiplayer

sophisticated external messaging

Architect for future expansion but keep the first product focused.

84. MVP SUCCESS CRITERIA

The product is successful if these flows work end to end.

Visitor

Can:

Land on public content.

Discover a story.

Read meaningful content without signup.

Reach a compelling signup moment.

Create an account.

Receive starter Sparks.

Continue reading.

Discover the next chapter.

Reader

Can:

Discover stories.

Read books.

Follow creators.

Vote.

Comment.

Join a game.

Contributor

Can:

Join a live game.

Receive a turn.

Write a contribution.

Submit it.

Earn Sparks.

Retain original attribution.

View AI-polished version.

See the finished chapter.

Creator

Can:

Create series.

Create Story Bible.

Configure game.

Launch game.

Run multiplayer turns.

View contributions.

Process them with AI.

Review chapter.

Publish chapter.

Add chapter to book.

Launch next chapter.

Paid User

Can:

Subscribe through Stripe.

Receive entitlements.

Use premium features.

Manage subscription.

Admin

Can:

Manage users.

Review reports.

Moderate stories.

Inspect games.

View subscriptions.

Adjust Sparks.

Manage featured content.

85. PRIORITY ORDER

Build in this order:

Phase 1 — Foundation

Supabase

Auth

Database

RLS

Design system

Routing

Seed data

Phase 2 — Public Story Storefront

Landing page

Discovery

Public story pages

Reading experience

SEO

Guest reading

Signup conversion

Phase 3 — Core Multiplayer Loop

Game creation

Lobby

Realtime players

Turns

Timer

Contributions

Game completion

Phase 4 — AI Story System

AI Game Master

Contribution Polisher

Story Architect

Continuity Manager

Story Bible

Chapter synthesis

Phase 5 — Books & Series

Chapters

Books

Series

Reading progression

Story reveal

Behind the Story

Phase 6 — Social & Gamification

Profiles

Following

Likes

Comments

Voting

Story Points

Sparks

Achievements

Notifications

Phase 7 — Monetization

Stripe

Free

Creator

Pro Creator

Business entitlements

Phase 8 — Creator Studio

Analytics

Revenue UI

Advanced settings

Story controls

Phase 9 — Admin

Users

Reports

Moderation

Billing

AI usage

Featured content

86. THE CORE EXPERIENCE MUST NEVER BE LOST

The application can become very large, but always preserve this fundamental loop:

READ
 ↓
GET CURIOUS
 ↓
JOIN
 ↓
WRITE A LITTLE
 ↓
PASS IT ON
 ↓
AI POLISHES
 ↓
WATCH THE STORY REVEAL
 ↓
READ THE FINISHED CHAPTER
 ↓
HELP CREATE THE NEXT ONE


The user should feel:

"I just helped write a real story."

The creator should feel:

"I am directing a living story with a community."

The reader should feel:

"I can either read this world or step inside it."

The product should make all three experiences obvious.

87. FINAL PRINCIPLE

Do not optimize the first build for feature count.

Optimize it for one extraordinary loop:

A stranger discovers a story, reads it, becomes invested, signs up, joins the next chapter, writes a few sentences, AI helps polish those sentences, the story becomes a beautiful chapter, and the user gets to see their contribution inside a real book.

That is the StoryPass product.

Build the entire application architecture around making that experience excellent.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://story-weaver-life.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/48218845-6395-4e7f-b751-6e9fbe8bc571).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
