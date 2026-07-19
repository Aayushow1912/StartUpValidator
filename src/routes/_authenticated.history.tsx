import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

interface Row { id: string; idea: string; created_at: string }

function HistoryPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase
      .from("analyses")
      .select("id, idea, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/dashboard"><ArrowLeft /> Back to Dashboard</Link>
      </Button>
      <h1 className="text-4xl">Analysis History</h1>
      <p className="mt-2 text-muted-foreground">All your past startup idea validations</p>

      <div className="mt-10 space-y-3">
        {rows === null && <p className="text-muted-foreground">Loading...</p>}
        {rows?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">No analyses yet. Validate your first idea!</p>
            <Button asChild variant="hero" className="mt-4"><Link to="/dashboard">Get Started</Link></Button>
          </div>
        )}
        {rows?.map((r) => (
          <Link
            key={r.id}
            to="/analysis/$id"
            params={{ id: r.id }}
            className="block rounded-xl border border-border/60 bg-card p-5 transition hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium">{r.idea}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}