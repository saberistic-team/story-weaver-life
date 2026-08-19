import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, Library } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSeries } from "@/lib/content.functions";
import { getBible } from "@/lib/depth.functions";

const seriesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["series", slug],
    queryFn: async () => {
      const data = await getSeries({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

const bibleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["bible", slug],
    queryFn: async () => {
      const data = await getBible({ data: { seriesSlug: slug } });
      return data;
    },
  });

export const Route = createFileRoute("/series/$slug/bible")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(seriesQuery(params.slug));
    return context.queryClient.ensureQueryData(bibleQuery(params.slug));
  },
  head: ({ params }) => {
    const title = `Story Bible — ${params.slug} — StoryPass`;
    const description = `Explore the characters, places, and rules of this series.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BiblePage,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">This Story Bible didn't load.</p>
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

function BiblePage() {
  const { slug } = Route.useParams();
  const { data: seriesData } = useSuspenseQuery(seriesQuery(slug));
  const { data: entries } = useSuspenseQuery(bibleQuery(slug));
  const { series, creator } = seriesData;

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    const list = acc[e.kind] ?? [];
    list.push(e);
    acc[e.kind] = list;
    return acc;
  }, {});

  const kinds = Object.entries(grouped);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/series/$slug" params={{ slug }}>
            <ChevronLeft className="size-4" /> {series.title}
          </Link>
        </Button>

        <div className="mt-4 flex items-center gap-3">
          <Library className="size-6 text-primary" />
          <div>
            <h1 className="font-display text-3xl tracking-tight">Story Bible</h1>
            <p className="text-sm text-muted-foreground">
              The canon reference for {series.title}
              {creator ? ` · curated by ${creator.display_name}` : ""}
            </p>
          </div>
        </div>

        {kinds.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center">
            <BookOpen className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              This Story Bible is still being written. Entries appear once the creator approves them.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {kinds.map(([kind, items]) => (
              <section key={kind}>
                <h2 className="font-display text-xl capitalize">{kind}s</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {items.map((e) => (
                    <article
                      key={e.id}
                      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{e.name}</h3>
                        {e.visibility === "spoiler_gated" ? (
                          <Badge variant="secondary">Spoiler</Badge>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
                      {e.meta && Object.keys(e.meta).length > 0 ? (
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          {Object.entries(e.meta).map(([k, v]) => (
                            <div key={k}>
                              <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
                              <dd className="mt-0.5 text-foreground">{String(v)}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
