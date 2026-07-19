import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { analyzeIdea } from "@/lib/analyze.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const analyze = useServerFn(analyzeIdea);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 10) {
      toast.error("Please describe your idea in a bit more detail");
      return;
    }
    setLoading(true);
    try {
      const { id } = await analyze({ data: { idea: idea.trim() } });
      router.invalidate();
      navigate({ to: "/analysis/$id", params: { id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl">
          Validate Your <span className="text-gradient-brand">Startup Idea</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Describe your startup idea and get AI-powered insights in seconds
        </p>
      </div>

      <form onSubmit={submit} className="mt-12 rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="space-y-3">
          <Label htmlFor="idea" className="text-base">Your Startup Idea</Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea — what it does, who it's for, and the problem it solves..."
            className="min-h-[180px] text-base"
            disabled={loading}
          />
        </div>
        <Button type="submit" variant="hero" className="mt-6 h-12 w-full text-base" disabled={loading}>
          {loading ? <><Loader2 className="animate-spin" /> Analyzing your idea...</> : <><Sparkles /> Validate My Idea</>}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Your analysis includes: SWOT Analysis · Competitor Insights · Revenue Models · Risk Assessment · Scaling Roadmap
      </p>
    </main>
  );
}