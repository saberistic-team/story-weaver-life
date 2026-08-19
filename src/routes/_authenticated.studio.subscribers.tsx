import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubscription } from "@/lib/studio.functions";
import { queryOptions } from "@tanstack/react-query";

const subscriptionQueryOptions = () =>
  queryOptions({
    queryKey: ["studio", "subscription"],
    queryFn: () => getSubscription(),
  });

export const Route = createFileRoute("/_authenticated/studio/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — StoryWeaver Studio" },
      { name: "description", content: "View your StoryWeaver subscribers." },
      { property: "og:title", content: "Subscribers — StoryWeaver Studio" },
      { property: "og:description", content: "View your StoryWeaver subscribers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(subscriptionQueryOptions()),
  component: SubscribersPage,
});

function SubscribersPage() {
  const { data: subscription } = useSuspenseQuery(subscriptionQueryOptions());

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/studio">
            <ArrowLeft className="mr-2 size-4" />
            Studio
          </Link>
        </Button>

        <h1 className="mt-6 font-display text-3xl tracking-tight">Subscribers</h1>
        <p className="mt-1 text-muted-foreground">Readers supporting your work through paid tiers.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Users className="size-5 text-primary" />
              Per-creator subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              StoryWeaver subscriptions are platform-wide for now. As readers upgrade to Supporter or Patron, they
              unlock every premium series on the platform. Per-creator subscription splits and direct tipping are on
              the roadmap.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Crown className="size-5 text-primary" />
              Your subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription?.active ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="capitalize">
                    {subscription.tier}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{subscription.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current period ends{" "}
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : "never"}
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You do not have an active Supporter or Patron subscription.
                </p>
                <Button asChild size="sm">
                  <Link to="/pricing">View plans</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
