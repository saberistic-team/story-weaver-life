
-- ============ enums ============
create type public.app_role as enum ('admin','moderator','user');
create type public.game_status as enum ('draft','waiting','active','paused','processing','completed','published','cancelled');
create type public.turn_status as enum ('pending','active','submitted','timed_out','skipped','cancelled');
create type public.visibility_mode as enum ('blind','contextual','open');
create type public.canon_mode as enum ('creator','collaborative','chaos');
create type public.polish_style as enum ('light','balanced','cinematic','disabled');
create type public.content_status as enum ('published','reported','under_review','hidden','removed');
create type public.book_status as enum ('draft','in_progress','complete','published','archived');
create type public.ai_job_status as enum ('queued','running','succeeded','failed');

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ config ============
create table public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.app_config to anon, authenticated;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
create policy "config readable" on public.app_config for select using (true);

-- ============ profiles ============
create table public.profiles (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  favorite_genres text[] not null default '{}',
  intents text[] not null default '{}',
  story_points integer not null default 0,
  level integer not null default 1,
  is_creator boolean not null default false,
  onboarded boolean not null default false,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "roles read own" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ economy ============
create table public.wallets (
  user_id uuid primary key,
  sparks integer not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.wallets to authenticated;
grant all on public.wallets to service_role;
alter table public.wallets enable row level security;
create policy "wallet read own" on public.wallets for select to authenticated using (user_id = auth.uid());

create table public.spark_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount integer not null,
  reason text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index spark_tx_user_idx on public.spark_transactions(user_id, created_at desc);
grant select on public.spark_transactions to authenticated;
grant all on public.spark_transactions to service_role;
alter table public.spark_transactions enable row level security;
create policy "sparks read own" on public.spark_transactions for select to authenticated using (user_id = auth.uid());

create table public.story_point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index sp_tx_user_idx on public.story_point_transactions(user_id, created_at desc);
grant select on public.story_point_transactions to authenticated;
grant all on public.story_point_transactions to service_role;
alter table public.story_point_transactions enable row level security;
create policy "points read own" on public.story_point_transactions for select to authenticated using (user_id = auth.uid());

create table public.achievements (
  code text primary key,
  name text not null,
  description text not null,
  icon text not null default 'sparkles',
  story_points integer not null default 0
);
grant select on public.achievements to anon, authenticated;
grant all on public.achievements to service_role;
alter table public.achievements enable row level security;
create policy "achievements public read" on public.achievements for select using (true);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  achievement_code text not null references public.achievements(code) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_code)
);
grant select on public.user_achievements to anon, authenticated;
grant all on public.user_achievements to service_role;
alter table public.user_achievements enable row level security;
create policy "user achievements public read" on public.user_achievements for select using (true);

-- ============ content ============
create table public.universes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  creator_id uuid not null,
  created_at timestamptz not null default now()
);
grant select on public.universes to anon, authenticated;
grant all on public.universes to service_role;
alter table public.universes enable row level security;
create policy "universes public read" on public.universes for select using (true);
create policy "universes creator write" on public.universes for all to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create table public.series (
  id uuid primary key default gen_random_uuid(),
  universe_id uuid references public.universes(id) on delete set null,
  slug text not null unique,
  title text not null,
  tagline text,
  description text not null default '',
  cover_url text,
  genre text not null,
  voice text,
  creator_id uuid not null,
  canon_mode public.canon_mode not null default 'creator',
  polish_style public.polish_style not null default 'balanced',
  allow_forks boolean not null default true,
  is_public boolean not null default true,
  follower_count integer not null default 0,
  reader_count integer not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index series_genre_idx on public.series(genre);
grant select on public.series to anon, authenticated;
grant insert, update, delete on public.series to authenticated;
grant all on public.series to service_role;
alter table public.series enable row level security;
create policy "series public read" on public.series for select using (is_public and status = 'published');
create policy "series creator read" on public.series for select to authenticated using (creator_id = auth.uid());
create policy "series creator write" on public.series for all to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create table public.books (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  slug text not null unique,
  title text not null,
  subtitle text,
  description text not null default '',
  cover_url text,
  sequence integer not null default 1,
  status public.book_status not null default 'published',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index books_series_idx on public.books(series_id, sequence);
grant select on public.books to anon, authenticated;
grant insert, update, delete on public.books to authenticated;
grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "books public read" on public.books for select using (status in ('published','complete','in_progress'));
create policy "books creator all" on public.books for all to authenticated
  using (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()))
  with check (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()));

