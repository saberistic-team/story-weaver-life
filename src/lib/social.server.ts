import { publicDb } from "./supabase-public.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type Comment = {
  id: string;
  body: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    level: number;
  } | null;
};

export async function fetchComments(targetType: string, targetId: string): Promise<Comment[]> {
  const db = publicDb();
  const { data, error } = await db
    .from("comments")
    .select(
      "id, body, user_id, target_type, target_id, created_at, profiles(username, display_name, avatar_url, level)",
    )
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (
    data as unknown as Array<{
      id: string;
      body: string;
      user_id: string;
      target_type: string;
      target_id: string;
      created_at: string;
      profiles: {
        username: string;
        display_name: string;
        avatar_url: string | null;
        level: number;
      } | null;
    }>
  ).map((r) => ({ ...r, author: r.profiles }));
}

export async function fetchMyLikes(
  userId: string,
  targetType: string,
  targetIds: string[],
): Promise<Set<string>> {
  if (targetIds.length === 0) return new Set();
  const db = publicDb();
  const { data, error } = await db
    .from("likes")
    .select("target_id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .in("target_id", targetIds);
  if (error || !data) return new Set();
  return new Set((data as { target_id: string }[]).map((r) => r.target_id));
}

export async function fetchMyFollows(
  userId: string,
  targetType: string,
  targetIds: string[],
): Promise<Set<string>> {
  if (targetIds.length === 0) return new Set();
  const db = publicDb();
  const { data, error } = await db
    .from("follows")
    .select("target_id")
    .eq("follower_id", userId)
    .eq("target_type", targetType)
    .in("target_id", targetIds);
  if (error || !data) return new Set();
  return new Set((data as { target_id: string }[]).map((r) => r.target_id));
}

export async function fetchBlockedIds(userId: string): Promise<Set<string>> {
  const db = publicDb();
  const { data, error } = await db
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);
  if (error || !data) return new Set();
  return new Set((data as { blocked_id: string }[]).map((r) => r.blocked_id));
}

export async function toggleLike(
  userId: string,
  targetType: "chapter" | "contribution" | "series",
  targetId: string,
) {
  const db = await admin();
  const { data: existing } = await db
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    await db.from("likes").delete().eq("id", existing.id);
  } else {
    await db
      .from("likes")
      .insert({ user_id: userId, target_type: targetType, target_id: targetId });
  }

  // Update denormalized count
  const { count } = await db
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("target_type", targetType)
    .eq("target_id", targetId);
  const total = count ?? 0;

  if (targetType === "chapter") {
    await db.from("chapters").update({ like_count: total }).eq("id", targetId);
    const { data: chapter } = await db
      .from("chapters")
      .select("series_id, title")
      .eq("id", targetId)
      .maybeSingle();
    if (chapter && !existing) {
      const { data: series } = await db
        .from("series")
        .select("title")
        .eq("id", chapter.series_id)
        .maybeSingle();
      await db.rpc("create_notification", {
        _user_id: userId,
        _kind: "like",
        _title: "New like on your chapter",
        _body: `Someone liked your chapter in ${series?.title ?? "a series"}`,
        _link: `/chapters/${targetId}`,
      });
    }
  } else if (targetType === "series") {
    await db.from("series").update({ follower_count: total }).eq("id", targetId);
  }

  return { liked: !existing, count: total };
}

export async function postComment(
  userId: string,
  targetType: "chapter" | "series" | "game",
  targetId: string,
  body: string,
): Promise<Comment> {
  const db = await admin();
  const { data, error } = await db
    .from("comments")
    .insert({ user_id: userId, target_type: targetType, target_id: targetId, body: body.trim() })
    .select("id, body, user_id, target_type, target_id, created_at")
    .single();
  if (error || !data) throw new Error("Could not post comment");

  const { data: profile } = await db
    .from("profiles")
    .select("username, display_name, avatar_url, level")
    .eq("id", userId)
    .maybeSingle();

  // Notify target owner lightly
  if (targetType === "chapter") {
    const { data: chapter } = await db
      .from("chapters")
      .select("series_id, title")
      .eq("id", targetId)
      .maybeSingle();
    if (chapter) {
      const { data: series } = await db
        .from("series")
        .select("creator_id, title")
        .eq("id", chapter.series_id)
        .maybeSingle();
      if (series && series.creator_id !== userId) {
        await db.rpc("create_notification", {
          _user_id: series.creator_id,
          _kind: "comment",
          _title: "New comment",
          _body: `Someone commented on "${chapter.title}"`,
          _link: `/chapters/${targetId}`,
        });
      }
    }
  }

  return { ...(data as Omit<Comment, "author">), author: profile };
}

