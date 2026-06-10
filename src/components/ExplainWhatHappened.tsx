import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { explainExperiment } from "@/lib/ai.functions";
import { useProgress } from "@/lib/progress-store";

type Result = Awaited<ReturnType<typeof explainExperiment>>;

export function ExplainWhatHappened({
  experiment,
  setup,
  result,
}: {
  experiment: string;
  setup: string;
  result: string;
}) {
  const explain = useServerFn(explainExperiment);
  const { addConcepts } = useProgress();
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await explain({ data: { experiment, setup, result } });
      setData(r);
      if (r?.keyConcepts) addConcepts(r.keyConcepts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold">AI Explain What Happened</div>
            <div className="text-xs text-muted-foreground">Get an instant, judge-friendly breakdown</div>
          </div>
        </div>
        <Button onClick={run} disabled={loading} size="lg" className="glow">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          {data ? "Re-explain" : "Explain with AI"}
        </Button>
      </div>

      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

      {data && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Headline</div>
            <h3 className="mt-1 text-xl font-bold gradient-text">{data.headline}</h3>
          </div>
          <Section title="What happened">{data.whatHappened}</Section>
          <Section title="Why it happened">{data.whyItHappened}</Section>
          <Section title="Real-world application">{data.realWorld}</Section>
          <Section title="Fun fact ✨">{data.funFact}</Section>
          <div className="glass rounded-xl p-4 md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Key concepts</div>
              <Badge variant="secondary">{data.difficulty}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.keyConcepts.map((c) => (
                <Badge key={c} className="bg-primary/15 text-foreground hover:bg-primary/25">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="prose prose-sm dark:prose-invert mt-1 max-w-none prose-p:my-1">
        <ReactMarkdown>{typeof children === "string" ? children : ""}</ReactMarkdown>
      </div>
    </div>
  );
}
