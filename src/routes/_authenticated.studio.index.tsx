import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, DollarSign, PenLine, Plus, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudioDashboard } from "@/lib/studio.functions";
import { queryOptions } from "@tanstack/react-query";

const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["studio", "dashboard"],
    queryFn: () => getStudioDashboard(),
  });

export const Route = createFileRoute("/_authenticated/studio/")({
  head: () => ({
    meta: [
      { title: "Creator Studio — StoryPass" },
      { name: "description", content: "Manage your series, chapters, Story Bible, and earnings." },
      { property: "og:title", content: "Creator Studio — StoryPass" },
      { property: "og:description", content: "Manage your series, chapters, Story Bible, and earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQueryOptions()),
  component: StudioPage,
});

function StudioPage() {
  const { data } = useSuspenseQuery(dashboardQueryOptions());

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight">Creator Studio</h1>
            <p className="mt-1 text-muted-foreground">Manage worlds, curate canon, and grow your readership.</p>
          </div>
          <Button asChild size="sm">
            <Link to="/studio/series/new">
              <Plus className="mr-2 size-4" />
              New series
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <PenLine className="size-5 text-primary" />
                My series
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/studio/series/new">Create</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.series.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">You have not created a series yet.</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link to="/studio/series/new">Start your first universe</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.series.map((s) => (
                    <div key={s.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0">
                      <div>
                        <Link
                          to="/series/$slug"
                          params={{ slug: s.slug }}
                          className="font-display text-base hover:text-primary"
                        >
                          {s.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{s.tagline ?? s.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {s.genre}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {s.is_public ? "Public" : "Private"}
                          </Badge>
                          {s.required_tier !== "free" ? (
                            <Badge className="text-[10px]">{s.required_tier}</Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/studio/series/$slug/edit" params={{ slug: s.slug }}>
                            Edit
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/studio/series/$slug/bible" params={{ slug: s.slug }}>
                            Bible
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <DollarSign className="size-5 text-primary" />
                  Earnings
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/studio/earnings">Details</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.earnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No earnings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.earnings.slice(0, 5).map((e) => (
                      <div key={e.period} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{e.period}</span>
                        <span className="font-medium">${(e.amount_cents / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <BookOpen className="size-5 text-primary" />
                  Chapters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.chapters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No chapters yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.chapters.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{c.title}</span>
                        <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-0 text-xs">
                          <Link to="/studio/chapters/$slug/edit" params={{ slug: c.slug }}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Users className="size-5 text-primary" />
                  Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/studio/subscribers">Subscribers</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/play">My games</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
