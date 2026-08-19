import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Heart, Lock, MessageCircle, Share2, Sparkles, Wand2 } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getChapter, getConfig } from "@/lib/content.functions";
import { saveReadingProgress } from "@/lib/depth.functions";
import { getCurrentTier, tierMeets, type UserTier } from "@/lib/subscriptions.functions";
import { useSession } from "@/hooks/use-session";
import { useServerFn } from "@tanstack/react-start";
import {
  blockFn,
  commentFn,
  deleteCommentFn,
  getBlockedIds,
  getComments,
  getMyLikes,
  likeFn,
  reportFn,
} from "@/lib/social.functions";
import { toast } from "sonner";


const chapterQuery = (slug: string) =>
  queryOptions({
    queryKey: ["chapter", slug],
    queryFn: async () => {
      const data = await getChapter({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

const configQuery = queryOptions({ queryKey: ["config"], queryFn: () => getConfig() });

export const Route = createFileRoute("/chapters/$slug")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(configQuery);
    return context.queryClient.ensureQueryData(chapterQuery(params.slug));
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Chapter unavailable — StoryPass" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.chapter.title} — ${loaderData.series.title} — StoryPass`;
    const description = loaderData.chapter.summary.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ChapterPage,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">This chapter didn't load.</p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <h1 className="font-display text-3xl">Chapter not found</h1>
      <Button asChild className="mt-4">
        <Link to="/discover">Browse the library</Link>
      </Button>
    </PageShell>
  ),
});

const READ_KEY = "storypass:chapters-read";

function ChapterPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(chapterQuery(slug));
  const { data: config } = useSuspenseQuery(configQuery);
  const { user } = useSession();
  const [readCount, setReadCount] = useState(0);
  const [showBehind, setShowBehind] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [localComments, setLocalComments] = useState(data.comments);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(data.chapter.like_count);
  const saveProgress = useServerFn(saveReadingProgress);
  const doLike = useServerFn(likeFn);
  const doComment = useServerFn(commentFn);
  const doDeleteComment = useServerFn(deleteCommentFn);
  const doReport = useServerFn(reportFn);
  const doBlock = useServerFn(blockFn);
  const fetchComments = useServerFn(getComments);
  const fetchMyLikes = useServerFn(getMyLikes);
  const fetchBlockedIds = useServerFn(getBlockedIds);

  const { chapter, series, creator, prev, next, contributions, contributors, chapterNumber } = data;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(READ_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(chapter.id)) list.push(chapter.id);
    localStorage.setItem(READ_KEY, JSON.stringify(list));
    localStorage.setItem("storypass:resume", `/chapters/${chapter.slug}`);
    setReadCount(list.length);

    if (user) {
      void saveProgress({
        data: {
          chapterId: chapter.id,
          seriesId: chapter.series_id,
          percent: 100,
          completed: true,
        },
      });
    }

    if (user) {
      fetchMyLikes({ data: { targetType: "chapter", targetIds: [chapter.id] } })
        .then((set) => setLiked(set.has(chapter.id)))
        .catch(() => {});
      fetchBlockedIds({ data: undefined })
        .then((ids) => setBlockedIds(new Set(ids)))
        .catch(() => {});
    }
  }, [chapter.id, chapter.slug, chapter.series_id, user, saveProgress, fetchMyLikes, fetchBlockedIds]);

  const gated = !user && readCount > config.guestFreeChapters;
  const paragraphs = chapter.published_content.split(/\n\n+/).filter(Boolean);
  const visible = gated ? paragraphs.slice(0, 2) : paragraphs;

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 text-sm text-primary">
          <Link to="/series/$slug" params={{ slug: series.slug }} className="underline-offset-4 hover:underline">
            {series.title}
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            to="/series/$slug/bible"
            params={{ slug: series.slug }}
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            <BookOpen className="size-3.5" /> Story Bible
          </Link>
        </div>
        <p className="mt-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Chapter {chapterNumber}
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight tracking-tight">{chapter.title}</h1>
        {chapter.subtitle ? <p className="mt-2 text-lg text-muted-foreground">{chapter.subtitle}</p> : null}
        <p className="mt-4 text-sm text-muted-foreground">
          Written live by {contributors.length} players
          {creator ? ` · curated by ${creator.display_name}` : ""} · polished by AI
        </p>

        <article className="prose-story mt-10">
          {visible.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {gated ? (
          <div className="relative -mt-16">
            <div className="h-16 bg-gradient-to-b from-transparent to-background" />
            <div className="rounded-xl border border-primary/40 bg-card p-6 text-center">
              <Sparkles className="mx-auto size-5 text-primary" />
              <h2 className="font-display mt-3 text-2xl">Keep reading, free</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                You've read your {config.guestFreeChapters} free chapters. Create an account to finish this
                one — you'll land right back here — and get {config.starterSparks} Sparks to join a game.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  sessionStorage.setItem("storypass:next", `/chapters/${chapter.slug}`);
                  window.location.href = "/auth";
                }}
              >
                Create a free account
              </Button>
            </div>
          </div>
        ) : null}

        {!gated ? (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={async () => {
                  if (!user) return;
                  setLiked((v) => !v);
                  setLikeCount((n) => (liked ? n - 1 : n + 1));
                  try {
                    const res = await doLike({ data: { targetType: "chapter", targetId: chapter.id } });
                    setLiked(res.liked);
                    setLikeCount(res.count);
                  } catch {
                    setLiked((v) => !v);
                    setLikeCount((n) => (liked ? n + 1 : n - 1));
                  }
                }}
              >
                <Heart className={`mr-1 size-4 ${liked ? "fill-current" : ""}`} /> {likeCount}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/chapters/${chapter.slug}`;
                  void navigator.clipboard.writeText(url);
                  toast.success("Link copied");
                }}
              >
                <Share2 className="mr-1 size-4" /> Share
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              {prev ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/chapters/$slug" params={{ slug: prev.slug }}>
                    <ArrowLeft className="size-4" /> {prev.title}
                  </Link>
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <Button asChild size="sm">
                  <Link to="/chapters/$slug" params={{ slug: next.slug }}>
                    {next.title} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
              <h2 className="font-display text-2xl">Write what happens next</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The next chapter of {series.title} is written in a live game. One sentence at a time, on
                the clock.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/play">Join the next chapter</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/discover">Keep reading</Link>
                </Button>
              </div>
            </div>

            {contributions.length > 0 ? (
              <section className="mt-10">
                <button
                  type="button"
                  onClick={() => setShowBehind(!showBehind)}
                  className="flex items-center gap-2 text-sm text-primary"
                >
                  <Wand2 className="size-4" />
                  {showBehind ? "Hide" : "Show"} Behind the Story
                </button>
                {showBehind ? (
                  <div className="mt-4 space-y-4">
                    {contributions.map((c) => (
                      <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Turn {c.position + 1}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {c.author ? c.author.display_name : "A player"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground italic">"{c.original_text}"</p>
                        {c.polished_text ? (
                          <p className="mt-3 border-l-2 border-primary/60 pl-3 text-sm">{c.polished_text}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="mt-10">
              <h2 className="font-display flex items-center gap-2 text-xl">
                <MessageCircle className="size-5" /> Reader reactions
              </h2>
              {user ? (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Share what this chapter made you feel..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    disabled={!commentDraft.trim()}
                    onClick={async () => {
                      const body = commentDraft.trim();
                      if (!body) return;
                      setCommentDraft("");
                      const c = await doComment({ data: { targetType: "chapter", targetId: chapter.id, body } });
                      setLocalComments((prev) => [c as (typeof prev)[number], ...prev]);
                    }}
                  >
                    Post comment
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Sign in to leave a reaction.</p>
              )}
                {localComments.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {localComments
                      .filter((c) => !blockedIds.has(c.user_id))
                      .map((c) => (
                        <li key={c.id} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{c.author?.display_name ?? "Reader"}</p>
                            {user && c.user_id === user.id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-0 text-xs text-muted-foreground"
                                onClick={async () => {
                                  await doDeleteComment({ data: { commentId: c.id } });
                                  setLocalComments((prev) => prev.filter((x) => x.id !== c.id));
                                }}
                              >
                                Delete
                              </Button>
                            ) : user && c.user_id !== user.id ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto py-0 text-xs text-muted-foreground"
                                  onClick={async () => {
                                    await doReport({
                                      data: { targetType: "comment", targetId: c.id, reason: "Inappropriate comment" },
                                    });
                                    toast.success("Report submitted");
                                  }}
                                >
                                  Report
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto py-0 text-xs text-muted-foreground"
                                  onClick={async () => {
                                    await doBlock({ data: { blockedId: c.user_id } });
                                    setBlockedIds((prev) => new Set([...prev, c.user_id]));
                                    toast.success("User blocked");
                                  }}
                                >
                                  Block
                                </Button>
                              </div>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                        </li>
                      ))}
                  </ul>
                ) : null}
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
