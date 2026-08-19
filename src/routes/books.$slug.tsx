import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/content.functions";

const bookQuery = (slug: string) =>
  queryOptions({
    queryKey: ["book", slug],
    queryFn: async () => {
      const data = await getBook({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/books/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(bookQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Book unavailable — StoryWeaver" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.book.title} — ${loaderData.series.title} — StoryWeaver`;
    const description = loaderData.book.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BookPage,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">This book didn't load.</p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <h1 className="font-display text-3xl">Book not found</h1>
      <Button asChild className="mt-4">
        <Link to="/discover">Browse the library</Link>
      </Button>
    </PageShell>
  ),
});

function BookPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(bookQuery(slug));
  const { book, series, creator, chapters } = data;

  return (
    <PageShell>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <StoryCover title={book.title} genre={series.genre} />
        <div>
          <Link
            to="/series/$slug"
            params={{ slug: series.slug }}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {series.title}
          </Link>
          <h1 className="font-display mt-2 text-4xl leading-tight tracking-tight">{book.title}</h1>
          {book.subtitle ? (
            <p className="mt-2 text-lg text-muted-foreground">{book.subtitle}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{book.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Book {book.sequence} · {chapters.length} chapters
              {creator ? ` · curated by ${creator.display_name}` : ""}
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-muted-foreground">{book.description}</p>
          {chapters[0] ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/chapters/$slug" params={{ slug: chapters[0].slug }}>
                  Read chapter {chapters[0].sequence}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/books/$slug/read" params={{ slug }}>
                  Read continuously
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

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
                  <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                    {c.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
