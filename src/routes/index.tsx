import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Beaker,
  BrainCircuit,
  Flame,
  GraduationCap,
  Rocket,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — STEMLab AI" },
      { name: "description", content: "Your AI-powered virtual STEM laboratory dashboard." },
    ],
  }),
  component: Dashboard,
});

const EXPERIMENTS = [
  { to: "/experiments/chemistry", title: "Chemical Reactions", desc: "Mix reagents and watch chemistry unfold.", icon: Beaker, color: "var(--science)" },
  { to: "/experiments/circuit", title: "Circuit Builder", desc: "Wire batteries, bulbs and switches.", icon: Zap, color: "var(--tech)" },
  { to: "/experiments/projectile", title: "Projectile Motion", desc: "Launch and trace parabolic flight.", icon: Rocket, color: "var(--engineering)" },
] as const;

function Dashboard() {
  const { progress } = useProgress();
  const masteryPct = Math.min(100, Math.round((progress.concepts.length / 20) * 100));
  const quizAvg = progress.quizzes.length
    ? Math.round((progress.quizzes.reduce((a, q) => a + (q.score / q.total), 0) / progress.quizzes.length) * 100)
    : 0;

  return (
    <AppShell>
      {/* Hero */}
      <section className="glass-strong relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" /> AI-Powered Lab
            </Badge>
            <h1 className="text-3xl font-bold md:text-4xl">
              Run experiments. <span className="gradient-text">Understand why.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Mix chemicals, build circuits, launch projectiles — then tap one button to have AI explain exactly what happened.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/experiments/chemistry"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow transition hover:opacity-90"
              >
                Start Experimenting <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tutor"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-accent/40"
              >
                <BrainCircuit className="h-4 w-4" /> Ask the Tutor
              </Link>
            </div>
          </div>

          {/* STEM Score card */}
          <div className="glass relative w-full max-w-xs rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">STEM Score</div>
              <Award className="h-4 w-4 text-[color:var(--engineering)]" />
            </div>
            <div className="mt-1 text-4xl font-bold gradient-text">{progress.stemScore}</div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-[color:var(--science)]" />
              +{progress.runs.length * 25 + progress.quizzes.reduce((a, q) => a + q.score * 15, 0)} this week
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Runs" value={progress.runs.length} />
              <Stat label="Quizzes" value={progress.quizzes.length} />
              <Stat label="🔥 Days" value={progress.streak} />
            </div>
          </div>
        </div>
      </section>

      {/* Experiments grid */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Available Experiments</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {EXPERIMENTS.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              className="glass-strong group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 hover:glow"
            >
              <div
                className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition group-hover:opacity-60"
                style={{ background: e.color }}
              />
              <div
                className="grid h-12 w-12 place-items-center rounded-xl text-white"
                style={{ background: e.color }}
              >
                <e.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-lg font-semibold">{e.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Open lab <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass-strong lg:col-span-2 rounded-2xl p-5">
          <h2 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Activity
          </h2>
          <ul className="space-y-2.5">
            {progress.runs.slice(0, 5).map((r) => (
              <li key={r.id} className="glass flex items-center gap-3 rounded-xl p-3">
                <div
                  className="grid h-9 w-9 place-items-center rounded-lg text-white"
                  style={{
                    background:
                      r.experiment === "chemistry"
                        ? "var(--science)"
                        : r.experiment === "circuit"
                          ? "var(--tech)"
                          : "var(--engineering)",
                  }}
                >
                  {r.experiment === "chemistry" ? <Beaker className="h-4 w-4" /> : r.experiment === "circuit" ? <Zap className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.result}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">{timeAgo(r.at)}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-strong rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Learning Progress</h2>
          <div className="space-y-4">
            <ProgressRow label="Concept Mastery" pct={masteryPct} hint={`${progress.concepts.length}/20 concepts`} />
            <ProgressRow label="Quiz Average" pct={quizAvg} hint={`${progress.quizzes.length} quizzes`} />
            <ProgressRow label="Experiment Variety" pct={Math.min(100, new Set(progress.runs.map((r) => r.experiment)).size * 33)} hint="3 labs available" />
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm">
            <Flame className="h-4 w-4 text-[color:var(--engineering)]" />
            <span><strong>{progress.streak}-day streak.</strong> Keep going!</span>
          </div>
          <Link
            to="/quiz"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm font-medium hover:bg-accent/40"
          >
            <GraduationCap className="h-4 w-4" /> Take an AI Quiz
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-background/40 px-2 py-1.5">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgressRow({ label, pct, hint }: { label: string; pct: number; hint: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
