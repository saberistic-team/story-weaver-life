import { publicDb } from "./supabase-public.server";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  story_points: number;
  level: number;
  is_creator: boolean;
};

export type SeriesRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  genre: string;
  voice: string | null;
  creator_id: string;
  canon_mode: string;
  follower_count: number;
  reader_count: number;
  allow_forks: boolean;
  is_public: boolean;
  required_tier: string;
};

export type ChapterRow = {
  id: string;
  slug: string;
  sequence: number;
  title: string;
  subtitle: string | null;
  summary: string;
  published_content: string;
  raw_content: string;
  read_count: number;
  like_count: number;
  published_at: string | null;
  book_id: string | null;
  series_id: string;
  source_game_id: string | null;
};

export type BookRow = {
  id: string;
  slug: string;
  series_id: string;
  title: string;
  subtitle: string | null;
  description: string;
  sequence: number;
  status: string;
  published_at: string | null;
};

export type GameRow = {
  id: string;
  series_id: string | null;
  title: string;
  premise: string;
  genre: string;
  status: string;
  visibility_mode: string;
  rounds: number;
  turn_seconds: number;
  max_chars: number;
  min_players: number;
  max_players: number;
  current_round: number;
  reward_sparks: number;
  ai_gm_enabled: boolean;
  host_id: string;
  started_at: string | null;
};

const SERIES_COLS =
  "id, slug, title, tagline, description, genre, voice, creator_id, canon_mode, follower_count, reader_count, allow_forks, is_public, required_tier";
const CHAPTER_COLS =
  "id, slug, sequence, title, subtitle, summary, published_content, raw_content, read_count, like_count, published_at, book_id, series_id, source_game_id";
const BOOK_COLS =
  "id, slug, series_id, title, subtitle, description, sequence, status, published_at";
const GAME_COLS =
  "id, series_id, title, premise, genre, status, visibility_mode, rounds, turn_seconds, max_chars, min_players, max_players, current_round, reward_sparks, ai_gm_enabled, host_id, started_at";
const PROFILE_COLS = "id, username, display_name, avatar_url, bio, story_points, level, is_creator";

async function profilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const db = publicDb();
  const { data } = await db.from("profiles").select(PROFILE_COLS).in("id", unique);
  const map: Record<string, Profile> = {};
  for (const row of (data ?? []) as unknown as Profile[]) map[row.id] = row;
  return map;
}

async function playerCounts(gameIds: string[]): Promise<Record<string, number>> {
  if (gameIds.length === 0) return {};
  const db = publicDb();
  const { data } = await db.from("game_players").select("game_id").in("game_id", gameIds);
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { game_id: string }[]) {
    counts[row.game_id] = (counts[row.game_id] ?? 0) + 1;
  }
  return counts;
}

export type LiveGame = GameRow & {
  player_count: number;
  series_slug: string | null;
  host: Profile | null;
};

async function decorateGames(games: GameRow[]): Promise<LiveGame[]> {
  const db = publicDb();
  const counts = await playerCounts(games.map((g) => g.id));
  const hosts = await profilesByIds(games.map((g) => g.host_id));
  const seriesIds = [...new Set(games.map((g) => g.series_id).filter(Boolean))] as string[];
  const { data: series } = seriesIds.length
    ? await db.from("series").select("id, slug").in("id", seriesIds)
    : { data: [] };
  const slugs: Record<string, string> = {};
  for (const s of (series ?? []) as { id: string; slug: string }[]) slugs[s.id] = s.slug;
  return games.map((g) => ({
    ...g,
    player_count: counts[g.id] ?? 0,
    series_slug: g.series_id ? (slugs[g.series_id] ?? null) : null,
    host: hosts[g.host_id] ?? null,
  }));
}

export type AppConfig = {
  guestFreeChapters: number;
  starterSparks: number;
  rewards: Record<string, number>;
  plans: {
    code: string;
    name: string;
    price: number;
    ai_actions: number;
    max_series: number;
    max_players: number;
  }[];
};

export async function fetchConfig(): Promise<AppConfig> {
  const db = publicDb();
  const { data } = await db.from("app_config").select("key, value");
  const raw: Record<string, unknown> = {};
  for (const row of (data ?? []) as { key: string; value: unknown }[]) raw[row.key] = row.value;
  return {
    guestFreeChapters: Number(raw["guest_free_chapters"] ?? 3),
    starterSparks: Number(raw["starter_sparks"] ?? 100),
    rewards: (raw["rewards"] ?? {}) as Record<string, number>,
    plans: (raw["plans"] ?? []) as AppConfig["plans"],
  };
}

