import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Gamepad2, UserPlus } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getFollowingFeed } from "@/lib/social.functions";

const feedQuery = () =>
  queryOptions({
    queryKey: ["following-feed"],
    queryFn: () => getFollowingFeed({ data: undefined }),
  });

export const Route = createFileRoute("/_authenticated/following")({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery()),
  component: FollowingPage,
  head: () => ({
    meta: [{ title: "Following — StoryWeaver" }, { name: "description", content: "Updates from creators and series you follow." }],
  }),
});

function FollowingPage() {
  const { data } = useSuspenseQuery(feedQuery());

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight">Your feed</h1>
        <p className="mt-2 text-muted-foreground">New chapters, live games, and canon updates from the worlds you follow.</p>

        {data.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-8 text-center">
            <UserPlus className="mx-auto size-6 text-primary" />
            <h2 className="font-display mt-3 text-xl">Follow something</h2>
            <p className="mt-2 text-sm text-muted-foreground">Follow creators and series to build your personal feed.</p>
            <Button asChild className="mt-5">
              <Link to="/discover">Browse the library</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {data.map((item) => (
              <li key={`${item.type}-${item.id}`} className="rounded-xl border border-border bg-card p-4">
                {item.type === "chapter" ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <BookOpen className="size-3.5" /> New chapter
                    </div>
                    <p className="mt-1 font-medium">
                      <Link to="/chapters/$slug" params={{ slug: item.slug }} className="hover:underline">
                        {item.title}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      in {item.series_title} · {new Date(item.published_at).toLocaleDateString()}
                    </p>
                  </>
                ) : item.type === "game" ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Gamepad2 className="size-3.5" /> Live game
                    </div>
                    <p className="mt-1 font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.status}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <BookOpen className="size-3.5" /> Canon update
                    </div>
                    <p className="mt-1 font-medium">{(item as Extract<typeof item, { type: "bible" }>).name}</p>
                    <p className="text-sm text-muted-foreground">{item.series_title}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
