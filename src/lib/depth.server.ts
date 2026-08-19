import { publicDb } from "./supabase-public.server";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
type ProfileRow = Tables["profiles"]["Row"];
type SeriesRow = Tables["series"]["Row"];
type ChapterRow = Tables["chapters"]["Row"];
type BookRow = Tables["books"]["Row"];
type BibleRow = Tables["story_bible_entries"]["Row"];
type AchievementRow = Tables["achievements"]["Row"];
type UserAchievementRow = Tables["user_achievements"]["Row"];

export type AchievementDef = {
  code: string;
  name: string;
  description: string;
  icon: string;
  story_points: number;
  kind: "contribution" | "games" | "streak" | "bible" | "canon" | "reading" | "creator";
  threshold?: number;
};

export type BibleEntry = Pick<
  BibleRow,
  "id" | "kind" | "name" | "body" | "meta" | "is_approved" | "sort_order" | "created_at" | "updated_at"
> & {
  state: Database["public"]["Enums"]["bible_entry_state"];
  visibility: Database["public"]["Enums"]["bible_entry_visibility"];
  spoiler_chapter_id: string | null;
  approved_by: string | null;
  series_slug: string;
  series_title: string;
};

export type CanonNode = {
  id: string;
  slug: string;
  title: string;
  sequence: number;
  is_canon: boolean;
  published_at: string | null;
  forked_from_chapter_id: string | null;
  forked_from_game_id: string | null;
  children: CanonNode[];
};

export type ReadingProgressItem = {
  chapter_id: string;
  series_id: string;
  percent: number;
  completed: boolean;
  updated_at: string;
};

export type ContinueReadingItem = {
  chapter_id: string;
  chapter_slug: string;
  chapter_title: string;
  chapter_sequence: number;
  series_id: string;
  series_slug: string;
  series_title: string;
  percent: number;
  completed: boolean;
  updated_at: string;
};

export type UserAchievementWithDef = UserAchievementRow & AchievementDef;

export async function fetchAchievements(): Promise<AchievementDef[]> {
  const supabase = publicDb();
  const { data, error } = await supabase.from("app_config").select("value").eq("key", "achievements").single();
  if (error || !data) return [];
  const list = data.value as unknown;
  if (!Array.isArray(list)) return [];
  return list as AchievementDef[];
}

export async function fetchBible(seriesSlug: string): Promise<BibleEntry[]> {
  const supabase = publicDb();
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id, title")
    .eq("slug", seriesSlug)
    .eq("is_public", true)
    .single();
  if (seriesError || !series) return [];

  const { data, error } = await supabase
    .from("story_bible_entries")
    .select("*")
    .eq("series_id", series.id)
    .in("state", ["canon", "spoiler"])
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    body: row.body,
    meta: row.meta,
    is_approved: row.is_approved,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    state: row.state,
    visibility: row.visibility,
    spoiler_chapter_id: row.spoiler_chapter_id,
    approved_by: row.approved_by,
    series_slug: seriesSlug,
    series_title: series.title,
  }));
}

export async function fetchBibleEntry(id: string): Promise<BibleEntry | null> {
  const supabase = publicDb();
  const { data, error } = await supabase
    .from("story_bible_entries")
    .select("*, series:series_id(slug, title)")
    .eq("id", id)
    .in("state", ["canon", "spoiler"])
    .single();
  if (error || !data) return null;
  const series = data.series as { slug: string; title: string } | null;
  return {
    id: data.id,
    kind: data.kind,
    name: data.name,
    body: data.body,
    meta: data.meta,
    is_approved: data.is_approved,
    sort_order: data.sort_order,
    created_at: data.created_at,
    updated_at: data.updated_at,
    state: data.state,
    visibility: data.visibility,
    spoiler_chapter_id: data.spoiler_chapter_id,
    approved_by: data.approved_by,
    series_slug: series?.slug ?? "",
    series_title: series?.title ?? "",
  };
}

