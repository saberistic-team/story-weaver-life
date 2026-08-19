import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Crown, Radio, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDiscover } from "@/lib/content.functions";


const discoverQuery = queryOptions({
  queryKey: ["discover"],
  queryFn: () => getDiscover({ data: {} }),
});

export const Route = createFileRoute("/discover")({
  loader: ({ context }) => context.queryClient.ensureQueryData(discoverQuery),
  head: () => ({
    meta: [
      { title: "Discover collaborative stories — StoryWeaver" },
      {
        name: "description",
        content:
          "Browse living series written by hundreds of players, read chapters free, and jump into a live storytelling game.",
      },
      { property: "og:title", content: "Discover collaborative stories — StoryWeaver" },
      {
        property: "og:description",
        content: "Living series written by players, polished by AI. Read free, then take a turn.",
      },
    ],
  }),
  component: DiscoverPage,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">The library didn't load. Try refreshing.</p>
    </PageShell>
  ),
});

function DiscoverPage() {
  const { data } = useSuspenseQuery(discoverQuery);

  return (
    <PageShell>
      <h1 className="font-display text-4xl tracking-tight">Discover</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Every series here started as a game. Read the finished chapters, then join the next one.
      </p>

      {data.liveGames.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-live" />
            <h2 className="font-display text-xl">Games you can join right now</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.liveGames.map((game) => (
              <article key={game.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={game.status === "active" ? "destructive" : "secondary"}>
                    {game.status === "active" ? "Live" : "Filling up"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" /> {game.player_count}/{game.max_players}
                  </span>
                </div>
                <h3 className="font-display mt-3 text-lg leading-tight">{game.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{game.premise}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Round {game.current_round}/{game.rounds} · {game.turn_seconds}s turns
                  </span>
                  <Button asChild size="sm">
                    <Link to="/play/$id" params={{ id: game.id }}>
                      Join
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="font-display text-xl">Series</h2>
        <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {data.series.map((s) => (
            <Link key={s.id} to="/series/$slug" params={{ slug: s.slug }} className="group relative">
              {s.required_tier !== "free" ? (
                <Badge variant="default" className="absolute right-2 top-2 z-10 gap-1">
                  <Crown className="size-3" /> {s.required_tier}
                </Badge>
              ) : null}
              <StoryCover
                title={s.title}
                genre={s.genre}
                className="transition-transform group-hover:-translate-y-1"
              />
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="text-xs text-muted-foreground">
                {s.creator ? `by ${s.creator.display_name}` : s.genre} · {s.reader_count} readers
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl">Fresh chapters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.newChapters.map((c) => (
            <Link
              key={c.id}
              to="/chapters/$slug"
              params={{ slug: c.slug }}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span className="text-xs tracking-widest text-primary uppercase">
                Chapter {c.sequence}
              </span>
              <h3 className="font-display mt-1 text-lg leading-tight">{c.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl">Creators to follow</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.creators.map((c) => (
            <Link
              key={c.id}
              to="/creators/$username"
              params={{ username: c.username }}
              className="flex gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <div className="surface-ember size-11 shrink-0 rounded-full" />
              <div>
                <p className="font-semibold">{c.display_name}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{c.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
