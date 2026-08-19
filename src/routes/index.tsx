import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, PenLine, Radio, Sparkles, Users, Wand2 } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLanding } from "@/lib/content.functions";

const landingQuery = queryOptions({ queryKey: ["landing"], queryFn: () => getLanding() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(landingQuery),
  head: () => ({
    meta: [
      { title: "StoryPass — stories written together, one turn at a time" },
      {
        name: "description",
        content:
          "Join a timed storytelling game, write a few sentences, and watch AI polish the table's turns into a published chapter. Read hundreds of chapters free.",
      },
      { property: "og:title", content: "StoryPass — stories written together, one turn at a time" },
      {
        property: "og:description",
        content: "Humans make it unpredictable. AI makes it a book. Read free, then take a turn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">The home page didn't load. Try refreshing.</p>
    </PageShell>
  ),
});

const STEPS = [
  { icon: Users, title: "Join a table", body: "Two to twelve players, a premise, and a clock." },
  { icon: PenLine, title: "Write your turn", body: "A few sentences. Then you pass." },
  { icon: Wand2, title: "AI polishes", body: "Your words stay yours — the seams disappear." },
  { icon: Sparkles, title: "Read the chapter", body: "The table's turns become a published chapter." },
];

function Landing() {
  const { data } = useSuspenseQuery(landingQuery);

  return (
    <PageShell>
      <section className="py-10 md:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs tracking-widest text-muted-foreground uppercase">
              <Radio className="size-3 text-live" /> {data.liveGames.length} games live now
            </span>
            <h1 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Stories written together,
              <span className="text-primary"> one turn at a time.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              StoryPass is a storytelling game. Players take timed turns writing a few sentences each.
              AI plays Game Master, polishes the prose, and weaves every turn into a real chapter —
              with everyone's original words preserved.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/play">
                  <Sparkles className="size-4" /> Play a story
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/discover">Read {data.chapterCount} chapters free</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No account needed to start reading. Free to play.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Badge variant="destructive">Live turn</Badge>
              <span className="flex items-center gap-1.5 text-sm text-live">
                <Clock className="size-4" /> 0:42
              </span>
            </div>
            <p className="font-display mt-4 text-xl leading-tight">The Lighthouse at Vela</p>
            <div className="prose-story mt-4 rounded-xl p-4 text-sm">
              <p>
                The letter was postmarked eleven months from now, and the handwriting was unmistakably
                her own.
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-primary/40 p-3">
              <span className="flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
                <Wand2 className="size-3" /> Game Master
              </span>
              <p className="mt-1.5 text-sm">Someone in the room already knows what it says.</p>
            </div>
            <div className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
              Maren writing… 218 / 400
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="font-display text-3xl tracking-tight">How a chapter gets made</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-5">
              <step.icon className="size-5 text-primary" />
              <h3 className="font-display mt-3 text-lg">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {data.liveGames.length > 0 ? (
        <section className="border-t border-border py-14">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-live" />
            <h2 className="font-display text-3xl tracking-tight">Being written right now</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.liveGames.map((game) => (
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
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link to="/play/$id" params={{ id: game.id }}>
                    Take a turn
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-border py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl tracking-tight">Living series</h2>
          <Link to="/discover" className="text-sm text-primary underline-offset-4 hover:underline">
            Browse everything
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {data.series.map((s) => (
            <Link key={s.id} to="/series/$slug" params={{ slug: s.slug }} className="group">
              <StoryCover
                title={s.title}
                genre={s.genre}
                className="transition-transform group-hover:-translate-y-1"
              />
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="text-xs text-muted-foreground">
                {s.creator ? s.creator.display_name : s.genre}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16 text-center">
        <h2 className="font-display text-4xl tracking-tight">Your turn is waiting.</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Free account, free Sparks, and a table that needs one more writer.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth">Start writing free</Link>
        </Button>
      </section>
    </PageShell>
  );
}
