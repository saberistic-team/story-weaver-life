import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Welcome to StoryPass Premium — StoryPass" },
      { name: "description", content: "Your subscription is active. Start reading premium series and join exclusive games." },
      { property: "og:title", content: "Welcome to StoryPass Premium — StoryPass" },
      { property: "og:description", content: "Your subscription is active. Start reading premium series and joining exclusive games." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle className="mx-auto size-12 text-primary" />
        <h1 className="font-display mt-6 text-3xl tracking-tight">You're all set</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks for supporting StoryPass creators. Your subscription is active and premium chapters are now unlocked.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/discover">Browse premium series</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/play">Join a game</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
