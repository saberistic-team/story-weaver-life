import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";
import { bootstrapAccount } from "@/lib/play.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to StoryPass" },
      {
        name: "description",
        content: "Create a free StoryPass account to keep reading, join live games, and earn Sparks.",
      },
      { property: "og:title", content: "Sign in to StoryPass" },
      { property: "og:description", content: "Free account. Keep reading and take your turn." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    void bootstrapAccount().finally(() => {
      const next = typeof window !== "undefined" ? sessionStorage.getItem("storypass:next") : null;
      sessionStorage.removeItem("storypass:next");
      void navigate({ to: next && next.startsWith("/") ? next : "/play" });
    });
  }, [user, loading, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("Account created — welcome to StoryPass.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="font-display text-3xl tracking-tight">
          {mode === "signup" ? "Create your free account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep reading where you left off, join live games, and start earning Sparks.
        </p>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => {
            void lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin + "/auth",
            });
          }}
        >
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "I already have an account" : "I need an account"}
        </button>

        <p className="mt-8 text-xs text-muted-foreground">
          Just browsing?{" "}
          <Link to="/discover" className="underline underline-offset-4">
            Keep exploring the library
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
