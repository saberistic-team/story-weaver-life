import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PageShell } from "@/components/site-shell";
import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCreator } from "@/lib/content.functions";

const creatorQuery = (username: string) =>
  queryOptions({
    queryKey: ["creator", username],
    queryFn: async () => {
      const data = await getCreator({ data: { username } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/creators/$username")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(creatorQuery(params.username)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Creator unavailable — StoryPass" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.profile.display_name} on StoryPass`;
    const description = (loaderData.profile.bio ?? "A StoryPass storyteller.").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: CreatorPage,
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

function CreatorPage() {
  const { username } = Route.useParams();
  const { data } = useSuspenseQuery(creatorQuery(username));
  const { profile, series, contributions, achievements, followers } = data;

  return (
    <PageShell>
      <header className="flex flex-wrap items-center gap-5">
        <div className="surface-ember size-20 rounded-full" />
        <div>
          <h1 className="font-display text-3xl tracking-tight">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/creators/$username/achievements" params={{ username }} className="hover:text-foreground">
              Storyteller level {profile.level}
            </Link>
            <span>{profile.story_points} story points</span>
            <span>{followers} followers</span>
          </div>
        </div>
      </header>
      {profile.bio ? <p className="mt-5 max-w-2xl text-muted-foreground">{profile.bio}</p> : null}

      {series.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Series</h2>
          <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {series.map((s) => (
              <Link key={s.id} to="/series/$slug" params={{ slug: s.slug }} className="group">
                <StoryCover
                  title={s.title}
                  genre={s.genre}
                  className="transition-transform group-hover:-translate-y-1"
                />
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.reader_count} readers</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {achievements.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Badges</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {achievements.map((a) => (
              <Badge key={a.achievement_code} variant="secondary">
                {a.achievements?.name ?? a.achievement_code}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {contributions.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Recent turns</h2>
          <ul className="mt-4 space-y-3">
            {contributions.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground italic">"{c.original_text}"</p>
                {c.chapters ? (
                  <Link
                    to="/chapters/$slug"
                    params={{ slug: c.chapters.slug }}
                    className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
                  >
                    in {c.chapters.title}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
