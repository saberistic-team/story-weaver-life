import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { seriesQuery } from "./series.$slug";

export const Route = createFileRoute("/series/$slug/books")({
  component: SeriesBooksTab,
});

function SeriesBooksTab() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(seriesQuery(slug));
  const { books } = data;

  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <BookOpen className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No books assembled yet. Chapters are published as games finish.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="font-display text-2xl">Books</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <article key={b.id} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
            <span className="text-xs tracking-widest text-muted-foreground uppercase">Book {b.sequence}</span>
            <h3 className="font-display mt-1 text-lg">{b.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{b.description}</p>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/books/$slug" params={{ slug: b.slug }}>Details</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/books/$slug/read" params={{ slug: b.slug }}>Read</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
