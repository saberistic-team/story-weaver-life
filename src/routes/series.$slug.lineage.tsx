import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { GitBranch } from "lucide-react";

import { getCanonTree } from "@/lib/depth.functions";

const lineageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["lineage", slug],
    queryFn: async () => {
      const data = await getCanonTree({ data: { seriesSlug: slug } });
      return data;
    },
  });

export const Route = createFileRoute("/series/$slug/lineage")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(lineageQuery(params.slug)),
  head: () => ({
    meta: [
      { title: "Canon Lineage — StoryWeaver" },
      { name: "description", content: "Explore how chapters branch and merge in this series." },
    ],
  }),
  component: SeriesLineageTab,
});

function SeriesLineageTab() {
  const { slug } = Route.useParams();
  const { data: roots } = useSuspenseQuery(lineageQuery(slug));

  if (roots.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <GitBranch className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No published lineage yet.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="font-display text-2xl">Canon & forks</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Canon chapters are the official thread. Forks branch from a chapter or a game and become alternate timelines.
      </p>
      <div className="mt-6 space-y-4">
        {roots.map((node) => (
          <CanonNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </section>
  );
}

function CanonNode({ node, depth }: { node: Awaited<ReturnType<typeof getCanonTree>>[number]; depth: number }) {
  return (
    <div className="relative" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-primary">{node.sequence}</span>
          <div className="min-w-0 flex-1">
            <Link
              to="/chapters/$slug"
              params={{ slug: node.slug }}
              className="block font-semibold hover:text-primary"
            >
              {node.title}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {node.is_canon ? "Canon" : "Alternate"}
              {node.forked_from_chapter_id ? " · forked" : ""}
            </p>
          </div>
        </div>
      </div>
      {node.children.length > 0 ? (
        <div className="mt-4 space-y-4 border-l border-border pl-4">
          {node.children.map((child) => (
            <CanonNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
