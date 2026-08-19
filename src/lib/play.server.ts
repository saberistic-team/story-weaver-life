import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { AIUnavailableError, generateChallenge, polishText, synthesizeChapter } from "./ai.server";
import { awardAchievementInternal } from "./depth.server";

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

async function awardSparks(db: Admin, userId: string, amount: number, reason: string) {
  if (amount <= 0) return;
  await db.from("spark_transactions").insert({ user_id: userId, amount, reason });
  const { data: wallet } = await db.from("wallets").select("sparks").eq("user_id", userId).maybeSingle();
  if (wallet) {
    await db.from("wallets").update({ sparks: wallet.sparks + amount }).eq("user_id", userId);
  } else {
    await db.from("wallets").insert({ user_id: userId, sparks: amount });
  }
}

async function awardStoryPoints(db: Admin, userId: string, amount: number, reason: string) {
  if (amount <= 0) return;
  await db.from("story_point_transactions").insert({ user_id: userId, amount, reason });
  const { data: p } = await db.from("profiles").select("story_points").eq("id", userId).maybeSingle();
  if (p) {
    const total = p.story_points + amount;
    await db
      .from("profiles")
      .update({ story_points: total, level: Math.max(1, Math.floor(total / 500) + 1) })
      .eq("id", userId);
  }
}

async function logEvent(db: Admin, gameId: string, kind: string, payload: Record<string, string | number | boolean | null | undefined>) {
  await db.from("game_events").insert({ game_id: gameId, kind, payload: payload as never });
}

