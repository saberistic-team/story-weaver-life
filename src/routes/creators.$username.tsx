import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getCreator } from "@/lib/content.functions";
import { followFn, getMyFollows } from "@/lib/social.functions";
import { useSession } from "@/hooks/use-session";
import { useServerFn } from "@tanstack/react-start";

export const creatorQuery = (username: string) =>
  queryOptions({
    queryKey: ["creator", username],
    queryFn: async () => {
      const data = await getCreator({ data: { username } });
      if (!data) throw notFound();
      return data;
    },
  });

const TAB_LINKS = [
  { to: "/creators/$username" as const, label: "Profile" },
  { to: "/creators/$username/achievements" as const, label: "Achievements" },
];

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
  component: CreatorLayout,
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

function CreatorLayout() {
  const { username } = Route.useParams();
  const { data } = useSuspenseQuery(creatorQuery(username));
  const { profile, followers } = data;
  const { user } = useSession();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(followers);
  const toggleFollow = useServerFn(followFn);
  const fetchMyFollows = useServerFn(getMyFollows);

  useEffect(() => {
    if (user && user.id !== profile.id) {
      fetchMyFollows({ data: { targetType: "creator", targetIds: [profile.id] } })
        .then((set) => setFollowing(set.has(profile.id)))
        .catch(() => {});
    }
  }, [user, profile.id, fetchMyFollows]);

  return (
    <PageShell>
      <header className="flex flex-wrap items-center gap-5">
        <div className="surface-ember size-20 rounded-full" />
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-tight">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Storyteller level {profile.level}</span>
            <span>{profile.story_points} story points</span>
            <span>{followerCount} followers</span>
          </div>
        </div>
        {user && user.id !== profile.id ? (
          <Button
            variant={following ? "outline" : "default"}
            onClick={async () => {
              setFollowing((v) => !v);
              setFollowerCount((n) => (following ? n - 1 : n + 1));
              try {
                const res = await toggleFollow({ data: { targetType: "creator", targetId: profile.id } });
                setFollowing(res.following);
                setFollowerCount(res.count);
              } catch {
                setFollowing((v) => !v);
                setFollowerCount((n) => (following ? n + 1 : n - 1));
              }
            }}
          >
            {following ? "Following" : "Follow"}
          </Button>
        ) : null}
      </header>

      <nav className="mt-8 flex gap-6 border-b border-border pb-px">
        {TAB_LINKS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            params={{ username }}
            activeProps={{ className: "border-b-2 border-primary text-foreground" }}
            className="-mb-px pb-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </PageShell>
  );
}
