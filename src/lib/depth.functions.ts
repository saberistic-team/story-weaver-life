import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  fetchAchievements,
  fetchBible,
  fetchBibleEntry,
  fetchCanonTree,
  fetchBookReadState,
  getReadingProgress,
  fetchUserAchievements,
  type AchievementDef,
  type BibleEntry,
  type CanonNode,
  type ReadingProgressItem,
} from "./depth.server";

export const getAchievements = createServerFn({ method: "GET" }).handler(async () => fetchAchievements());

export const getBible = createServerFn({ method: "GET" })
  .inputValidator((data: { seriesSlug: string }) => data)
  .handler(async ({ data }) => fetchBible(data.seriesSlug));

export const getBibleEntry = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => fetchBibleEntry(data.id));

export const getCanonTree = createServerFn({ method: "GET" })
  .inputValidator((data: { seriesSlug: string }) => data)
  .handler(async ({ data }) => fetchCanonTree(data.seriesSlug));

export const getBookReadState = createServerFn({ method: "GET" })
  .inputValidator((data: { bookSlug: string }) => data)
  .handler(async ({ data }) => fetchBookReadState(data.bookSlug));

export const getMyReadingProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { seriesId?: string }) => data)
  .handler(async ({ data, context }) => getReadingProgress(context.userId, data.seriesId));

export const saveReadingProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapterId: string; seriesId: string; percent: number; completed?: boolean }) =>
    z
      .object({
        chapterId: z.string().uuid(),
        seriesId: z.string().uuid(),
        percent: z.number().min(0).max(100),
        completed: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const completed = data.completed ?? data.percent >= 90;

    const { error } = await supabase.from("reading_progress").upsert(
      {
        user_id: userId,
        chapter_id: data.chapterId,
        series_id: data.seriesId,
        percent: data.percent,
        completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, chapter_id" },
    );

    if (error) throw new Error(error.message);

    // Record activity for streak tracking
    await recordActivityInternal(supabase, userId);

    return { ok: true, completed };
  });

export const getMyAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchUserAchievements(context.userId));

export const awardAchievement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { code: string }) => z.object({ code: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const defs = await fetchAchievements();
    const def = defs.find((d) => d.code === data.code);
    if (!def) throw new Error("Unknown achievement");

    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_code", data.code)
      .maybeSingle();
    if (existing) return { ok: true, alreadyHad: true };

    const { error } = await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_code: data.code,
      earned_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    // Grant story points
    await supabase.from("story_point_transactions").insert({
      user_id: userId,
      amount: def.story_points,
      reason: `Achievement: ${def.name}`,
    });
    const { data: profile } = await supabase.from("profiles").select("story_points").eq("id", userId).single();
    if (profile) {
      const total = profile.story_points + def.story_points;
      await supabase
        .from("profiles")
        .update({ story_points: total, level: Math.max(1, Math.floor(total / 500) + 1) })
        .eq("id", userId);
    }

    return { ok: true, alreadyHad: false, storyPoints: def.story_points };
  });

async function recordActivityInternal(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_active_at, streak_days")
    .eq("id", userId)
    .single();

  const last = profile?.last_active_at ? profile.last_active_at.slice(0, 10) : null;
  let streak = profile?.streak_days ?? 0;

  if (last) {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diff = (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 1 && diff < 2) {
      streak += 1;
    } else if (diff >= 2) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  await supabase.from("profiles").update({ last_active_at: now, streak_days: streak }).eq("id", userId);
}