export async function fetchDiscover(genre?: string, sort?: string) {
  const db = publicDb();
  let seriesQuery = db.from("series").select(SERIES_COLS);
  if (genre && genre !== "All") seriesQuery = seriesQuery.eq("genre", genre);
  seriesQuery =
    sort === "newest"
      ? seriesQuery.order("created_at", { ascending: false })
      : seriesQuery.order("reader_count", { ascending: false });

  const [{ data: series }, { data: liveRaw }, { data: chapters }, { data: creators }] =
    await Promise.all([
      seriesQuery.limit(24),
      db
        .from("games")
        .select(GAME_COLS)
        .in("status", ["active", "waiting"])
        .order("status", { ascending: true })
        .limit(12),
      db.from("chapters").select(CHAPTER_COLS).order("published_at", { ascending: false }).limit(8),
      db
        .from("profiles")
        .select(PROFILE_COLS)
        .eq("is_creator", true)
        .order("story_points", { ascending: false })
        .limit(6),
    ]);

  const seriesRows = (series ?? []) as unknown as SeriesRow[];
  const creatorMap = await profilesByIds(seriesRows.map((s) => s.creator_id));

  return {
    series: seriesRows.map((s) => ({ ...s, creator: creatorMap[s.creator_id] ?? null })),
    liveGames: await decorateGames((liveRaw ?? []) as unknown as GameRow[]),
    newChapters: (chapters ?? []) as unknown as ChapterRow[],
    creators: (creators ?? []) as unknown as Profile[],
  };
}

export async function fetchLanding() {
  const db = publicDb();
  const [{ data: series }, { data: liveRaw }, { data: stats }] = await Promise.all([
    db.from("series").select(SERIES_COLS).order("follower_count", { ascending: false }).limit(6),
    db.from("games").select(GAME_COLS).in("status", ["active", "waiting"]).limit(4),
    db.from("chapters").select("id", { count: "exact", head: true }),
  ]);
  const seriesRows = (series ?? []) as unknown as SeriesRow[];
  const creatorMap = await profilesByIds(seriesRows.map((s) => s.creator_id));
  return {
    series: seriesRows.map((s) => ({ ...s, creator: creatorMap[s.creator_id] ?? null })),
    liveGames: await decorateGames((liveRaw ?? []) as unknown as GameRow[]),
    chapterCount: (stats as unknown as { count?: number } | null)?.count ?? 40,
  };
}

export async function fetchSeries(slug: string) {
  const db = publicDb();
  const { data: series } = await db
    .from("series")
    .select(SERIES_COLS)
    .eq("slug", slug)
    .maybeSingle();
  if (!series) return null;
  const s = series as unknown as SeriesRow;

  const [{ data: books }, { data: chapters }, { data: bible }, { data: gamesRaw }, { data: poll }] =
    await Promise.all([
      db.from("books").select(BOOK_COLS).eq("series_id", s.id).order("sequence"),
      db
        .from("chapters")
        .select(
          "id, slug, sequence, title, subtitle, summary, book_id, read_count, like_count, published_at",
        )
        .eq("series_id", s.id)
        .order("sequence"),
      db
        .from("story_bible_entries")
        .select("id, kind, name, body, sort_order")
        .eq("series_id", s.id)
        .order("sort_order"),
      db.from("games").select(GAME_COLS).eq("series_id", s.id).in("status", ["active", "waiting"]),
      db
        .from("polls")
        .select("id, question, closes_at, is_open, chapter_id")
        .eq("series_id", s.id)
        .limit(1),
    ]);

  const creator = (await profilesByIds([s.creator_id]))[s.creator_id] ?? null;
  const polls = (poll ?? []) as { id: string; question: string; closes_at: string | null }[];
  let pollOptions: { id: string; text: string; vote_count: number }[] = [];
  if (polls[0]) {
    const { data } = await db
      .from("poll_options")
      .select("id, text, vote_count")
      .eq("poll_id", polls[0].id)
      .order("sort_order");
    pollOptions = (data ?? []) as typeof pollOptions;
  }

  const { count: contributorCount } = await db
    .from("chapter_contributors")
    .select("user_id", { count: "exact", head: true })
    .in(
      "chapter_id",
      ((chapters ?? []) as { id: string }[]).map((c) => c.id),
    );

  return {
    series: s,
    creator,
    books: (books ?? []) as unknown as BookRow[],
    chapters: (chapters ?? []) as unknown as Omit<
      ChapterRow,
      "published_content" | "raw_content" | "series_id" | "source_game_id"
    >[],
    bible: (bible ?? []) as { id: string; kind: string; name: string; body: string }[],
    liveGames: await decorateGames((gamesRaw ?? []) as unknown as GameRow[]),
    poll: polls[0] ? { ...polls[0], options: pollOptions } : null,
    contributorCount: contributorCount ?? 0,
  };
}

