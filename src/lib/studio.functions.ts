import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  fetchStudioDashboard,
  fetchStudioSeries,
  fetchStudioChaptersForSeries,
  fetchStudioChapter,
  fetchStudioBible,
  createSeries,
  updateSeries,
  updateChapter,
  createBibleEntry,
  updateBibleEntry,
  fetchSubscription,
} from "./studio.server";
import type { Database } from "@/integrations/supabase/types";

export const getStudioDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchStudioDashboard(context.userId));

export const getStudioSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => fetchStudioSeries(context.userId, data.slug));

export const getStudioChapters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { seriesId: string }) => data)
  .handler(async ({ data, context }) => fetchStudioChaptersForSeries(context.userId, data.seriesId));

export const getStudioChapter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => fetchStudioChapter(context.userId, data.slug));

export const getStudioBible = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { seriesId: string }) => data)
  .handler(async ({ data }) => fetchStudioBible(data.seriesId));

export const createSeriesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
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
    }) => data,
  )
  .handler(async ({ data, context }) => createSeries(context.userId, data));

export const updateSeriesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      seriesId: string;
      title?: string;
      tagline?: string;
      description?: string;
      genre?: string;
      voice?: string;
      canon_mode?: Database["public"]["Enums"]["canon_mode"];
      polish_style?: Database["public"]["Enums"]["polish_style"];
      allow_forks?: boolean;
      is_public?: boolean;
      required_tier?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => updateSeries(context.userId, data.seriesId, data));

export const updateChapterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      chapterId: string;
      title?: string;
      subtitle?: string;
      summary?: string;
      published_content?: string;
      status?: Database["public"]["Enums"]["content_status"];
      is_canon?: boolean;
      is_published?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => updateChapter(context.userId, data.chapterId, data));

export const createBibleEntryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      seriesId: string;
      kind: string;
      name: string;
      body: string;
      meta?: Record<string, unknown>;
      visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
      spoilerChapterId?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => createBibleEntry(context.userId, data));

export const updateBibleEntryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      entryId: string;
      name?: string;
      body?: string;
      meta?: Record<string, unknown>;
      state?: Database["public"]["Enums"]["bible_entry_state"];
      visibility?: Database["public"]["Enums"]["bible_entry_visibility"];
      spoilerChapterId?: string | null;
      sortOrder?: number;
    }) => data,
  )
  .handler(async ({ data, context }) => updateBibleEntry(context.userId, data.entryId, data));

export const getSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchSubscription(context.userId));
