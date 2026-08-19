import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to StoryWeaver" },
      {
        name: "description",
        content: "Set up your StoryWeaver profile and discover your first story.",
      },
    ],
  }),
  component: OnboardingPage,
});

const GENRES = [
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Romance",
  "Horror",
  "Historical",
  "Comedy",
  "Adventure",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth" });
      return;
    }
    if (user?.user_metadata?.["display_name"]) {
      setDisplayName(user.user_metadata["display_name"] as string);
    }
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const handle = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (handle.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }
    if (chosen.length === 0) {
      toast.error("Pick at least one genre you love.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim() || handle,
          username: handle,
          favorite_genres: chosen,
        },
      });
      if (error) throw error;
      await supabase.from("profiles").upsert({
        id: user.id,
        username: handle,
        display_name: displayName.trim() || handle,
        bio: null,
        avatar_url: null,
        favorite_genres: chosen,
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem("storyweaver:onboarded", "true");
      toast.success("Profile ready — let's weave some stories.");
      void navigate({ to: "/discover" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl tracking-tight">Welcome to StoryWeaver</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us a little about yourself so we can match you with stories you'll love.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex Chen"
            className="mt-1.5"
            required
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="alexchen"
            className="mt-1.5"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Used in your public profile URL.</p>
        </div>

        <div>
          <Label>Favorite genres</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const active = chosen.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setChosen((prev) =>
                      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Start exploring"}
        </Button>
      </form>
    </main>
  );
}
