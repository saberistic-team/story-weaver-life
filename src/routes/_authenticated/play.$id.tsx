import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Clock, Sparkles, Users, Wand2, Wifi, WifiOff } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getGame } from "@/lib/content.functions";
import { advanceGameFn, joinGameFn, submitTurnFn } from "@/lib/play.functions";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/play/$id")({
  head: () => ({
    meta: [
      { title: "Live game — StoryWeaver" },
      { name: "description", content: "Take your turn in a live Pass the Story game." },
      { property: "og:title", content: "Live game — StoryWeaver" },
      { property: "og:description", content: "One sentence at a time, on the clock." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GameRoom,
});

function useCountdown(endsAt: string | null | undefined) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) return setLeft(0);
    const tick = () =>
      setLeft(Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function GameRoom() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [optimisticContribs, setOptimisticContribs] = useState<
    { id: string; original_text: string; author?: { display_name: string } | null }[]
  >([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(true);
  const joined = useRef(false);

  const game = useQuery({ queryKey: ["game", id], queryFn: () => getGame({ data: { id } }) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["game", id] });

  // Realtime: any change to this game's tables re-reads authoritative state.
  useEffect(() => {
    const channel = supabase
      .channel(`game:${id}`, {
        config: { presence: { key: user?.id ?? "guest" } },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_turns", filter: `game_id=eq.${id}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contributions", filter: `game_id=eq.${id}` },
        () => {
          setOptimisticContribs([]);
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${id}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${id}` },
        refresh,
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            const uid = (p as { user_id?: string }).user_id;
            if (uid) ids.add(uid);
          });
        });
        setOnlineIds(ids);
      })
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    // Track own presence.
    if (user) {
      void channel.track({ user_id: user.id, online_at: new Date().toISOString() });
    }

    // Reconnect handler: refresh state when browser comes back online.
    const onOnline = () => {
      refresh();
      if (user) void channel.track({ user_id: user.id, online_at: new Date().toISOString() });
    };
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const data = game.data;
  const isPlayer = !!data?.players.some((p) => p.user_id === user?.id);

  // Auto-join once, then keep the authoritative engine ticking.
  useEffect(() => {
    if (!data || !user || joined.current) return;
    joined.current = true;
    const run = isPlayer
      ? advanceGameFn({ data: { gameId: id } })
      : joinGameFn({ data: { gameId: id } });
    void run.then(refresh).catch((e: Error) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, user, isPlayer, id]);

  const activeTurn = data?.activeTurn ?? null;
  const secondsLeft = useCountdown(activeTurn?.ends_at);

  useEffect(() => {
    if (!activeTurn || secondsLeft > 0) return;
    void advanceGameFn({ data: { gameId: id } })
      .then(refresh)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, activeTurn?.id, id]);

  if (game.isLoading) {
    return (
      <PageShell>
        <p className="text-muted-foreground">Opening the table…</p>
      </PageShell>
    );
  }
  if (!data) {
    return (
      <PageShell>
        <h1 className="font-display text-3xl">Game not found</h1>
        <Button asChild className="mt-4">
          <Link to="/play">Back to Play</Link>
        </Button>
      </PageShell>
    );
  }

  const { game: g, players, contributions, challenge, series } = data;
  const myTurn = !!activeTurn && activeTurn.player_id === user?.id;
  const latest = contributions[contributions.length - 1] ?? null;
  const finished = ["completed", "published", "processing"].includes(g.status);

  const context =
    g.visibility_mode === "open"
      ? [...contributions, ...optimisticContribs]
      : g.visibility_mode === "contextual"
        ? [...contributions.slice(-1), ...optimisticContribs]
        : [];

  async function submit() {
    const body = text.trim();
    if (body.length < 20) return;
    setBusy(true);
    // Optimistically show the contribution locally until Realtime confirms it.
    const optimisticId = `opt-${Date.now()}`;
    setOptimisticContribs((prev) => [
      ...prev,
      {
        id: optimisticId,
        original_text: body,
        author: user ? { display_name: user.user_metadata?.["display_name"] ?? "You" } : null,
      },
    ]);
    try {
      await submitTurnFn({ data: { gameId: id, text: body } });
      setText("");
      toast.success(`+${g.reward_sparks} Sparks — passed to the next player.`);
      await refresh();
    } catch (error) {
      setOptimisticContribs((prev) => prev.filter((c) => c.id !== optimisticId));
      toast.error(error instanceof Error ? error.message : "Could not submit your turn");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={g.status === "active" ? "destructive" : "secondary"}>{g.status}</Badge>
            {!connected ? (
              <span className="inline-flex items-center gap-1 text-xs text-live">
                <WifiOff className="size-3" /> Reconnecting…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Wifi className="size-3" /> Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {players.length}/{g.max_players}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" /> {g.reward_sparks} per turn
            </span>
          </div>
        </div>

        <h1 className="font-display mt-4 text-3xl leading-tight tracking-tight">{g.title}</h1>
        {series ? (
          <Link
            to="/series/$slug"
            params={{ slug: series.slug }}
            className="mt-1 inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            part of {series.title}
          </Link>
        ) : null}
        <p className="mt-3 text-muted-foreground">{g.premise}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-2.5 py-1">
            Round {g.current_round}/{g.rounds}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1">
            {g.visibility_mode} context
          </span>
          <span className="rounded-full border border-border px-2.5 py-1">
            {g.max_chars} chars max
          </span>
          {g.ai_gm_enabled ? (
            <span className="rounded-full border border-primary/40 px-2.5 py-1 text-primary">
              AI Game Master
            </span>
          ) : null}
        </div>

        {challenge ? (
          <div className="mt-6 rounded-xl border border-primary/40 bg-card p-4">
            <div className="flex items-center gap-2 text-primary">
              <Wand2 className="size-4" />
              <span className="text-xs tracking-widest uppercase">{challenge.kind}</span>
            </div>
            <p className="mt-2">{challenge.text}</p>
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="font-display text-lg">
            {g.visibility_mode === "blind" ? "You're writing blind" : "The story so far"}
          </h2>
          {context.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {g.visibility_mode === "blind"
                ? "No context this round — trust your instincts and the premise."
                : "Nobody has written yet. Set the scene."}
            </p>
          ) : (
            <div className="prose-story mt-3 rounded-xl p-5">
              {context.map((c) => (
                <p key={c.id}>{c.original_text}</p>
              ))}
            </div>
          )}
          {latest?.author ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last turn by {latest.author.display_name}
            </p>
          ) : null}
        </section>

        {finished ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
            <h2 className="font-display text-2xl">This story is done</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              AI is weaving the turns into a chapter. It'll appear in the library shortly.
            </p>
            <Button asChild className="mt-4">
              <Link to="/discover">Read the library</Link>
            </Button>
          </div>
        ) : (
          <section className="mt-8 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">
                {myTurn
                  ? "Your turn"
                  : activeTurn
                    ? "Waiting on another player"
                    : "Waiting for players"}
              </h2>
              {activeTurn ? (
                <span
                  className={`flex items-center gap-1.5 text-sm ${secondsLeft <= 10 ? "text-live" : "text-muted-foreground"}`}
                >
                  <Clock className="size-4" /> {secondsLeft}s
                </span>
              ) : null}
            </div>
            <Textarea
              className="mt-4 min-h-32"
              placeholder={myTurn ? "Write the next few sentences…" : "Wait for the pass…"}
              value={text}
              maxLength={g.max_chars}
              disabled={!myTurn || busy}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {text.length}/{g.max_chars}
              </span>
              <Button
                disabled={!myTurn || busy || text.trim().length < 20}
                onClick={() => void submit()}
              >
                Submit & pass
              </Button>
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-display text-lg">At the table</h2>
          <ul className="mt-3 space-y-2">
            {players.map((p) => (
              <li
                key={p.id}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                  activeTurn?.player_id === p.user_id
                    ? "border-primary/60 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block size-2 rounded-full ${onlineIds.has(p.user_id) ? "bg-green-500" : "bg-muted-foreground/40"}`}
                    aria-hidden
                  />
                  {p.profile?.display_name ?? "Player"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.is_host ? "host" : `seat ${p.seat_order + 1}`}
                  {activeTurn?.player_id === p.user_id ? " · writing" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
