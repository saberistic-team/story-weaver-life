import { publicDb } from "./supabase-public.server";
import type { Database, Json } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient<Database>;

async function admin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

export type StudioSeries = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  genre: string;
  voice: string | null;
  canon_mode: Database["public"]["Enums"]["canon_mode"];
  polish_style: Database["public"]["Enums"]["polish_style"];
  allow_forks: boolean;
  is_public: boolean;
  required_tier: string;
  created_at: string;
  updated_at: string;
};

export type StudioChapter = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  is_published: boolean;
  status: Database["public"]["Enums"]["content_status"];
  is_canon: boolean;
  published_at: string | null;
  created_at: string;
};

export type StudioBibleEntry = Database["public"]["Tables"]["story_bible_entries"]["Row"];

export async function fetchStudioDashboard(userId: string): Promise<{
  series: StudioSeries[];
  chapters: StudioChapter[];
  earnings: { period: string; amount_cents: number; status: string }[];
}> {
  const db = publicDb();
  const [{ data: series }, { data: chapters }, { data: earnings }] = await Promise.all([
    db.from("series").select("*").eq("creator_id", userId).order("updated_at", { ascending: false }),
    db
      .from("chapters")
      .select("*")
      .or(`series_id.in.(select id from series where creator_id = eq.${userId}),source_game_id.in.(select game_id from game_players where user_id = eq.${userId})`)
      .order("updated_at", { ascending: false })
      .limit(50),
    db.from("creator_earnings").select("period, amount_cents, status").eq("creator_id", userId).order("period", { ascending: false }).limit(12),
  ]);
  return {
    series: (series ?? []) as StudioSeries[],
    chapters: (chapters ?? []) as StudioChapter[],
    earnings: (earnings ?? []) as { period: string; amount_cents: number; status: string }[],
  };
}

export async function fetchStudioSeries(userId: string, slug: string): Promise<StudioSeries | null> {
  const db = publicDb();
  const { data, error } = await db.from("series").select("*").eq("slug", slug).eq("creator_id", userId).maybeSingle();
  if (error || !data) return null;
  return data as StudioSeries;
}

export async function fetchStudioChaptersForSeries(userId: string, seriesId: string): Promise<StudioChapter[]> {
  const db = publicDb();
  const { data, error } = await db
    .from("chapters")
    .select("*")
    .eq("series_id", seriesId)
    .order("sequence", { ascending: true });
  if (error || !data) return [];
  return data as StudioChapter[];
}

