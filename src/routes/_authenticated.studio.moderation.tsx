import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Shield, X } from "lucide-react";

import { PageShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { useServerFn } from "@tanstack/react-start";

const moderationQuery = () =>
  queryOptions({
    queryKey: ["moderation-queue"],
    queryFn: () => getModerationQueue({ data: undefined }),
  });

type Report = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  resolved: boolean;
  created_at: string;
};

const getModerationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isMod } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "moderator",
    });
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isMod && !isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("reports")
      .select("id, reporter_id, target_type, target_id, reason, resolved, created_at")
      .eq("resolved", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Report[];
  });

const resolveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reportId: string; targetType: string; targetId: string; hideTarget?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { data: isMod } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "moderator",
    });
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isMod && !isAdmin) throw new Error("Forbidden");
    await context.supabase.from("reports").update({ resolved: true }).eq("id", data.reportId);
    if (data.hideTarget) {
      if (data.targetType === "chapter") {
        await context.supabase.from("chapters").update({ status: "hidden" }).eq("id", data.targetId);
      } else if (data.targetType === "comment") {
        await context.supabase.from("comments").update({ status: "hidden" }).eq("id", data.targetId);
      } else if (data.targetType === "contribution") {
        await context.supabase.from("contributions").update({ status: "hidden" }).eq("id", data.targetId);
      }
    }
    return { ok: true };
  });

export const Route = createFileRoute("/_authenticated/studio/moderation")({
  loader: ({ context }) => context.queryClient.ensureQueryData(moderationQuery()),
  component: ModerationPage,
  head: () => ({
    meta: [{ title: "Moderation — StoryPass" }, { name: "description", content: "Moderation queue for StoryPass." }],
  }),
});

function ModerationPage() {
  const { data } = useSuspenseQuery(moderationQuery());
  const resolve = useServerFn(resolveReport);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <Shield className="size-6 text-primary" />
          <h1 className="font-display text-3xl tracking-tight">Moderation queue</h1>
        </div>

        {data.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">No open reports.</p>
        ) : (
          <ul className="mt-8 space-y-3">
            {data.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{r.target_type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm">{r.reason}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await resolve({ data: { reportId: r.id } });
                    }}
                  >
                    <Check className="mr-1 size-4" /> Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await resolve({ data: { reportId: r.id, hideTarget: true } });
                    }}
                  >
                    <X className="mr-1 size-4" /> Hide target
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
