import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Search = { mode?: "login" | "register" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "register" ? "register" : "login",
  }),
  head: () => ({ meta: [{ title: "Sign In — StartupValidator" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const router = useRouter();
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.invalidate();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <Link to="/" className="font-display text-2xl">StartupValidator</Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md items-center px-6">
        <div className="w-full rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-elegant)]">
          <div className="text-center">
            <h1 className="font-display text-3xl">StartupValidator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRegister ? "Create your account to get started" : "Sign in to validate your ideas"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" className="h-11 w-full" disabled={loading}>
              {isRegister ? <UserPlus /> : <LogIn />}
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              to="/auth"
              search={{ mode: isRegister ? "login" : "register" }}
              className="font-semibold text-primary hover:underline"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}