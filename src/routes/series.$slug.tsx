import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, Crown, Radio, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSeries } from "@/lib/content.functions";
import { followFn, getMyFollows } from "@/lib/social.functions";
import { useSession } from "@/hooks/use-session";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";


export const seriesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["series", slug],
    queryFn: async () => {
      const data = await getSeries({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/series/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(seriesQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Series unavailable — StoryPass" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.series.title} — StoryPass`;
    const description = loaderData.series.tagline ?? loaderData.series.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SeriesLayout,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">This series didn't load.</p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <h1 className="font-display text-3xl">Series not found</h1>
      <Button asChild className="mt-4">
        <Link to="/discover">Browse the library</Link>
      </Button>
    </PageShell>
  ),
});

const TABS = [
  { to: "/series/$slug", label: "Chapters" },
  { to: "/series/$slug/books", label: "Books" },
  { to: "/series/$slug/bible", label: "Story Bible" },
  { to: "/series/$slug/lineage", label: "Lineage" },
] as const;

function SeriesLayout() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(seriesQuery(slug));
  const { series, creator, chapters, contributorCount, liveGames } = data;
  const { user } = useSession();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(series.follower_count);
  const toggleFollow = useServerFn(followFn);
  const fetchMyFollows = useServerFn(getMyFollows);

  useEffect(() => {
    if (user) {
      fetchMyFollows({ data: { targetType: "series", targetIds: [series.id] } })
        .then((set) => setFollowing(set.has(series.id)))
        .catch(() => {});
    }
  }, [user, series.id, fetchMyFollows]);

  return (
    <PageShell>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <StoryCover title={series.title} genre={series.genre} />
        <div>
          <Badge variant="secondary">{series.genre}</Badge>
          <h1 className="font-display mt-3 text-4xl leading-tight tracking-tight">{series.title}</h1>
          {series.tagline ? <p className="mt-2 text-lg text-primary">{series.tagline}</p> : null}
          <p className="mt-4 max-w-2xl text-muted-foreground">{series.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {creator ? (
              <Link to="/creators/$username" params={{ username: creator.username }} className="hover:text-foreground">
                Curated by {creator.display_name}
              </Link>
            ) : null}
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" /> {chapters.length} chapters
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {contributorCount} contributors
            </span>
            <span>{followerCount} followers</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {chapters[0] ? (
              <Button asChild>
                <Link to="/chapters/$slug" params={{ slug: chapters[0].slug }}>
                  Start reading free
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link to="/play">Join the next chapter</Link>
            </Button>
            {user ? (
              <Button
                variant={following ? "outline" : "secondary"}
                onClick={async () => {
                  setFollowing((v) => !v);
                  setFollowerCount((n) => (following ? n - 1 : n + 1));
                  try {
                    const res = await toggleFollow({ data: { targetType: "series", targetId: series.id } });
                    setFollowing(res.following);
                    setFollowerCount(res.count);
                  } catch {
                    setFollowing((v) => !v);
                    setFollowerCount((n) => (following ? n + 1 : n - 1));
                  }
                }}
              >
                {following ? "Following" : "Follow series"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {liveGames.length > 0 ? (
        <section className="mt-10 rounded-xl border border-live/40 bg-card p-5">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-live" />
            <h2 className="font-display text-lg">Being written right now</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {liveGames.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 p-3">
                <div>
                  <p className="text-sm font-semibold">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.player_count}/{g.max_players} players · round {g.current_round}/{g.rounds}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to="/play/$id" params={{ id: g.id }}>
                    Join
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="mt-10 border-b border-border">
        <ul className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <li key={tab.label}>
              <Link
                to={tab.to}
                params={{ slug }}
                className="inline-block border-b-2 border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "border-primary text-foreground" }}
                inactiveProps={{ className: cn("border-transparent") }}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </PageShell>
  );
}
