import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  blockUser,
  deleteComment,
  fetchBlockedIds,
  fetchComments,
  fetchFollowingFeed,
  fetchMyFollows,
  fetchMyLikes,
  fetchNotifications,
  markNotificationRead,
  postComment,
  submitReport,
  toggleFollow,
  toggleLike,
  unblockUser,
  votePoll,
  type Comment,
  type FeedItem,
  type NotificationItem,
} from "./social.server";

export const getComments = createServerFn({ method: "GET" })
  .inputValidator((data: { targetType: string; targetId: string }) => data)
  .handler(async ({ data }) => fetchComments(data.targetType, data.targetId));

export const getMyLikes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: string; targetIds: string[] }) => data)
  .handler(async ({ data, context }) => fetchMyLikes(context.userId, data.targetType, data.targetIds));

export const getMyFollows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: string; targetIds: string[] }) => data)
  .handler(async ({ data, context }) => fetchMyFollows(context.userId, data.targetType, data.targetIds));

export const getBlockedIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => Array.from(await fetchBlockedIds(context.userId)));

export const likeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: "chapter" | "contribution" | "series"; targetId: string }) => data)
  .handler(async ({ data, context }) => toggleLike(context.userId, data.targetType, data.targetId));

export const commentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: "chapter" | "series" | "game"; targetId: string; body: string }) => data)
  .handler(async ({ data, context }) => postComment(context.userId, data.targetType, data.targetId, data.body) as Promise<Comment>);

export const deleteCommentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { commentId: string }) => data)
  .handler(async ({ data, context }) => deleteComment(context.userId, data.commentId));

export const followFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: "series" | "creator" | "universe"; targetId: string }) => data)
  .handler(async ({ data, context }) => toggleFollow(context.userId, data.targetType, data.targetId));

export const reportFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { targetType: string; targetId: string; reason: string }) => data)
  .handler(async ({ data, context }) => submitReport(context.userId, data.targetType, data.targetId, data.reason));

export const blockFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { blockedId: string }) => data)
  .handler(async ({ data, context }) => blockUser(context.userId, data.blockedId));

export const unblockFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { blockedId: string }) => data)
  .handler(async ({ data, context }) => unblockUser(context.userId, data.blockedId));

export const votePollFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pollId: string; optionId: string }) => data)
  .handler(async ({ data, context }) => votePoll(context.userId, data.pollId, data.optionId));

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { unreadOnly?: boolean }) => data)
  .handler(async ({ data, context }) => fetchNotifications(context.userId, data.unreadOnly) as Promise<NotificationItem[]>);

export const markReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notificationId?: string }) => data)
  .handler(async ({ data, context }) => markNotificationRead(context.userId, data.notificationId));

export const getFollowingFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchFollowingFeed(context.userId) as Promise<FeedItem[]>);