create table public.games (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  host_id uuid not null,
  title text not null,
  premise text not null,
  cover_url text,
  genre text not null,
  status public.game_status not null default 'waiting',
  visibility_mode public.visibility_mode not null default 'contextual',
  is_public boolean not null default true,
  invite_only boolean not null default false,
  min_players integer not null default 2,
  max_players integer not null default 6,
  rounds integer not null default 8,
  turn_seconds integer not null default 90,
  max_chars integer not null default 400,
  ai_gm_enabled boolean not null default true,
  challenge_frequency integer not null default 3,
  polish_style public.polish_style not null default 'balanced',
  audience_voting boolean not null default true,
  reward_sparks integer not null default 25,
  canon_mode public.canon_mode not null default 'creator',
  current_round integer not null default 0,
  chapter_sequence integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index games_status_idx on public.games(status, created_at desc);
grant select on public.games to anon, authenticated;
grant insert, update on public.games to authenticated;
grant all on public.games to service_role;
alter table public.games enable row level security;
create policy "games public read" on public.games for select using (is_public);
create policy "games host read" on public.games for select to authenticated using (host_id = auth.uid());
create policy "games host write" on public.games for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "games insert own" on public.games for insert to authenticated with check (host_id = auth.uid());

create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null,
  seat_order integer not null,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (game_id, user_id),
  unique (game_id, seat_order)
);
create index game_players_game_idx on public.game_players(game_id, seat_order);
grant select on public.game_players to anon, authenticated;
grant insert, delete on public.game_players to authenticated;
grant all on public.game_players to service_role;
alter table public.game_players enable row level security;
create policy "players public read" on public.game_players for select using (true);
create policy "players join self" on public.game_players for insert to authenticated with check (user_id = auth.uid());
create policy "players leave self" on public.game_players for delete to authenticated using (user_id = auth.uid());

create table public.game_challenges (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  round integer not null default 1,
  kind text not null default 'challenge',
  text text not null,
  reward_sparks integer not null default 25,
  created_at timestamptz not null default now()
);
create index challenges_game_idx on public.game_challenges(game_id, round);
grant select on public.game_challenges to anon, authenticated;
grant all on public.game_challenges to service_role;
alter table public.game_challenges enable row level security;
create policy "challenges public read" on public.game_challenges for select using (true);

create table public.game_turns (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  round integer not null,
  turn_index integer not null,
  player_id uuid,
  challenge_id uuid references public.game_challenges(id) on delete set null,
  status public.turn_status not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (game_id, turn_index)
);
create index turns_game_idx on public.game_turns(game_id, turn_index);
grant select on public.game_turns to anon, authenticated;
grant all on public.game_turns to service_role;
alter table public.game_turns enable row level security;
create policy "turns public read" on public.game_turns for select using (true);

create table public.game_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index game_events_idx on public.game_events(game_id, created_at desc);
grant select on public.game_events to anon, authenticated;
grant all on public.game_events to service_role;
alter table public.game_events enable row level security;
create policy "events public read" on public.game_events for select using (true);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  source_game_id uuid references public.games(id) on delete set null,
  slug text not null unique,
  sequence integer not null default 1,
  title text not null,
  subtitle text,
  summary text not null default '',
  cover_url text,
  raw_content text not null default '',
  published_content text not null default '',
  is_canon boolean not null default true,
  status public.content_status not null default 'published',
  is_published boolean not null default true,
  read_count integer not null default 0,
  like_count integer not null default 0,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chapters_book_idx on public.chapters(book_id, sequence);