export async function fetchCanonTree(seriesSlug: string): Promise<CanonNode[]> {
  const supabase = publicDb();
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id")
    .eq("slug", seriesSlug)
    .eq("is_public", true)
    .single();
  if (seriesError || !series) return [];

  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("id, slug, title, sequence, is_canon, published_at, forked_from_chapter_id, forked_from_game_id")
    .eq("series_id", series.id)
    .eq("is_published", true)
    .order("sequence", { ascending: true });
  if (error || !chapters) return [];

  const byId = new Map<string, CanonNode>();
  const roots: CanonNode[] = [];

  for (const c of chapters) {
    const node: CanonNode = {
      id: c.id,
      slug: c.slug,
      title: c.title,
      sequence: c.sequence,
      is_canon: c.is_canon,
      published_at: c.published_at,
      forked_from_chapter_id: c.forked_from_chapter_id,
      forked_from_game_id: c.forked_from_game_id,
      children: [],
    };
    byId.set(c.id, node);
  }

  for (const c of chapters) {
    const node = byId.get(c.id)!;
    if (c.forked_from_chapter_id && byId.has(c.forked_from_chapter_id)) {
      byId.get(c.forked_from_chapter_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function fetchBookReadState(
  bookSlug: string,
  userId?: string,
): Promise<(BookRow & { series: SeriesRow | null; chapters: (ChapterRow & { progress: ReadingProgressItem | null })[] }) | null> {
  const supabase = publicDb();
  const { data: book, error } = await supabase
    .from("books")
    .select("*, series:series_id(*)")
    .eq("slug", bookSlug)
    .single();
  if (error || !book) return null;

  const series = book.series as SeriesRow | null;

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", book.id)
    .eq("is_published", true)
    .order("sequence", { ascending: true });
  if (chaptersError || !chapters) return null;

  let progress: ReadingProgressItem[] = [];
  if (userId) {
    const chapterIds = chapters.map((c) => c.id);
    const { data: prog } = await supabase
      .from("reading_progress")
      .select("chapter_id, series_id, percent, completed, updated_at")
      .eq("user_id", userId)
      .in("chapter_id", chapterIds);
    progress = (prog as ReadingProgressItem[]) ?? [];
  }

  const progressByChapter = new Map(progress.map((p) => [p.chapter_id, p]));

  return {
    ...book,
    series,
    chapters: chapters.map((c) => ({ ...c, progress: progressByChapter.get(c.id) ?? null })),
  };
}

export async function getReadingProgress(userId: string, seriesId?: string): Promise<ReadingProgressItem[]> {
  const supabase = publicDb();
  let q = supabase
    .from("reading_progress")
    .select("chapter_id, series_id, percent, completed, updated_at")
    .eq("user_id", userId);
  if (seriesId) q = q.eq("series_id", seriesId);
  const { data, error } = await q.order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as ReadingProgressItem[];
}

export async function fetchUserAchievements(userId: string): Promise<{
  earned: UserAchievementWithDef[];
  available: (AchievementDef & { progress: number; target: number })[];
}> {
  const supabase = publicDb();
  const defs = await fetchAchievements();
  const { data: earnedRows, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  if (error) return { earned: [], available: [] };

  const earnedCodes = new Set((earnedRows ?? []).map((r) => r.achievement_code));
  const earned = (earnedRows ?? [])
    .map((r) => {
      const def = defs.find((d) => d.code === r.achievement_code);
      if (!def) return null;
      return { ...r, ...def };
    })
    .filter(Boolean) as UserAchievementWithDef[];

  // Compute progress for available achievements using public aggregates.
  const { data: profile } = await supabase.from("profiles").select("streak_days").eq("id", userId).single();
  const streakDays = profile?.streak_days ?? 0;

  const { data: gameCounts } = await supabase
    .from("game_players")
    .select("game_id")
    .eq("user_id", userId);
  const uniqueGames = new Set((gameCounts ?? []).map((g) => g.game_id)).size;

  const { data: readCounts } = await supabase
    .from("reading_progress")
    .select("chapter_id")
    .eq("user_id", userId)
    .eq("completed", true);
  const uniqueChapters = new Set((readCounts ?? []).map((r) => r.chapter_id)).size;

  const available = defs
    .filter((d) => !earnedCodes.has(d.code))
    .map((d) => {
      let progress = 0;
      switch (d.kind) {
        case "streak":
          progress = streakDays;
          break;
        case "games":
          progress = uniqueGames;
          break;
        case "reading":
          progress = uniqueChapters;
          break;
        default:
          progress = 0;
      }
      return { ...d, progress, target: d.threshold ?? 1 };
    });

  return { earned, available };
}