export async function fetchBook(slug: string) {
  const db = publicDb();
  const { data: book } = await db.from("books").select(BOOK_COLS).eq("slug", slug).maybeSingle();
  if (!book) return null;
  const b = book as unknown as BookRow;
  const [{ data: series }, { data: chapters }] = await Promise.all([
    db.from("series").select(SERIES_COLS).eq("id", b.series_id).maybeSingle(),
    db
      .from("chapters")
      .select("id, slug, sequence, title, subtitle, summary, read_count, like_count, published_at")
      .eq("book_id", b.id)
      .order("sequence"),
  ]);
  const s = series as unknown as SeriesRow;
  const creator = (await profilesByIds([s.creator_id]))[s.creator_id] ?? null;
  return {
    book: b,
    series: s,
    creator,
    chapters: (chapters ?? []) as {
      id: string;
      slug: string;
      sequence: number;
      title: string;
      subtitle: string | null;
      summary: string;
      read_count: number;
      like_count: number;
      published_at: string | null;
    }[],
  };
}

export async function fetchChapter(slug: string) {
  const db = publicDb();
  const { data: chapter } = await db
    .from("chapters")
    .select(CHAPTER_COLS)
    .eq("slug", slug)
    .maybeSingle();
  if (!chapter) return null;
  const c = chapter as unknown as ChapterRow;

  const [
    { data: series },
    { data: book },
    { data: siblings },
    { data: contribs },
    { data: comments },
  ] = await Promise.all([
    db.from("series").select(SERIES_COLS).eq("id", c.series_id).maybeSingle(),
    c.book_id
      ? db.from("books").select(BOOK_COLS).eq("id", c.book_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db
      .from("chapters")
      .select("id, slug, sequence, title")
      .eq("series_id", c.series_id)
      .order("sequence"),
    db
      .from("contributions")
      .select(
        "id, position, original_text, author_id, contribution_polish_versions(polished_text, style)",
      )
      .eq("chapter_id", c.id)
      .order("position"),
    db
      .from("comments")
      .select("id, body, user_id, created_at")
      .eq("target_type", "chapter")
      .eq("target_id", c.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const s = series as unknown as SeriesRow;
  type Contribution = {
    id: string;
    position: number;
    original_text: string;
    author_id: string;
    contribution_polish_versions: { polished_text: string; style: string }[];
  };
  const contributions = (contribs ?? []) as unknown as Contribution[];
  const commentRows = (comments ?? []) as unknown as {
    id: string;
    body: string;
    user_id: string;
    created_at: string;
  }[];

  const people = await profilesByIds([
    s.creator_id,
    ...contributions.map((x) => x.author_id),
    ...commentRows.map((x) => x.user_id),
  ]);

  const all = (siblings ?? []) as { id: string; slug: string; sequence: number; title: string }[];
  const index = all.findIndex((x) => x.id === c.id);

  return {
    chapter: c,
    series: s,
    book: (book as unknown as BookRow) ?? null,
    creator: people[s.creator_id] ?? null,
    seriesChapters: all,
    prev: index > 0 ? all[index - 1]! : null,
    next: index >= 0 && index < all.length - 1 ? all[index + 1]! : null,
    chapterNumber: index + 1,
    contributions: contributions.map((x) => ({
      id: x.id,
      position: x.position,
      original_text: x.original_text,
      polished_text: x.contribution_polish_versions?.[0]?.polished_text ?? null,
      author: people[x.author_id] ?? null,
    })),
    contributors: [...new Set(contributions.map((x) => x.author_id))]
      .map((id) => people[id])
      .filter(Boolean) as Profile[],
    comments: commentRows.map((x) => ({ ...x, author: people[x.user_id] ?? null })),
  };
}

export async function fetchCreator(username: string) {
  const db = publicDb();
  const { data: profile } = await db
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;
  const p = profile as unknown as Profile;

  const [{ data: series }, { data: contributions }, { data: achievements }, { count: followers }] =
    await Promise.all([
      db
        .from("series")
        .select(SERIES_COLS)
        .eq("creator_id", p.id)
        .order("follower_count", { ascending: false }),
      db
        .from("contributions")
        .select("id, original_text, created_at, chapter_id, chapters(slug, title, series_id)")
        .eq("author_id", p.id)
        .order("created_at", { ascending: false })
        .limit(12),
      db
        .from("user_achievements")
        .select("achievement_code, earned_at, achievements(name, description, icon)")
        .eq("user_id", p.id)
        .limit(12),
      db
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("target_type", "creator")
        .eq("target_id", p.id),
    ]);

  return {
    profile: p,
    series: (series ?? []) as unknown as SeriesRow[],
    contributions: (contributions ?? []) as unknown as {
      id: string;
      original_text: string;
      created_at: string;
      chapters: { slug: string; title: string } | null;
    }[],
    achievements: (achievements ?? []) as unknown as {
      achievement_code: string;
      achievements: { name: string; description: string; icon: string } | null;
    }[],
    followers: followers ?? 0,
  };
}

export async function fetchPlayableGames() {
  const db = publicDb();
  const { data } = await db
    .from("games")
    .select(GAME_COLS)
    .in("status", ["active", "waiting"])
    .order("started_at", { ascending: false, nullsFirst: false });
  return decorateGames((data ?? []) as unknown as GameRow[]);
}

export async function fetchGame(id: string) {
  const db = publicDb();
  const { data: game } = await db.from("games").select(GAME_COLS).eq("id", id).maybeSingle();
  if (!game) return null;
  const g = game as unknown as GameRow;

  const [
    { data: players },
    { data: turns },
    { data: challenge },
    { data: contribs },
    { data: series },
  ] = await Promise.all([
    db
      .from("game_players")
      .select("id, user_id, seat_order, is_host")
      .eq("game_id", g.id)
      .order("seat_order"),
    db
      .from("game_turns")
      .select("id, round, turn_index, player_id, status, starts_at, ends_at")
      .eq("game_id", g.id)
      .order("turn_index"),
    db
      .from("game_challenges")
      .select("id, kind, text, reward_sparks, round")
      .eq("game_id", g.id)
      .order("round"),
    db
      .from("contributions")
      .select("id, position, original_text, author_id, created_at")
      .eq("game_id", g.id)
      .order("position"),
    g.series_id
      ? db.from("series").select(SERIES_COLS).eq("id", g.series_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  type PlayerRow = { id: string; user_id: string; seat_order: number; is_host: boolean };
  type TurnRow = {
    id: string;
    round: number;
    turn_index: number;
    player_id: string | null;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
  };
  const playerRows = (players ?? []) as unknown as PlayerRow[];
  const contributionRows = (contribs ?? []) as unknown as {
    id: string;
    position: number;
    original_text: string;
    author_id: string;
    created_at: string;
  }[];
  const people = await profilesByIds([
    g.host_id,
    ...playerRows.map((p) => p.user_id),
    ...contributionRows.map((c) => c.author_id),
  ]);
  const turnRows = (turns ?? []) as unknown as TurnRow[];
  const activeTurn = turnRows.find((t) => t.status === "active") ?? null;

  return {
    game: g,
    series: (series as unknown as SeriesRow) ?? null,
    host: people[g.host_id] ?? null,
    players: playerRows.map((p) => ({ ...p, profile: people[p.user_id] ?? null })),
    turns: turnRows,
    activeTurn,
    challenge:
      (
        (challenge ?? []) as unknown as {
          id: string;
          kind: string;
          text: string;
          reward_sparks: number;
          round: number;
        }[]
      )[0] ?? null,
    contributions: contributionRows.map((c) => ({ ...c, author: people[c.author_id] ?? null })),
  };
}

export async function searchLibrary(q: string) {
  const db = publicDb();
  const term = `%${q}%`;
  const [{ data: series }, { data: chapters }, { data: creators }] = await Promise.all([
    db
      .from("series")
      .select(SERIES_COLS)
      .or(`title.ilike.${term},description.ilike.${term}`)
      .limit(12),
    db
      .from("chapters")
      .select("id, slug, title, summary, series_id")
      .ilike("title", term)
      .limit(12),
    db
      .from("profiles")
      .select(PROFILE_COLS)
      .or(`display_name.ilike.${term},username.ilike.${term}`)
      .eq("is_creator", true)
      .limit(8),
  ]);
  return {
    series: (series ?? []) as unknown as SeriesRow[],
    chapters: (chapters ?? []) as unknown as {
      id: string;
      slug: string;
      title: string;
      summary: string;
    }[],
    creators: (creators ?? []) as unknown as Profile[],
  };
}
