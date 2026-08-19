import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Admin = SupabaseClient<Database>;

export type AuditAction =
  | "ai_polish"
  | "ai_synthesize"
  | "ai_challenge"
  | "ai_memory"
  | "ai_narrate"
  | "ai_voice_expand"
  | "turn_submit"
  | "chapter_publish"
  | "subscription_change"
  | "profile_update";

export async function auditLog(
  db: Admin,
  action: AuditAction,
  actorId: string | null,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown> = {},
) {
  try {
    await db.from("ai_jobs").insert({
      feature: "audit",
      provider: "storyweaver",
      model: action,
      status: "succeeded",
      user_id: actorId,
      result_meta: { target_type: targetType, target_id: targetId, ...meta },
    });
  } catch (err) {
    // Audit logging must never break user-facing operations.
    console.error("audit log failed", err);
  }
}
