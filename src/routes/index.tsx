import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Target, Users, TrendingUp, AlertTriangle, Rocket, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StartupValidator — Validate Your Startup Idea Before You Build" },
      { name: "description", content: "AI-powered SWOT, competitor insights, revenue models, and scaling roadmaps for your startup idea — in seconds." },
      { property: "og:title", content: "StartupValidator — Validate Your Startup Idea" },
      { property: "og:description", content: "AI-powered SWOT, competitor insights, revenue models, and scaling roadmaps in seconds." },
    ],
  }),
  component: Landing,
});

const INDUSTRIES = [
  "Consumer Apps", "B2B", "MarketPlace", "SaaS", "E-Commerce",
  "FinTech", "HealthTech", "EdTech", "AI/ML", "Blockchain",
];

const FEATURES = [
  { icon: Target, title: "SWOT Analysis", desc: "Get comprehensive strength, weakness, opportunity, and threat analysis powered by AI." },
  { icon: Users, title: "Competitor Insights", desc: "Discover your main competitors and their threat levels in the market." },
  { icon: TrendingUp, title: "Revenue Models", desc: "Explore viable monetization strategies tailored to your startup idea." },
  { icon: AlertTriangle, title: "Risk Assessment", desc: "Quantified risk scores across competition, feasibility, demand, and regulation." },
  { icon: Rocket, title: "Scaling Roadmap", desc: "Get expert recommendations for taking your startup to the next level." },
  { icon: DollarSign, title: "Backed by Data", desc: "Make informed decisions with insights distilled from market signals." },
];

function Landing() {
  const { session } = useAuth();
  const ctaTo = session ? "/dashboard" : "/auth";
  return (
    <div className="min-h-screen">
      <header className="absolute inset-x-0 top-0 z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link to="/" className="font-display text-2xl tracking-tight">StartupValidator</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Button asChild variant="hero"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/auth">Login</Link></Button>
                <Button asChild variant="hero"><Link to="/auth" search={{ mode: "register" } as never}>Get Started</Link></Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-40 pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, transparent 0 60px, oklch(0.18 0.02 260) 60px 62px)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Validate Your Startup Idea
            <br />
            <span className="text-gradient-brand">Before You Build</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
            Get AI-powered SWOT analysis, competitor insights, revenue models, and scaling
            strategies in seconds. Make informed decisions backed by data.
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to={ctaTo}>Validate Your Idea Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* INDUSTRY MARQUEE */}
      <section className="border-y border-border/60 bg-card/40 py-6 backdrop-blur">
        <div className="flex gap-12 overflow-hidden">
          <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap">
            {[...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES].map((c, i) => (
              <span key={i} className="text-lg font-medium text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl"><span className="text-gradient">Everything You Need to Validate</span></h2>
          <p className="mt-3 text-muted-foreground">Comprehensive analysis powered by advanced AI</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card p-7 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-28 text-center">
        <div className="rounded-3xl border border-border/60 bg-card p-12 shadow-[var(--shadow-elegant)]">
          <h2 className="text-4xl">Ready to validate?</h2>
          <p className="mt-3 text-muted-foreground">Stop guessing. Start building with confidence.</p>
          <Button asChild variant="hero" size="xl" className="mt-8">
            <Link to={ctaTo}>Get Started Free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} StartupValidator
      </footer>

      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </div>
  );
}
