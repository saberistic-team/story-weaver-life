import { publicDb } from "./supabase-public.server";

export type LedgerEntry = {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export async function fetchWallet(
  userId: string,
): Promise<{ sparks: number; storyPoints: number }> {
  const db = publicDb();
  const [{ data: wallet }, { data: profile }] = await Promise.all([
    db.from("wallets").select("sparks").eq("user_id", userId).maybeSingle(),
    db.from("profiles").select("story_points").eq("id", userId).maybeSingle(),
  ]);
  return { sparks: wallet?.sparks ?? 0, storyPoints: profile?.story_points ?? 0 };
}

export async function fetchSparkLedger(userId: string): Promise<LedgerEntry[]> {
  const db = publicDb();
  const { data, error } = await db
    .from("spark_transactions")
    .select("id, amount, reason, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as LedgerEntry[];
}

export async function fetchStoryPointLedger(userId: string): Promise<LedgerEntry[]> {
  const db = publicDb();
  const { data, error } = await db
    .from("story_point_transactions")
    .select("id, amount, reason, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as LedgerEntry[];
}
