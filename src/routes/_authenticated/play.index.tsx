import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Radio, Sparkles, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlayableGames } from "@/lib/content.functions";
import { getMyState } from "@/lib/play.functions";

export const Route = createFileRoute("/_authenticated/play/")({
  head: () => ({
    meta: [
      { title: "Play — StoryPass" },
      {
        name: "description",
        content: "Join a live Pass the Story game, take your turn, and watch AI weave it into a chapter.",
      },
      { property: "og:title", content: "Play — StoryPass" },
      { property: "og:description", content: "Live collaborative storytelling games, on the clock." },
    ],
  }),
  component: PlayHub,
});

function PlayHub() {
  const games = useQuery({ queryKey: ["playable-games"], queryFn: () => getPlayableGames() });
  const me = useQuery({ queryKey: ["my-state"], queryFn: () => getMyState() });

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Play</h1>
          <p className="mt-2 text-muted-foreground">
            Pick a story in progress, or start one and invite the room.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm">
            <Sparkles className="size-4 text-primary" /> {me.data?.sparks ?? 0} Sparks
          </span>
          <Button asChild>
            <Link to="/play/new">
              <Plus className="size-4" /> New game
            </Link>
          </Button>
        </div>
      </div>

      {me.data?.games && me.data.games.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl">Your games</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {me.data.games.map((g) => (
              <Link
                key={g!.id}
                to="/play/$id"
                params={{ id: g!.id }}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <Badge variant="secondary">{g!.status}</Badge>
                <h3 className="font-display mt-2 text-lg leading-tight">{g!.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Round {g!.current_round}/{g!.rounds} · {g!.genre}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-live" />
          <h2 className="font-display text-xl">Open tables</h2>
        </div>
        {games.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Looking for open tables…</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(games.data ?? []).map((game) => (
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
                    {game.turn_seconds}s turns · {game.visibility_mode}
                  </span>
                  <Button asChild size="sm">
                    <Link to="/play/$id" params={{ id: game.id }}>
                      Open
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
