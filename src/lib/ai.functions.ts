import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  narrateChapter,
  summarizeSeriesMemory,
  expandVoiceProfile,
  checkContinuity,
  AIUnavailableError,
  AIRateLimitError,
} from "./ai.server";
import { publicDb } from "./supabase-public.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const aiErrorResponse = (err: unknown): never => {
  if (err instanceof AIRateLimitError) {
    throw new Response("AI rate limit exceeded. Please try again shortly.", { status: 429 });
  }
  if (err instanceof AIUnavailableError) {
    throw new Response("AI service unavailable.", { status: 503 });
  }
  throw new Response("AI service error.", { status: 500 });
};

export const narrateChapterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ chapterId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const db = publicDb();
    const { data: chapter } = await db
      .from("chapters")
      .select("title, published_content")
      .eq("id", data.chapterId)
      .maybeSingle();
    if (!chapter?.published_content) throw new Response("Chapter not found", { status: 404 });
    try {
      const { script } = await narrateChapter(chapter.title, chapter.published_content);
      return { script };
    } catch (err) {
      throw aiErrorResponse(err);
    }
  });

export const summarizeSeriesMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ seriesId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const db = publicDb();
    const [{ data: series }, { data: bible }, { data: chapters }] = await Promise.all([
      db.from("series").select("title").eq("id", data.seriesId).maybeSingle(),
      db
        .from("story_bible_entries")
        .select("kind, name, body")
        .eq("series_id", data.seriesId)
        .eq("state", "canon")
        .eq("visibility", "public"),
      db
        .from("chapters")
        .select("summary")
        .eq("series_id", data.seriesId)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5),
    ]);
    if (!series) throw new Response("Series not found", { status: 404 });
    try {
      const { summary } = await summarizeSeriesMemory(
        series.title,
        bible ?? [],
        (chapters ?? []).map((c) => c.summary).filter(Boolean),
      );
      return { summary };
    } catch (err) {
      throw aiErrorResponse(err);
    }
  });

export const expandVoiceProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ description: z.string().min(3).max(500) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const profile = await expandVoiceProfile(data.description);
      return profile;
    } catch (err) {
      throw aiErrorResponse(err);
    }
  });

export const checkContinuityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        text: z.string().min(10),
        seriesId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = publicDb();
    const { data: bible } = await db
      .from("story_bible_entries")
      .select("kind, name, body")
      .eq("series_id", data.seriesId)
      .eq("state", "canon")
      .eq("visibility", "public");
    try {
      const result = await checkContinuity(data.text, bible ?? []);
      return result;
    } catch (err) {
      throw aiErrorResponse(err);
    }
  });
