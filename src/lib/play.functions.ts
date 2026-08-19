import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const bootstrapAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { ensureProfile } = await import("./play.server");
    const claims = context.claims as {
      email?: string;
      user_metadata?: { full_name?: string; name?: string };
    };
    return ensureProfile(
      context.userId,
      claims.email ?? null,
      claims.user_metadata?.full_name ?? claims.user_metadata?.name ?? null,
    );
  });

export const getMyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchMyState } = await import("./play.server");
    return fetchMyState(context.userId);
  });

export const joinGameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { gameId: string }) => data)
  .handler(async ({ data, context }) => {
    const { joinGame } = await import("./play.server");
    return joinGame(context.userId, data.gameId);
  });

export const advanceGameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { gameId: string }) => data)
  .handler(async ({ data }) => {
    const { advanceGame } = await import("./play.server");
    return advanceGame(data.gameId);
  });

export const submitTurnFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { gameId: string; text: string }) => data)
  .handler(async ({ data, context }) => {
    const { submitTurn } = await import("./play.server");
    return submitTurn(context.userId, data.gameId, data.text);
  });

export const createGameFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
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
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { createGame } = await import("./play.server");
    return createGame(context.userId, data);
  });

export const architectStoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { idea: string }) => data)
  .handler(async ({ data }) => {
    const { architectStory } = await import("./ai.server");
    return architectStory(data.idea);
  });
