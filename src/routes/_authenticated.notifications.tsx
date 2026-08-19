import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Gamepad2, MessageCircle, Trophy, UserPlus, Wand2 } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getNotifications, markReadFn } from "@/lib/social.functions";
import { useServerFn } from "@tanstack/react-start";

const notificationsQuery = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ data: {} }),
  });

export const Route = createFileRoute("/_authenticated/notifications")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQuery()),
  component: NotificationsPage,
  head: () => ({
    meta: [{ title: "Notifications — StoryPass" }, { name: "description", content: "Your StoryPass notifications." }],
  }),
});

const ICONS: Record<string, React.ReactNode> = {
  turn: <Gamepad2 className="size-4" />,
  submitted: <Wand2 className="size-4" />,
  completed: <Wand2 className="size-4" />,
  published: <MessageCircle className="size-4" />,
  like: <Gamepad2 className="size-4" />,
  comment: <MessageCircle className="size-4" />,
  follow: <UserPlus className="size-4" />,
  achievement: <Trophy className="size-4" />,
};

function NotificationsPage() {
  const { data } = useSuspenseQuery(notificationsQuery());
  const markRead = useServerFn(markReadFn);

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl tracking-tight">Notifications</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await markRead({ data: {} });
            }}
          >
            <Check className="mr-1 size-4" /> Mark all read
          </Button>
        </div>

        {data.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="mt-8 space-y-3">
            {data.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 rounded-xl border border-border p-4 ${n.read_at ? "bg-background" : "bg-card"}`}
              >
                <div className="mt-0.5 text-primary">{ICONS[n.kind] ?? <MessageCircle className="size-4" />}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body ? <p className="text-sm text-muted-foreground">{n.body}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {n.link ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to={n.link}>Open</Link>
                    </Button>
                  ) : null}
                  {!n.read_at ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0 text-xs"
                      onClick={async () => {
                        await markRead({ data: { notificationId: n.id } });
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