/** Creates the profile/wallet rows for a freshly signed-up account. Idempotent. */
export async function ensureProfile(
  userId: string,
  email: string | null,
  displayName: string | null,
): Promise<{ created: boolean; username: string }> {
  const db = await admin();
  const { data: existing } = await db.from("profiles").select("username").eq("id", userId).maybeSingle();
  if (existing) return { created: false, username: existing.username };

  const base = slugify(displayName || email?.split("@")[0] || "storyteller") || "storyteller";
  let username = base;
  for (let i = 0; i < 6; i++) {
    const { data: taken } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
    if (!taken) break;
    username = `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  await db.from("profiles").insert({
    id: userId,
    username,
    display_name: displayName || base.replace(/-/g, " "),
    bio: null,
  });
  await db.from("wallets").insert({ user_id: userId, sparks: 100 });
  await db.from("user_roles").insert({ user_id: userId, role: "user" });
  await db.from("spark_transactions").insert({ user_id: userId, amount: 100, reason: "welcome_bonus" });
  return { created: true, username };
}

export async function joinGame(userId: string, gameId: string) {
  const db = await admin();
  const { data: game } = await db
    .from("games")
    .select("id, status, max_players, min_players")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) throw new Error("Game not found");
  if (game.status === "completed" || game.status === "published" || game.status === "cancelled") {
    throw new Error("This game has already finished");
  }

  const { data: players } = await db
    .from("game_players")
    .select("id, user_id, seat_order")
    .eq("game_id", gameId)
    .order("seat_order");
  const rows = players ?? [];
  if (!rows.some((p) => p.user_id === userId)) {
    if (rows.length >= game.max_players) throw new Error("This game is full");
    await db
      .from("game_players")
      .insert({ game_id: gameId, user_id: userId, seat_order: rows.length, is_host: false });
    await logEvent(db, gameId, "player_joined", { user_id: userId });
  }

  await advanceGame(gameId);
  return { ok: true };
}

/**
 * Authoritative turn engine. Expires stale turns, starts the next one, completes
 * the game when all rounds are used. Safe to call from any client at any time.
 */
export async function advanceGame(gameId: string): Promise<{ status: string; activeTurnId: string | null }> {
  const db = await admin();
  const { data: game } = await db
    .from("games")
    .select("id, status, rounds, turn_seconds, min_players, current_round, ai_gm_enabled, premise, genre, challenge_frequency")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) throw new Error("Game not found");
  if (game.status === "completed" || game.status === "published" || game.status === "cancelled") {
    return { status: game.status, activeTurnId: null };
  }

  const [{ data: players }, { data: turns }] = await Promise.all([
    db.from("game_players").select("user_id, seat_order").eq("game_id", gameId).order("seat_order"),
    db.from("game_turns").select("id, turn_index, player_id, status, ends_at").eq("game_id", gameId).order("turn_index"),
  ]);
  const seats = players ?? [];
  const turnRows = turns ?? [];

  const active = turnRows.find((t) => t.status === "active");
  if (active) {
    const expired = active.ends_at ? new Date(active.ends_at).getTime() < Date.now() : false;
    if (!expired) return { status: game.status, activeTurnId: active.id };
    await db.from("game_turns").update({ status: "timed_out" }).eq("id", active.id);
    await logEvent(db, gameId, "turn_timed_out", { turn_id: active.id, player_id: active.player_id });
  }

  const used = turnRows.filter((t) => t.id !== active?.id || true).length;
  const nextIndex = turnRows.length === 0 ? 0 : Math.max(...turnRows.map((t) => t.turn_index)) + 1;

  if (seats.length < Math.max(2, game.min_players)) {
    if (game.status !== "waiting") await db.from("games").update({ status: "waiting" }).eq("id", gameId);
    return { status: "waiting", activeTurnId: null };
  }

  if (used >= game.rounds) {
    await db.from("games").update({ status: "processing" }).eq("id", gameId);
    await logEvent(db, gameId, "game_processing", {});
    return { status: "processing", activeTurnId: null };
  }

  const seat = seats[nextIndex % seats.length]!;
  const now = Date.now();
  const round = Math.floor(nextIndex / seats.length) + 1;

  let challengeId: string | null = null;
  if (game.ai_gm_enabled && round > 1 && (round - 1) % Math.max(1, game.challenge_frequency) === 0) {
    try {
      const { data: recent } = await db
        .from("contributions")
        .select("original_text")
        .eq("game_id", gameId)
        .order("position", { ascending: false })
        .limit(3);
      const challenge = await generateChallenge(
        game.premise,
        (recent ?? []).map((r) => r.original_text).reverse(),
        game.genre,
      );
      const { data: inserted } = await db
        .from("game_challenges")
        .insert({ game_id: gameId, round, kind: challenge.kind, text: challenge.text, reward_sparks: 15 })
        .select("id")
        .maybeSingle();
      challengeId = inserted?.id ?? null;
      if (challengeId) await logEvent(db, gameId, "challenge_issued", { text: challenge.text, round });
    } catch (error) {
      if (!(error instanceof AIUnavailableError)) console.error("challenge failed", error);
    }
  }

  const { data: turn } = await db
    .from("game_turns")
    .insert({
      game_id: gameId,
      round,
      turn_index: nextIndex,
      player_id: seat.user_id,
      status: "active",
      starts_at: new Date(now).toISOString(),
      ends_at: new Date(now + game.turn_seconds * 1000).toISOString(),
      challenge_id: challengeId,
    })
    .select("id")
    .maybeSingle();

  const gameUpdate: { status: "active"; current_round: number; started_at?: string } = {
    status: "active",
    current_round: round,
  };
  if (game.status === "waiting") gameUpdate.started_at = new Date(now).toISOString();
  await db.from("games").update(gameUpdate).eq("id", gameId);
  await logEvent(db, gameId, "turn_started", { turn_id: turn?.id, player_id: seat.user_id, round });

  return { status: "active", activeTurnId: turn?.id ?? null };
}

export async function submitTurn(userId: string, gameId: string, text: string) {
  const db = await admin();
  const body = text.trim();
  if (body.length < 20) throw new Error("Write at least a couple of sentences (20 characters).");

  const { data: game } = await db
    .from("games")
    .select("id, max_chars, polish_style, series_id, reward_sparks")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) throw new Error("Game not found");
  if (body.length > game.max_chars) throw new Error(`Keep it under ${game.max_chars} characters.`);

  const state = await advanceGame(gameId);
  const { data: turn } = await db
    .from("game_turns")
    .select("id, player_id, turn_index, ends_at")
    .eq("game_id", gameId)
    .eq("status", "active")
    .maybeSingle();
  if (!turn || state.status !== "active") throw new Error("There is no open turn right now.");
  if (turn.player_id !== userId) throw new Error("It is not your turn yet.");

  const { count } = await db
    .from("contributions")
    .select("id", { count: "exact", head: true })
    .eq("game_id", gameId);

  const { data: contribution, error } = await db
    .from("contributions")
    .insert({
      game_id: gameId,
      turn_id: turn.id,
      author_id: userId,
      original_text: body,
      char_count: body.length,
      position: count ?? 0,
    })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  await db
    .from("game_turns")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", turn.id);
  await logEvent(db, gameId, "contribution_submitted", { user_id: userId, turn_id: turn.id });

  await awardSparks(db, userId, game.reward_sparks, "turn_submitted");
  await awardStoryPoints(db, userId, 25, "turn_submitted");

  let polished: string | null = null;
  if (contribution && game.polish_style !== "disabled") {
    let voice: string | null = null;
    if (game.series_id) {
      const { data: series } = await db.from("series").select("voice").eq("id", game.series_id).maybeSingle();
      voice = series?.voice ?? null;
    }
    try {
      const result = await polishText(body, game.polish_style, voice);
      await db.from("contribution_polish_versions").insert({
        contribution_id: contribution.id,
        polished_text: result.text,
        style: game.polish_style,
        model: result.model,
        is_current: true,
      });
      polished = result.text;
    } catch (err) {
      if (!(err instanceof AIUnavailableError)) console.error("polish failed", err);
    }
  }

  const next = await advanceGame(gameId);
  if (next.status === "processing") await finalizeGame(gameId);

  return { ok: true, contributionId: contribution?.id ?? null, polished, gameStatus: next.status };
}

/** Turns a finished game into a published chapter. */
export async function finalizeGame(gameId: string) {
  const db = await admin();
  const { data: game } = await db
    .from("games")
    .select("id, title, premise, series_id, book_id, chapter_sequence, status, host_id, canon_mode")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) throw new Error("Game not found");

  const { data: existing } = await db
    .from("chapters")
    .select("id, slug")
    .eq("source_game_id", gameId)
    .maybeSingle();
  if (existing) return { chapterSlug: existing.slug };

  const { data: contribs } = await db
    .from("contributions")
    .select("id, position, original_text, author_id, contribution_polish_versions(polished_text)")
    .eq("game_id", gameId)
    .order("position");
  const rows = (contribs ?? []) as unknown as {
    id: string;
    position: number;
    original_text: string;
    author_id: string;
    contribution_polish_versions: { polished_text: string }[];
  }[];
  const passages = rows.map((r) => r.contribution_polish_versions?.[0]?.polished_text ?? r.original_text);

  let voice: string | null = null;
  if (game.series_id) {
    const { data: series } = await db.from("series").select("voice").eq("id", game.series_id).maybeSingle();
    voice = series?.voice ?? null;
  }

  let published = passages.join("\n\n");
  try {
    if (passages.length > 0) {
      const result = await synthesizeChapter(game.title, game.premise, passages, voice);
      published = result.text;
    }
  } catch (err) {
    if (!(err instanceof AIUnavailableError)) console.error("synthesis failed", err);
  }

  const seriesId = game.series_id;
  if (!seriesId) {
    await db.from("games").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", gameId);
    return { chapterSlug: null };
  }

  const { data: last } = await db
    .from("chapters")
    .select("sequence")
    .eq("series_id", seriesId)
    .order("sequence", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sequence = (last?.sequence ?? 0) + 1;
  const slug = `${slugify(game.title)}-${sequence}-${gameId.slice(0, 6)}`;

  const { data: chapter } = await db
    .from("chapters")
    .insert({
      series_id: seriesId,
      book_id: game.book_id,
      source_game_id: gameId,
      slug,
      sequence,
      title: game.title,
      summary: game.premise,
      raw_content: passages.join("\n\n"),
      published_content: published,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .maybeSingle();

  if (chapter) {
    await db.from("contributions").update({ chapter_id: chapter.id }).eq("game_id", gameId);
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.author_id, (counts.get(r.author_id) ?? 0) + 1);
    for (const [userId, contribution_count] of counts) {
      await db
        .from("chapter_contributors")
        .insert({ chapter_id: chapter.id, user_id: userId, contribution_count });
      await awardStoryPoints(db, userId, 60, "chapter_published");
    }
  }

  await db
    .from("games")
    .update({ status: "published", completed_at: new Date().toISOString() })
    .eq("id", gameId);
  await logEvent(db, gameId, "chapter_published", { chapter_id: chapter?.id });

  return { chapterSlug: chapter?.slug ?? null };
}

export type CreateGameInput = {
  title: string;
  premise: string;
  genre: string;
  rounds: number;
  turnSeconds: number;
  maxChars: number;
  maxPlayers: number;
  visibility: "blind" | "contextual" | "open";
  aiGm: boolean;
  polishStyle: "light" | "balanced" | "cinematic" | "disabled";
  seriesId?: string | null;
};

export async function createGame(userId: string, input: CreateGameInput) {
  const db = await admin();
  const { data: game, error } = await db
    .from("games")
    .insert({
      host_id: userId,
      title: input.title.trim().slice(0, 120),
      premise: input.premise.trim().slice(0, 800),
      genre: input.genre,
      rounds: Math.min(24, Math.max(2, input.rounds)),
      turn_seconds: Math.min(600, Math.max(30, input.turnSeconds)),
      max_chars: Math.min(1200, Math.max(120, input.maxChars)),
      max_players: Math.min(12, Math.max(2, input.maxPlayers)),
      min_players: 2,
      visibility_mode: input.visibility,
      ai_gm_enabled: input.aiGm,
      polish_style: input.polishStyle,
      series_id: input.seriesId ?? null,
      status: "waiting",
    })
    .select("id")
    .maybeSingle();
  if (error || !game) throw new Error(error?.message ?? "Could not create the game");

  await db.from("game_players").insert({ game_id: game.id, user_id: userId, seat_order: 0, is_host: true });
  await logEvent(db, game.id, "game_created", { host_id: userId });
  return { id: game.id };
}

export async function fetchMyState(userId: string) {
  const db = await admin();
  const [{ data: profile }, { data: wallet }, { data: memberships }] = await Promise.all([
    db.from("profiles").select("id, username, display_name, avatar_url, story_points, level, is_creator, onboarded").eq("id", userId).maybeSingle(),
    db.from("wallets").select("sparks").eq("user_id", userId).maybeSingle(),
    db.from("game_players").select("game_id, games(id, title, status, genre, current_round, rounds)").eq("user_id", userId).limit(20),
  ]);
  return {
    profile: profile ?? null,
    sparks: wallet?.sparks ?? 0,
    games: ((memberships ?? []) as unknown as {
      games: { id: string; title: string; status: string; genre: string; current_round: number; rounds: number } | null;
    }[])
      .map((m) => m.games)
      .filter(Boolean),
  };
}
