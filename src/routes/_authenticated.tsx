import { createFileRoute, Outlet, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { History, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [session, loading, navigate]);

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const name = (user?.user_metadata?.name as string | undefined) ?? user?.email?.split("@")[0] ?? "User";

  async function logout() {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="font-display text-2xl">StartupValidator</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
            <Button asChild variant="secondary" size="sm">
              <Link to="/history"><History /> History</Link>
            </Button>
            <Button onClick={logout} variant="outline" size="sm"><LogOut /> Logout</Button>
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}