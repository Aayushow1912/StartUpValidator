import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Target, TrendingUp, DollarSign, AlertTriangle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analysis/$id")({
  component: AnalysisPage,
});

interface SwotBlock { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }
interface Competitor { name: string; description: string; threat: string }
interface Revenue { name: string; description: string; viability: string }
interface RiskItem { name: string; score: number; description: string }
interface Result {
  swot: SwotBlock;
  competitors: Competitor[];
  revenueModels: Revenue[];
  risks: { overall: number; items: RiskItem[] };
  scaling: string;
}
interface Row { id: string; idea: string; created_at: string; result: Result }

function AnalysisPage() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Row | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("analyses").select("*").eq("id", id).maybeSingle()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else if (!data) setErr("Not found");
        else setRow(data as unknown as Row);
      });
  }, [id]);

  if (err) return <main className="mx-auto max-w-3xl px-6 py-12 text-center text-muted-foreground">{err}</main>;
  if (!row) return <main className="mx-auto max-w-3xl px-6 py-12 text-center text-muted-foreground">Loading...</main>;

  const r = row.result;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/dashboard"><ArrowLeft /> Back to Dashboard</Link>
      </Button>

      <h1 className="text-3xl leading-tight md:text-4xl">{row.idea}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Analyzed on {new Date(row.created_at).toLocaleDateString()}
      </p>

      {/* SWOT */}
      <Section icon={Target} title="SWOT Analysis">
        <div className="grid gap-4 md:grid-cols-2">
          <SwotCard color="oklch(0.7 0.15 150)" title="Strengths" items={r.swot.strengths} />
          <SwotCard color="oklch(0.6 0.22 25)" title="Weaknesses" items={r.swot.weaknesses} />
          <SwotCard color="oklch(0.55 0.23 260)" title="Opportunities" items={r.swot.opportunities} />
          <SwotCard color="oklch(0.78 0.15 75)" title="Threats" items={r.swot.threats} />
        </div>
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section icon={TrendingUp} title="Competitors" inline>
          <div className="space-y-3">
            {r.competitors.map((c, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{c.name}</h4>
                  <ThreatBadge level={c.threat} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section icon={DollarSign} title="Revenue Models" inline>
          <div className="space-y-3">
            {r.revenueModels.map((m, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{m.name}</h4>
                  <ViabilityBadge level={m.viability} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* RISK */}
      <Section icon={AlertTriangle} title="Market Risk Analysis">
        <div className="text-center">
          <div className="text-5xl text-gradient-brand font-display">{r.risks.overall.toFixed(1)}/10</div>
          <p className="text-sm text-muted-foreground">Overall Risk Score</p>
        </div>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={r.risks.items} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "oklch(0.55 0.23 260 / 0.08)" }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {r.risks.items.map((_, i) => (
                  <Cell key={i} fill="oklch(0.55 0.23 260)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-3">
          {r.risks.items.map((item) => (
            <div key={item.name} className="rounded-lg border border-border/60 bg-card/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="font-display text-xl text-primary">{item.score}/10</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Rocket} title="Scaling Recommendations">
        <div className="space-y-4 text-base leading-relaxed text-foreground/90">
          {r.scaling.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>
    </main>
  );
}

function Section({
  icon: Icon, title, children, inline,
}: { icon: React.ElementType; title: string; children: React.ReactNode; inline?: boolean }) {
  return (
    <section className={inline ? "rounded-2xl border border-border/60 bg-card/60 p-6" : "mt-8 rounded-2xl border border-border/60 bg-card/60 p-6 md:p-8"}>
      <h2 className="mb-5 flex items-center gap-2 text-2xl">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SwotCard({ color, title, items }: { color: string; title: string; items: string[] }) {
  return (
    <div
      className="rounded-xl border-l-4 bg-card/80 p-5"
      style={{ borderLeftColor: color, backgroundColor: `color-mix(in oklch, ${color} 6%, transparent)` }}
    >
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThreatBadge({ level }: { level: string }) {
  const cls = level.includes("High") ? "bg-destructive/10 text-destructive"
    : level.includes("Medium") ? "bg-[oklch(0.78_0.15_75/0.15)] text-[oklch(0.55_0.18_75)]"
    : "bg-[oklch(0.7_0.15_150/0.15)] text-[oklch(0.45_0.15_150)]";
  return <Badge className={`${cls} hover:${cls}`} variant="secondary">{level}</Badge>;
}
function ViabilityBadge({ level }: { level: string }) {
  const cls = level.includes("High") ? "bg-[oklch(0.7_0.15_150/0.15)] text-[oklch(0.45_0.15_150)]"
    : level.includes("Medium") ? "bg-[oklch(0.78_0.15_75/0.15)] text-[oklch(0.55_0.18_75)]"
    : "bg-destructive/10 text-destructive";
  return <Badge className={`${cls} hover:${cls}`} variant="secondary">{level}</Badge>;
}