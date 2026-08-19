-- 1. Game-scoped tables: public games, host, or participants only
create or replace function public.game_is_visible(_game_id uuid)
returns boolean language sql stable security invoker set search_path = public as $$
  select exists (
    select 1 from public.games g
    where g.id = _game_id and (g.is_public or g.host_id = auth.uid())
  ) or exists (
    select 1 from public.game_players p
    where p.game_id = _game_id and p.user_id = auth.uid()
  )
$$;
revoke execute on function public.game_is_visible(uuid) from public;
grant execute on function public.game_is_visible(uuid) to anon, authenticated, service_role;

drop policy if exists "players public read" on public.game_players;
create policy "players visible read" on public.game_players for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_players.game_id and (g.is_public or g.host_id = auth.uid()))
  );

drop policy if exists "turns public read" on public.game_turns;
create policy "turns visible read" on public.game_turns for select
  using (public.game_is_visible(game_id));

drop policy if exists "challenges public read" on public.game_challenges;
create policy "challenges visible read" on public.game_challenges for select
  using (public.game_is_visible(game_id));

drop policy if exists "events public read" on public.game_events;
create policy "events visible read" on public.game_events for select
  using (public.game_is_visible(game_id));

-- 2. chapter_contributors: only for published chapters
drop policy if exists "chapter contributors public read" on public.chapter_contributors;
create policy "chapter contributors published read" on public.chapter_contributors for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.chapters c
      where c.id = chapter_contributors.chapter_id and c.is_published and c.status = 'published'
    )
  );

-- 3. polish versions: published contributions in public games / published chapters
drop policy if exists "polish public read" on public.contribution_polish_versions;
create policy "polish scoped read" on public.contribution_polish_versions for select
  using (
    exists (
      select 1 from public.contributions ct
      where ct.id = contribution_polish_versions.contribution_id
        and (
          ct.author_id = auth.uid()
          or (
            ct.status = 'published'
            and (
              exists (select 1 from public.chapters c where c.id = ct.chapter_id and c.is_published and c.status = 'published')
              or public.game_is_visible(ct.game_id)
            )
          )
        )
    )
  );

-- 4. story bible: approved entries of public published series
drop policy if exists "bible public read" on public.story_bible_entries;
create policy "bible approved public read" on public.story_bible_entries for select
  using (
    is_approved
    and exists (
      select 1 from public.series s
      where s.id = story_bible_entries.series_id and s.is_public and s.status = 'published'
    )
  );

-- 5. polls / poll options: public published series or chapters
drop policy if exists "polls public read" on public.polls;
create policy "polls public scoped read" on public.polls for select
  using (
    exists (select 1 from public.series s where s.id = polls.series_id and s.is_public and s.status = 'published')
    or exists (select 1 from public.chapters c where c.id = polls.chapter_id and c.is_published and c.status = 'published')
  );

drop policy if exists "poll options public read" on public.poll_options;
create policy "poll options scoped read" on public.poll_options for select
  using (exists (select 1 from public.polls p where p.id = poll_options.poll_id));

-- 6. achievements: signed-in users, or visitors for creator profiles
drop policy if exists "user achievements public read" on public.user_achievements;
create policy "user achievements auth read" on public.user_achievements for select to authenticated
  using (true);
create policy "user achievements creator read" on public.user_achievements for select to anon
  using (exists (select 1 from public.profiles pr where pr.id = user_achievements.user_id and pr.is_creator));

-- 7. has_role no longer directly executable by signed-in users
drop policy if exists "reports admin read" on public.reports;
create policy "reports admin read" on public.reports for select to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));
revoke execute on function public.has_role(uuid, public.app_role) from authenticated;