export async function deleteComment(userId: string, commentId: string) {
  const db = await admin();
  const { error } = await db.from("comments").delete().eq("id", commentId).eq("user_id", userId);
  if (error) throw new Error("Could not delete comment");
  return { ok: true };
}

export async function toggleFollow(
  userId: string,
  targetType: "series" | "creator" | "universe",
  targetId: string,
) {
  const db = await admin();
  const { data: existing } = await db
    .from("follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    await db.from("follows").delete().eq("id", existing.id);
  } else {
    await db
      .from("follows")
      .insert({ follower_id: userId, target_type: targetType, target_id: targetId });
  }

  // Update denormalized counts
  const { count } = await db
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("target_type", targetType)
    .eq("target_id", targetId);
  const total = count ?? 0;

  if (targetType === "series") {
    await db.from("series").update({ follower_count: total }).eq("id", targetId);
  }

  // Notify creator when followed
  if (targetType === "creator" && !existing) {
    await db.rpc("create_notification", {
      _user_id: targetId,
      _kind: "follow",
      _title: "New follower",
      _body: "Someone started following you",
      _link: `/creators/${userId}`,
    });
  }

  return { following: !existing, count: total };
}

export async function submitReport(
  userId: string,
  targetType: string,
  targetId: string,
  reason: string,
) {
  const db = await admin();
  const { error } = await db.from("reports").insert({
    reporter_id: userId,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) throw new Error("Could not submit report");
  return { ok: true };
}

export async function blockUser(userId: string, blockedId: string) {
  const db = await admin();
  await db.from("user_blocks").insert({ blocker_id: userId, blocked_id: blockedId }).single();
  return { ok: true };
}

export async function unblockUser(userId: string, blockedId: string) {
  const db = await admin();
  await db.from("user_blocks").delete().eq("blocker_id", userId).eq("blocked_id", blockedId);
  return { ok: true };
}

export async function votePoll(userId: string, pollId: string, optionId: string) {
  const db = await admin();
  const { data: poll } = await db
    .from("polls")
    .select("id, closes_at, is_open")
    .eq("id", pollId)
    .maybeSingle();
  if (!poll) throw new Error("Poll not found");
  if (!poll.is_open || (poll.closes_at && new Date(poll.closes_at) < new Date())) {
    throw new Error("Poll is closed");
  }

  const { data: existing } = await db
    .from("poll_votes")
    .select("id, option_id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .maybeSingle();

  const adjust = async (id: string, delta: number) => {
    const { data: opt } = await db
      .from("poll_options")
      .select("vote_count")
      .eq("id", id)
      .maybeSingle();
    if (opt)
      await db
        .from("poll_options")
        .update({ vote_count: Math.max(0, opt.vote_count + delta) })
        .eq("id", id);
  };

  if (existing) {
    if (existing.option_id === optionId) {
      await db.from("poll_votes").delete().eq("id", existing.id);
      await adjust(optionId, -1);
      return { voted: false };
    }
    await db.from("poll_votes").update({ option_id: optionId }).eq("id", existing.id);
    await adjust(existing.option_id, -1);
    await adjust(optionId, 1);
    return { voted: true, optionId };
  }

  await db.from("poll_votes").insert({ poll_id: pollId, option_id: optionId, user_id: userId });
  await adjust(optionId, 1);
  return { voted: true, optionId };
}

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export async function fetchNotifications(
  userId: string,
  unreadOnly = false,
): Promise<NotificationItem[]> {
  const db = publicDb();
  let q = db
    .from("notifications")
    .select("id, kind, title, body, link, read_at, created_at")
    .eq("user_id", userId);
  if (unreadOnly) q = q.is("read_at", null);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(50);
  if (error || !data) return [];
  return data as NotificationItem[];
}

export async function markNotificationRead(userId: string, notificationId?: string) {
  const db = await admin();
  let q = db
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (notificationId) q = q.eq("id", notificationId);
  const { error } = await q;
  if (error) throw new Error("Could not mark read");
  return { ok: true };
}

export type FeedItem =
  | {
      type: "chapter";
      id: string;
      slug: string;
      title: string;
      subtitle: string | null;
      series_id: string;
      series_slug: string;
      series_title: string;
      published_at: string;
    }
  | {
      type: "game";
      id: string;
      title: string;
      status: string;
      series_id: string | null;
      series_slug: string | null;
      series_title: string | null;
      created_at: string;
    }
  | {
      type: "bible";
      id: string;
      kind: string;
      name: string;
      series_id: string;
      series_slug: string;
      series_title: string;
      created_at: string;
    };

export async function fetchFollowingFeed(userId: string): Promise<FeedItem[]> {
  const db = publicDb();
  const { data: follows } = await db
    .from("follows")
    .select("target_type, target_id")
    .eq("follower_id", userId)
    .in("target_type", ["series", "creator"]);
  if (!follows || follows.length === 0) return [];

  const seriesIds = new Set<string>();
  const creatorIds = new Set<string>();
  for (const f of follows as { target_type: string; target_id: string }[]) {
    if (f.target_type === "series") seriesIds.add(f.target_id);
    if (f.target_type === "creator") creatorIds.add(f.target_id);
  }

  // Resolve creator-owned series
  if (creatorIds.size > 0) {
    const { data: creatorSeries } = await db
      .from("series")
      .select("id")
      .in("creator_id", [...creatorIds]);
    for (const s of (creatorSeries ?? []) as { id: string }[]) seriesIds.add(s.id);
  }

  if (seriesIds.size === 0) return [];
  const ids = [...seriesIds];

  const [{ data: chapters }, { data: games }, { data: bibles }] = await Promise.all([
    db
      .from("chapters")
      .select("id, slug, title, subtitle, series_id, published_at")
      .in("series_id", ids)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(20),
    db
      .from("games")
      .select("id, title, status, series_id, created_at")
      .in("series_id", ids)
      .in("status", ["active", "waiting"])
      .order("created_at", { ascending: false })
      .limit(10),
    db
      .from("story_bible_entries")
      .select("id, kind, name, series_id, created_at")
      .in("series_id", ids)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const seriesInfo = await db.from("series").select("id, slug, title").in("id", ids);
  const seriesMap = new Map(
    (seriesInfo.data ?? []).map((s: { id: string; slug: string; title: string }) => [s.id, s]),
  );

  const items: FeedItem[] = [];
  for (const c of (chapters ?? []) as {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    series_id: string;
    published_at: string;
  }[]) {
    const s = seriesMap.get(c.series_id);
    if (!s) continue;
    items.push({ type: "chapter", ...c, series_slug: s.slug, series_title: s.title });
  }
  for (const g of (games ?? []) as {
    id: string;
    title: string;
    status: string;
    series_id: string | null;
    created_at: string;
  }[]) {
    const s = g.series_id ? seriesMap.get(g.series_id) : undefined;
    items.push({
      type: "game",
      ...g,
      series_slug: s?.slug ?? null,
      series_title: s?.title ?? null,
    });
  }
  for (const b of (bibles ?? []) as {
    id: string;
    kind: string;
    name: string;
    series_id: string;
    created_at: string;
  }[]) {
    const s = seriesMap.get(b.series_id);
    if (!s) continue;
    items.push({ type: "bible", ...b, series_slug: s.slug, series_title: s.title });
  }

  const sortDate = (item: FeedItem) => {
    if (item.type === "chapter") return item.published_at;
    return item.created_at;
  };
  return items
    .sort((a, b) => new Date(sortDate(b)).getTime() - new Date(sortDate(a)).getTime())
    .slice(0, 30);
}