create index chapters_series_idx on public.chapters(series_id, sequence);
grant select on public.chapters to anon, authenticated;
grant insert, update on public.chapters to authenticated;
grant all on public.chapters to service_role;
alter table public.chapters enable row level security;
create policy "chapters public read" on public.chapters for select using (is_published and status = 'published');
create policy "chapters creator all" on public.chapters for all to authenticated
  using (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()))
  with check (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()));

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  turn_id uuid references public.game_turns(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  author_id uuid not null,
  position integer not null default 0,
  original_text text not null,
  char_count integer not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now()
);
create index contributions_game_idx on public.contributions(game_id, position);
create index contributions_chapter_idx on public.contributions(chapter_id, position);
create index contributions_author_idx on public.contributions(author_id, created_at desc);
grant select on public.contributions to anon, authenticated;
grant insert on public.contributions to authenticated;
grant all on public.contributions to service_role;
alter table public.contributions enable row level security;
create policy "contributions public read" on public.contributions for select using (status = 'published');
create policy "contributions insert own" on public.contributions for insert to authenticated with check (author_id = auth.uid());

create table public.contribution_polish_versions (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  polished_text text not null,
  style public.polish_style not null default 'balanced',
  model text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create index polish_contribution_idx on public.contribution_polish_versions(contribution_id, created_at desc);
grant select on public.contribution_polish_versions to anon, authenticated;
grant all on public.contribution_polish_versions to service_role;
alter table public.contribution_polish_versions enable row level security;
create policy "polish public read" on public.contribution_polish_versions for select using (true);

create table public.chapter_contributors (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  user_id uuid not null,
  contribution_count integer not null default 1,
  unique (chapter_id, user_id)
);
grant select on public.chapter_contributors to anon, authenticated;
grant all on public.chapter_contributors to service_role;
alter table public.chapter_contributors enable row level security;
create policy "chapter contributors public read" on public.chapter_contributors for select using (true);

-- ============ story bible ============
create table public.story_bible_entries (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  kind text not null, -- character | location | rule | timeline | mystery | canon | theme
  name text not null,
  body text not null default '',
  meta jsonb not null default '{}',
  is_approved boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index bible_series_idx on public.story_bible_entries(series_id, kind, sort_order);
grant select on public.story_bible_entries to anon, authenticated;
grant insert, update, delete on public.story_bible_entries to authenticated;
grant all on public.story_bible_entries to service_role;
alter table public.story_bible_entries enable row level security;
create policy "bible public read" on public.story_bible_entries for select using (true);
create policy "bible creator all" on public.story_bible_entries for all to authenticated
  using (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()))
  with check (exists (select 1 from public.series s where s.id = series_id and s.creator_id = auth.uid()));

-- ============ community ============
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  question text not null default 'What should happen next?',
  closes_at timestamptz,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.polls to anon, authenticated;
grant all on public.polls to service_role;
alter table public.polls enable row level security;
create policy "polls public read" on public.polls for select using (true);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  vote_count integer not null default 0,
  is_chosen boolean not null default false,
  sort_order integer not null default 0
);
grant select on public.poll_options to anon, authenticated;
grant all on public.poll_options to service_role;
alter table public.poll_options enable row level security;
create policy "poll options public read" on public.poll_options for select using (true);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
grant select, insert, update, delete on public.poll_votes to authenticated;
grant all on public.poll_votes to service_role;
alter table public.poll_votes enable row level security;
create policy "votes read own" on public.poll_votes for select to authenticated using (user_id = auth.uid());
create policy "votes write own" on public.poll_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null,
  target_type text not null, -- series | creator
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (follower_id, target_type, target_id)
);
create index follows_target_idx on public.follows(target_type, target_id);
grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;
alter table public.follows enable row level security;
create policy "follows public read" on public.follows for select using (true);
create policy "follows write own" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "follows delete own" on public.follows for delete to authenticated using (follower_id = auth.uid());

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null, -- chapter | contribution | series
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);
create index likes_target_idx on public.likes(target_type, target_id);
grant select on public.likes to anon, authenticated;
grant insert, delete on public.likes to authenticated;
grant all on public.likes to service_role;
alter table public.likes enable row level security;
create policy "likes public read" on public.likes for select using (true);
create policy "likes write own" on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes delete own" on public.likes for delete to authenticated using (user_id = auth.uid());

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null, -- chapter | series | game
  target_id uuid not null,
  body text not null,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now()
);
create index comments_target_idx on public.comments(target_type, target_id, created_at desc);
grant select on public.comments to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments public read" on public.comments for select using (status = 'published');
create policy "comments write own" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments update own" on public.comments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments delete own" on public.comments for delete to authenticated using (user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications read own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications update own" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  percent integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);
create index progress_user_idx on public.reading_progress(user_id, updated_at desc);
grant select, insert, update on public.reading_progress to authenticated;
grant all on public.reading_progress to service_role;
alter table public.reading_progress enable row level security;
create policy "progress own" on public.reading_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports insert own" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports admin read" on public.reports for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  feature text not null,
  provider text not null default 'lovable',
  model text,
  status public.ai_job_status not null default 'queued',
  error text,
  result_meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_jobs_feature_idx on public.ai_jobs(feature, created_at desc);
grant select on public.ai_jobs to authenticated;
grant all on public.ai_jobs to service_role;
alter table public.ai_jobs enable row level security;
create policy "ai jobs read own" on public.ai_jobs for select to authenticated using (user_id = auth.uid());

-- ============ realtime ============
alter table public.games replica identity full;
alter table public.game_players replica identity full;
alter table public.game_turns replica identity full;
alter table public.contributions replica identity full;
alter table public.game_events replica identity full;
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.game_players;
alter publication supabase_realtime add table public.game_turns;
alter publication supabase_realtime add table public.contributions;
alter publication supabase_realtime add table public.game_events;

-- ============ config + achievements seed ============
insert into public.app_config (key, value) values
  ('guest_free_chapters', '3'::jsonb),
  ('starter_sparks', '100'::jsonb),
  ('rewards', '{"complete_game":25,"daily_challenge":10,"selected_contribution":50,"win_game":100,"community_favorite":75,"referral":50,"finish_book":20,"vote":5,"contribution":15}'::jsonb),
  ('plans', '[{"code":"free","name":"Free","price":0,"ai_actions":20,"max_series":1,"max_players":4},{"code":"creator","name":"Creator","price":12,"ai_actions":500,"max_series":25,"max_players":12},{"code":"pro","name":"Pro Creator","price":29,"ai_actions":2500,"max_series":200,"max_players":24},{"code":"business","name":"Business","price":99,"ai_actions":10000,"max_series":1000,"max_players":50}]'::jsonb);

insert into public.achievements (code, name, description, icon, story_points) values
  ('first_chapter','First Chapter','You read your first StoryPass chapter.','book-open',10),
  ('bookworm','Bookworm','You finished an entire book.','library',50),
  ('genre_explorer','Genre Explorer','You read across five different genres.','compass',40),
  ('first_contribution','First Contribution','You wrote your first piece of a story.','pen-line',25),
  ('first_game','First Game','You played your first story game.','dices',25),
  ('five_games','Five Games','You played five story games.','flame',75),
  ('story_finisher','Story Finisher','You were there when a story reached its end.','flag',60),
  ('community_favorite','Community Favorite','A contribution of yours became a crowd favorite.','heart',80),
  ('plot_twister','Plot Twister','You landed a twist nobody saw coming.','zap',70),
  ('world_builder','World Builder','You added ten entries to a Story Bible.','globe',65);
