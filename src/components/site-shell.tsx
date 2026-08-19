import { Link } from "@tanstack/react-router";
import { Bell, Flame, Menu, Sparkles, Crown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { getNotifications } from "@/lib/social.functions";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/following", label: "Following" },
  { to: "/play", label: "Play" },
  { to: "/studio", label: "Studio" },
] as const;

function NotificationBell() {
  const { user } = useSession();
  const [unread, setUnread] = useState(0);
  const fetchNotifications = useServerFn(getNotifications);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      fetchNotifications({ data: { unreadOnly: true } })
        .then((list) => setUnread(list.length))
        .catch(() => {});
    };
    load();
    const sub = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnread((n) => n + 1),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(sub);
    };
  }, [user, fetchNotifications]);

  return (
    <Link
      to="/notifications"
      className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary"
    >
      <Bell className="size-5" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}

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
          <span className="font-display text-lg tracking-tight">StoryWeaver</span>
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
              <NotificationBell />
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/pricing">
                  <Crown className="mr-1 size-3.5" /> Premium
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/wallet">Wallet</Link>
              </Button>
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
                <Link to="/pricing">Pricing</Link>
              </Button>
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
        <p className="font-display text-base text-foreground">StoryWeaver</p>
        <p>Humans make it unpredictable. AI makes it a book.</p>
        <div className="sm:ml-auto flex gap-4">
          <Link to="/discover" className="hover:text-foreground">
            Discover
          </Link>
          <Link to="/play" className="hover:text-foreground">
            Play
          </Link>
          <a href="/sitemap.xml" className="hover:text-foreground">
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen">
      <PaymentTestModeBanner />
      <SiteHeader />
      <main className={cn("mx-auto w-full max-w-6xl px-4 py-10", className)}>{children}</main>
      <SiteFooter />
    </div>
  );
}
