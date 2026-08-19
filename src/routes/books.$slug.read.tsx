import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getBookReadState } from "@/lib/depth.functions";
import { useSession } from "@/hooks/use-session";

const readQuery = (slug: string) =>
  queryOptions({
    queryKey: ["book-read", slug],
    queryFn: async () => {
      const data = await getBookReadState({ data: { bookSlug: slug } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/books/$slug/read")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(readQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Book unavailable — StoryWeaver" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Read ${loaderData.title} — ${loaderData.series?.title ?? "StoryWeaver"}`;
    return {
      meta: [
        { title },
        { name: "description", content: `Read ${loaderData.title} continuously on StoryWeaver.` },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Read ${loaderData.title} continuously on StoryWeaver.`,
        },
      ],
    };
  },
  component: BookReadPage,
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

function BookReadPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(readQuery(slug));
  const { user } = useSession();
  const [index, setIndex] = useState(0);

  const resumeIndex = useMemo(() => {
    if (!user) return 0;
    const lastCompleted = data.chapters.findIndex((c) => !c.progress?.completed);
    return lastCompleted === -1 ? 0 : lastCompleted;
  }, [data.chapters, user]);

  useEffect(() => {
    setIndex(resumeIndex);
  }, [resumeIndex]);

  const chapter = data.chapters[index];
  const prev = data.chapters[index - 1];
  const next = data.chapters[index + 1];

  if (!chapter) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl py-20 text-center">
          <h1 className="font-display text-2xl">No chapters yet</h1>
          <Button asChild className="mt-4">
            <Link to="/books/$slug" params={{ slug }}>
              Back to book
            </Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const paragraphs = chapter.published_content.split(/\n\n+/).filter(Boolean);

  return (
    <PageShell className="pb-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/books/$slug" params={{ slug }}>
              <ChevronLeft className="size-4" /> {data.title}
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            {index + 1} / {data.chapters.length}
          </span>
        </div>

        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Chapter {chapter.sequence}
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight tracking-tight">{chapter.title}</h1>

        <article className="prose-story mt-8">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          {prev ? (
            <Button variant="outline" size="sm" onClick={() => setIndex((i) => i - 1)}>
              <ChevronLeft className="size-4" /> Previous
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/play">Join the next chapter</Link>
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
