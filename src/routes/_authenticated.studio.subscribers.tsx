import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/studio/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — StoryPass Studio" },
      { name: "description", content: "View your StoryPass subscribers." },
      { property: "og:title", content: "Subscribers — StoryPass Studio" },
      { property: "og:description", content: "View your StoryPass subscribers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscribersPage,
});

function SubscribersPage() {
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
              Coming soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Subscriber management will be available once payments are enabled. Connect a payment provider in
              Studio settings to unlock this view.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