export async function fetchStudioBible(seriesId: string): Promise<StudioBibleEntry[]> {
  const db = publicDb();
  const { data, error } = await db
    .from("story_bible_entries")
    .select("*")
    .eq("series_id", seriesId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as StudioBibleEntry[];
}

export async function createSeries(
  userId: string,
  input: {
    title: string;
    tagline?: string | undefined;
    description: string;
    genre: string;
    voice?: string | undefined;
    canon_mode?: Database["public"]["Enums"]["canon_mode"];
    polish_style?: Database["public"]["Enums"]["polish_style"];
    allow_forks?: boolean;
    is_public?: boolean;
    required_tier?: string;
  },
): Promise<{ id: string; slug: string }> {
  const db = await admin();
  const title = input.title.trim().slice(0, 120);
  const base = slugify(title) || "series";
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const { data: taken } = await db.from("series").select("id").eq("slug", slug).maybeSingle();
    if (!taken) break;
    slug = `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const insert: Database["public"]["Tables"]["series"]["Insert"] = {
    creator_id: userId,
    slug,
    title,
    tagline: input.tagline?.trim() ?? null,
    description: input.description.trim(),
    genre: input.genre.trim(),
    voice: input.voice?.trim() ?? null,
    canon_mode: input.canon_mode ?? "collaborative",
    polish_style: input.polish_style ?? "balanced",
    allow_forks: input.allow_forks ?? true,
    is_public: input.is_public ?? true,
    required_tier: input.required_tier ?? "free",
  };

  const { data, error } = await db.from("series").insert(insert).select("id, slug").maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Could not create series");
  return { id: data.id, slug: data.slug };
}

export async function updateSeries(
  userId: string,
  seriesId: string,
  input: {
    title?: string;
    tagline?: string | undefined;
    description?: string;
    genre?: string;
    voice?: string | undefined;
    canon_mode?: Database["public"]["Enums"]["canon_mode"];
    polish_style?: Database["public"]["Enums"]["polish_style"];
    allow_forks?: boolean;
    is_public?: boolean;
    required_tier?: string;
  },
): Promise<{ ok: boolean }> {
  const db = await admin();
  const { data: existing } = await db.from("series").select("creator_id").eq("id", seriesId).maybeSingle();
  if (!existing || existing.creator_id !== userId) throw new Error("Forbidden");

  const update: Database["public"]["Tables"]["series"]["Update"] = {};
  if (input.title !== undefined) update["title"] = input.title.trim().slice(0, 120);
  if (input.tagline !== undefined) update["tagline"] = input.tagline?.trim() ?? null;
  if (input.description !== undefined) update["description"] = input.description.trim();
  if (input.genre !== undefined) update["genre"] = input.genre.trim();
  if (input.voice !== undefined) update["voice"] = input.voice?.trim() ?? null;
  if (input.canon_mode !== undefined) update["canon_mode"] = input.canon_mode;
  if (input.polish_style !== undefined) update["polish_style"] = input.polish_style;
  if (input.allow_forks !== undefined) update["allow_forks"] = input.allow_forks;
  if (input.is_public !== undefined) update["is_public"] = input.is_public;
  if (input.required_tier !== undefined) update["required_tier"] = input.required_tier;

  const { error } = await db.from("series").update(update).eq("id", seriesId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateChapter(
  userId: string,
  chapterId: string,
  input: {
    title?: string;
    subtitle?: string | undefined;
    summary?: string;
    published_content?: string;
    status?: Database["public"]["Enums"]["content_status"];
    is_canon?: boolean;
    is_published?: boolean;
  },
): Promise<{ ok: boolean }> {
  const db = await admin();
  const { data: chapter } = await db
    .from("chapters")
    .select("id, series_id, source_game_id")
    .eq("id", chapterId)
    .maybeSingle();
  if (!chapter) throw new Error("Chapter not found");

  const { data: series } = await db.from("series").select("creator_id").eq("id", chapter.series_id).maybeSingle();
  let canEdit = series?.creator_id === userId;
  if (!canEdit && chapter.source_game_id) {
    const { data: game } = await db.from("games").select("host_id").eq("id", chapter.source_game_id).maybeSingle();
    canEdit = game?.host_id === userId;
  }
  if (!canEdit) throw new Error("Forbidden");

  const update: Database["public"]["Tables"]["chapters"]["Update"] = {};
  if (input.title !== undefined) update["title"] = input.title.trim().slice(0, 120);
  if (input.subtitle !== undefined) update["subtitle"] = input.subtitle?.trim() ?? null;
  if (input.summary !== undefined) update["summary"] = input.summary.trim();
  if (input.published_content !== undefined) update["published_content"] = input.published_content.trim();
  if (input.status !== undefined) update["status"] = input.status;
  if (input.is_canon !== undefined) update["is_canon"] = input.is_canon;
  if (input.is_published !== undefined) {
    update["is_published"] = input.is_published;
    if (input.is_published) update["published_at"] = new Date().toISOString();
  }

  const { error } = await db.from("chapters").update(update).eq("id", chapterId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function createBibleEntry(
  userId: string,
  input: {
    seriesId: string;
    kind: string;
    name: string;
    body: string;
    meta?: Record<string, unknown>;
    visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
    spoilerChapterId?: string | null;
  },
): Promise<{ id: string }> {
  const db = await admin();
  const { data: series } = await db.from("series").select("creator_id").eq("id", input.seriesId).maybeSingle();
  if (!series || series.creator_id !== userId) throw new Error("Forbidden");

  const meta = (input.meta ?? {}) as Json;
  const insert: Database["public"]["Tables"]["story_bible_entries"]["Insert"] = {
    series_id: input.seriesId,
    kind: input.kind.trim().slice(0, 40),
    name: input.name.trim().slice(0, 120),
    body: input.body.trim(),
    meta,
    visibility: input.visibility ?? "public",
    spoiler_chapter_id: input.spoilerChapterId ?? null,
    is_approved: true,
    state: "canon",
    sort_order: 0,
  };

  const { data, error } = await db.from("story_bible_entries").insert(insert).select("id").maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Could not create bible entry");
  return { id: data.id };
}

export async function updateBibleEntry(
  userId: string,
  entryId: string,
  input: {
    name?: string;
    body?: string;
    meta?: Record<string, unknown>;
    state?: Database["public"]["Enums"]["bible_entry_state"];
    visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
    spoilerChapterId?: string | null;
    sortOrder?: number;
  },
): Promise<{ ok: boolean }> {
  const db = await admin();
  const { data: entry } = await db
    .from("story_bible_entries")
    .select("id, series_id")
    .eq("id", entryId)
    .maybeSingle();
  if (!entry) throw new Error("Entry not found");

  const { data: series } = await db.from("series").select("creator_id").eq("id", entry.series_id).maybeSingle();
  if (!series || series.creator_id !== userId) throw new Error("Forbidden");

  const update: Database["public"]["Tables"]["story_bible_entries"]["Update"] = {};
  if (input.name !== undefined) update["name"] = input.name.trim().slice(0, 120);
  if (input.body !== undefined) update["body"] = input.body.trim();
  if (input.meta !== undefined) update["meta"] = input.meta as Json;
  if (input.state !== undefined) update["state"] = input.state;
  if (input.visibility !== undefined) update["visibility"] = input.visibility;
  if (input.spoilerChapterId !== undefined) update["spoiler_chapter_id"] = input.spoilerChapterId;
  if (input.sortOrder !== undefined) update["sort_order"] = input.sortOrder;

  const { error } = await db.from("story_bible_entries").update(update).eq("id", entryId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function fetchSubscription(userId: string) {
  const db = publicDb();
  const { data, error } = await db
    .from("subscriptions")
    .select("provider, status, tier, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}
