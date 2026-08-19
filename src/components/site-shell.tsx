import { Link } from "@tanstack/react-router";
import { Flame, Menu, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/play", label: "Play" },
  { to: "/studio", label: "Studio" },
] as const;

export function SiteHeader() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="surface-ember flex size-8 items-center justify-center rounded-lg">
            <Flame className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg tracking-tight">StoryPass</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/play">My games</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void supabase.auth.signOut();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">
                  <Sparkles className="size-4" /> Start free
                </Link>
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label="Menu"
            className="rounded-md p-2 text-muted-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      {open ? (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p className="font-display text-base text-foreground">StoryPass</p>
        <p>Humans make it unpredictable. AI makes it a book.</p>
        <div className="sm:ml-auto flex gap-4">
          <Link to="/discover" className="hover:text-foreground">
            Discover
          </Link>
          <Link to="/play" className="hover:text-foreground">
            Play
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className={cn("mx-auto w-full max-w-6xl px-4 py-10", className)}>{children}</main>
      <SiteFooter />
    </div>
  );
}
