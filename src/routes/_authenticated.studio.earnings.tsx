import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudioDashboard } from "@/lib/studio.functions";
import { queryOptions } from "@tanstack/react-query";

const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["studio", "dashboard"],
    queryFn: () => getStudioDashboard(),
  });

export const Route = createFileRoute("/_authenticated/studio/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — StoryPass Studio" },
      { name: "description", content: "Track your StoryPass creator earnings." },
      { property: "og:title", content: "Earnings — StoryPass Studio" },
      { property: "og:description", content: "Track your StoryPass creator earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQueryOptions()),
  component: EarningsPage,
});

function EarningsPage() {
  const { data } = useSuspenseQuery(dashboardQueryOptions());
  const total = data.earnings.reduce((sum, e) => sum + e.amount_cents, 0);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/studio">
            <ArrowLeft className="mr-2 size-4" />
            Studio
          </Link>
        </Button>

        <h1 className="mt-6 font-display text-3xl tracking-tight">Earnings</h1>
        <p className="mt-1 text-muted-foreground">Estimated revenue from subscriptions and unlocks.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <DollarSign className="size-5 text-primary" />
              Lifetime estimated earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl tracking-tight">${(total / 100).toFixed(2)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Payouts are processed manually while payout automation is in beta.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Monthly breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data.earnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No earnings recorded yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.earnings.map((e) => (
                  <div key={e.period} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <span className="text-muted-foreground">{e.period}</span>
                    <div className="text-right">
                      <p className="font-medium">${(e.amount_cents / 100).toFixed(2)}</p>
                      <p className="text-xs capitalize text-muted-foreground">{e.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
