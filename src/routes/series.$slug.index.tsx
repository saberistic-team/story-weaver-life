import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { seriesQuery } from "./series.$slug";

export const Route = createFileRoute("/series/$slug/")({
  component: SeriesChaptersTab,
});

function SeriesChaptersTab() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(seriesQuery(slug));
  const { chapters, poll } = data;

  return (
    <>
      <section>
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
    </>
  );
}
