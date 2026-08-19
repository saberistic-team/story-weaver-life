import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";


const PRICES = [
  {
    id: "supporter_monthly",
    name: "Supporter",
    price: "$4.99",
    period: "/month",
    description: "Unlock every premium chapter, join patron-only games, and support your favorite creators.",
    features: ["All premium series access", "Join patron-only games", "Supporter badge", "Early chapter releases"],
    cta: "Become a Supporter",
  },
  {
    id: "patron_monthly",
    name: "Patron",
    price: "$9.99",
    period: "/month",
    description: "Everything in Supporter, plus cinematic AI polish, creator tipping, and studio beta features.",
    features: [
      "Everything in Supporter",
      "Cinematic AI polish style",
      "Tip creators with Sparks",
      "Studio analytics beta",
      "Priority game hosting",
    ],
    cta: "Become a Patron",
    highlight: true,
  },
];

const ANNUAL_PRICES: Record<string, { price: string; priceId: string }> = {
  supporter_monthly: { price: "$49.00", priceId: "supporter_yearly" },
  patron_monthly: { price: "$99.00", priceId: "patron_yearly" },
};

export const Route = createFileRoute("/pricing")({
  loader: ({ context }) => context.queryClient.ensureQueryData(queryOptions({ queryKey: ["pricing-empty"], queryFn: () => ({}) })),
  head: () => ({
    meta: [
      { title: "Pricing — StoryPass" },
      { name: "description", content: "Support creators and unlock premium series with StoryPass subscriptions." },
      { property: "og:title", content: "Pricing — StoryPass" },
      { property: "og:description", content: "Support creators and unlock premium series with StoryPass subscriptions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useSession();
  const { openCheckout, loading } = usePaddleCheckout();
  const [yearly, setYearly] = useState(false);

  return (
    <PageShell>
      <PaymentTestModeBanner />
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-4xl tracking-tight">Support the story</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Premium subscriptions unlock every chapter, exclusive games, and advanced AI polish. Choose the plan that fits your reading life.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            type="button"
            onClick={() => setYearly((v) => !v)}
            className="relative h-6 w-11 rounded-full bg-primary/20 transition-colors"
            aria-label="Toggle yearly billing"
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-primary transition-transform ${yearly ? "translate-x-5" : ""}`}
            />
          </button>
          <span className={`text-sm ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly <span className="text-primary">save 2 months</span>
          </span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PRICES.map((plan) => {
            const annual = ANNUAL_PRICES[plan.id]!;
            const priceId = yearly ? annual.priceId : plan.id;
            const displayPrice = yearly ? annual.price : plan.price;
            const displayPeriod = yearly ? "/year" : plan.period;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 text-left ${plan.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <h2 className="font-display text-2xl">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-5 font-display text-4xl">
                  {displayPrice}
                  <span className="text-lg text-muted-foreground">{displayPeriod}</span>
                </p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  disabled={loading}
                  onClick={() => {
                    if (!user) {
                      sessionStorage.setItem("storypass:next", "/pricing");
                      window.location.href = "/auth";
                      return;
                    }
                    void openCheckout({
                      priceId,
                      quantity: 1,
                      ...(user.email ? { customerEmail: user.email } : {}),
                      customData: { userId: user.id },
                      successUrl: `${window.location.origin}/checkout/success`,
                    });
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Questions? Read our{" "}
          <Link to="/discover" className="text-primary underline">
            community guidelines
          </Link>{" "}
          or contact support.
        </p>
      </div>
    </PageShell>
  );
}
