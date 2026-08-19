import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, PenLine, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/studio/")({
  head: () => ({
    meta: [
      { title: "Studio — StoryPass" },
      { name: "description", content: "Manage your series, games, and Story Bible entries." },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl tracking-tight">Studio</h1>
        <p className="mt-2 text-muted-foreground">
          Create a universe, curate canon, and manage your Story Bible.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="surface-ember flex size-10 items-center justify-center rounded-lg">
                <PenLine className="size-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-lg">New series</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Start a universe, define the canon mode, and invite players to your first game.
            </p>
            <Button className="mt-4" size="sm" disabled>
              Coming soon
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg">Story Bible</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Approve entries, mark spoilers, and keep continuity clean for readers.
            </p>
            <Button className="mt-4" size="sm" variant="outline" asChild>
              <Link to="/discover">Browse series</Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-lg">Games & contributors</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Review active tables, approve contributions into canon, and assemble finished games into books.
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" asChild>
                <Link to="/play">My games</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/play/new">Start a game</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
