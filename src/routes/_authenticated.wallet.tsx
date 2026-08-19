import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Flame, Star } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { getSparkLedger, getStoryPointLedger, getWallet } from "@/lib/economy.functions";

const walletQuery = () =>
  queryOptions({
    queryKey: ["wallet"],
    queryFn: () => getWallet({ data: undefined }),
  });

const sparkLedgerQuery = () =>
  queryOptions({
    queryKey: ["spark-ledger"],
    queryFn: () => getSparkLedger({ data: undefined }),
  });

const storyPointLedgerQuery = () =>
  queryOptions({
    queryKey: ["story-point-ledger"],
    queryFn: () => getStoryPointLedger({ data: undefined }),
  });

export const Route = createFileRoute("/_authenticated/wallet")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(walletQuery()),
      context.queryClient.ensureQueryData(sparkLedgerQuery()),
      context.queryClient.ensureQueryData(storyPointLedgerQuery()),
    ]),
  component: WalletPage,
  head: () => ({
    meta: [{ title: "Wallet — StoryPass" }, { name: "description", content: "Your Sparks and Story Points." }],
  }),
});

function WalletPage() {
  const { data: wallet } = useSuspenseQuery(walletQuery());
  const { data: sparks } = useSuspenseQuery(sparkLedgerQuery());
  const { data: points } = useSuspenseQuery(storyPointLedgerQuery());

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl tracking-tight">Your wallet</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="size-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Sparks</span>
            </div>
            <p className="font-display mt-2 text-4xl">{wallet.sparks.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Spend to join premium games and unlock polish styles.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <Star className="size-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Story Points</span>
            </div>
            <p className="font-display mt-2 text-4xl">{wallet.storyPoints.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Earned by writing, reading, and being loved.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="font-display text-xl">Spark ledger</h2>
            {sparks.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {sparks.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">{tx.reason}</span>
                    <span className={`text-sm font-medium ${tx.amount >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl">Story Point ledger</h2>
            {points.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {points.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">{tx.reason}</span>
                    <span className="text-sm font-medium text-green-500">+{tx.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
