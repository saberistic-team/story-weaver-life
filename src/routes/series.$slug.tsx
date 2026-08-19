import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Radio, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSeries } from "@/lib/content.functions";

const seriesQuery = (slug: string) =>
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
  component: SeriesPage,
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

function SeriesPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(seriesQuery(slug));
  const { series, creator, books, chapters, bible, liveGames, poll, contributorCount } = data;

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
            <span>{series.reader_count} readers</span>
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
          </div>
        </div>
      </div>

      {liveGames.length > 0 ? (
        <section className="mt-12 rounded-xl border border-live/40 bg-card p-5">
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

      <section className="mt-12">
        <h2 className="font-display text-2xl">Chapters</h2>
        <ol className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {chapters.map((c) => (
            <li key={c.id}>
              <Link
                to="/chapters/$slug"
                params={{ slug: c.slug }}
                className="flex gap-4 p-4 transition-colors hover:bg-secondary/60"
              >
                <span className="font-display w-8 shrink-0 text-lg text-primary">{c.sequence}</span>
                <span className="min-w-0">
                  <span className="block font-semibold">{c.title}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{c.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {books.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Books</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => (
              <Link
                key={b.id}
                to="/books/$slug"
                params={{ slug: b.slug }}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <span className="text-xs tracking-widest text-muted-foreground uppercase">Book {b.sequence}</span>
                <h3 className="font-display mt-1 text-lg">{b.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{b.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {poll ? (
        <section className="mt-12 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">What happens next?</h2>
          <p className="mt-1 text-sm text-muted-foreground">{poll.question}</p>
          <ul className="mt-4 space-y-2">
            {poll.options.map((o) => {
              const total = poll.options.reduce((sum, x) => sum + x.vote_count, 0) || 1;
              const pct = Math.round((o.vote_count / total) * 100);
              return (
                <li key={o.id} className="rounded-lg bg-secondary/60 p-3">
                  <div className="flex justify-between text-sm">
                    <span>{o.text}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-background">
                    <div className="surface-ember h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {bible.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Story bible</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bible.slice(0, 9).map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-card p-4">
                <span className="text-xs tracking-widest text-primary uppercase">{e.kind}</span>
                <h3 className="mt-1 font-semibold">{e.name}</h3>
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{e.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
