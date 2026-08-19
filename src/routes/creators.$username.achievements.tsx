import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Award, Lock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { getMyAchievements } from "@/lib/depth.functions";
import { useSession } from "@/hooks/use-session";
import { creatorQuery } from "./creators.$username";

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
  errorComponent: () => <p className="text-muted-foreground">This profile didn't load.</p>,
  notFoundComponent: () => <p className="text-muted-foreground">Creator not found.</p>,
});

function AchievementsPage() {
  const { username } = Route.useParams();
  const { data: creatorData } = useSuspenseQuery(creatorQuery(username));
  const { data: achievements } = useSuspenseQuery(achievementsQuery());
  const { user } = useSession();
  const isMe = user?.id === creatorData.profile.id;

  return (
    <div>
      <div className="flex items-center gap-3">
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
  );
}
