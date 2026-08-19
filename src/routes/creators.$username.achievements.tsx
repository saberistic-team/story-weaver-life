import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Award, ChevronLeft, Lock } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCreator } from "@/lib/content.functions";
import { getMyAchievements } from "@/lib/depth.functions";
import { useSession } from "@/hooks/use-session";

const creatorQuery = (username: string) =>
  queryOptions({
    queryKey: ["creator", username],
    queryFn: async () => {
      const data = await getCreator({ data: { username } });
      if (!data) throw notFound();
      return data;
    },
  });

const achievementsQuery = () =>
  queryOptions({
    queryKey: ["my-achievements"],
    queryFn: async () => {
      try {
        return await getMyAchievements();
      } catch {
        return { earned: [], available: [] };
      }
    },
  });

export const Route = createFileRoute("/creators/$username/achievements")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(creatorQuery(params.username));
    return context.queryClient.ensureQueryData(achievementsQuery());
  },
  head: ({ params }) => {
    const title = `Achievements — @${params.username} — StoryPass`;
    return {
      meta: [
        { title },
        { name: "description", content: `See badges and achievements earned by @${params.username}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `See badges and achievements earned by @${params.username}.` },
      ],
    };
  },
  component: AchievementsPage,
  errorComponent: () => (
    <PageShell>
      <p className="text-muted-foreground">This profile didn't load.</p>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <h1 className="font-display text-3xl">Creator not found</h1>
      <Button asChild className="mt-4">
        <Link to="/discover">Browse the library</Link>
      </Button>
    </PageShell>
  ),
});

function AchievementsPage() {
  const { username } = Route.useParams();
  const { data: creatorData } = useSuspenseQuery(creatorQuery(username));
  const { data: achievements } = useSuspenseQuery(achievementsQuery());
  const { user } = useSession();
  const isMe = user?.id === creatorData.profile.id;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link to="/creators/$username" params={{ username }}>
            <ChevronLeft className="size-4" /> {creatorData.profile.display_name}
          </Link>
        </Button>

        <div className="mt-4 flex items-center gap-3">
          <Award className="size-6 text-primary" />
          <h1 className="font-display text-3xl tracking-tight">Achievements</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          {creatorData.profile.display_name} is level {creatorData.profile.level} with{" "}
          {creatorData.profile.story_points.toLocaleString()} story points.
        </p>

        {achievements.earned.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl">Earned</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {achievements.earned.map((a) => (
                <div
                  key={a.achievement_code}
                  className="rounded-xl border border-primary/40 bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="surface-ember flex size-10 shrink-0 items-center justify-center rounded-full">
                      <Award className="size-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{a.name}</h3>
                      <p className="text-xs text-muted-foreground">+{a.story_points} story points</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {isMe && achievements.available.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-xl">Next up</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {achievements.available.map((a) => (
                <div key={a.code} className="rounded-xl border border-border bg-card p-5 opacity-80">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Lock className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{a.name}</h3>
                      <p className="text-xs text-muted-foreground">+{a.story_points} story points</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{a.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs">
                      <span>
                        {a.progress} / {a.target}
                      </span>
                      <span className="text-muted-foreground">{Math.min(100, Math.round((a.progress / a.target) * 100))}%</span>
                    </div>
                    <Progress value={Math.min(100, (a.progress / a.target) * 100)} className="mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
