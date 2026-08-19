import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { StoryCover } from "@/components/story-cover";
import { Badge } from "@/components/ui/badge";
import { creatorQuery } from "./creators.$username";

export const Route = createFileRoute("/creators/$username/")({
  component: CreatorIndexPage,
});

function CreatorIndexPage() {
  const { username } = Route.useParams();
  const { data } = useSuspenseQuery(creatorQuery(username));
  const { profile, series, achievements, contributions } = data;

  return (
    <>
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
    </>
  );
}
