import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPaddleEnvironment } from "@/lib/paddle";

export type UserTier = "free" | "supporter" | "patron";

const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  supporter: 1,
  patron: 2,
};

export function tierMeets(required: UserTier, actual: UserTier): boolean {
  return TIER_RANK[actual] >= TIER_RANK[required];
}

export const getCurrentTier = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const environment = getPaddleEnvironment();
    const { data } = await supabase
      .from("subscriptions")
      .select("price_id, status, current_period_end")
      .eq("user_id", userId)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { tier: "free" as UserTier };

    const isActive =
      ["active", "trialing"].includes(data.status) &&
      (data.current_period_end === null || new Date(data.current_period_end) > new Date());
    const isGrace = data.status === "canceled" && data.current_period_end && new Date(data.current_period_end) > new Date();

    if (!isActive && !isGrace) return { tier: "free" as UserTier };

    if (data.price_id.startsWith("patron")) return { tier: "patron" as UserTier };
    if (data.price_id.startsWith("supporter")) return { tier: "supporter" as UserTier };
    return { tier: "free" as UserTier };
  });
