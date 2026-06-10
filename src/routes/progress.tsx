import { createFileRoute } from "@tanstack/react-router";
import { Award, BarChart3, Flame, Target, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — STEMLab AI" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { progress, reset } = useProgress();

  const byType = ["chemistry", "circuit", "projectile"].map((k) => ({
    name: k[0].toUpperCase() + k.slice(1),
    runs: progress.runs.filter((r) => r.experiment === k).length,
  }));
  const COLORS = ["var(--science)", "var(--tech)", "var(--engineering)"];

  const quizData = progress.quizzes.slice().reverse().map((q, i) => ({
    name: `#${i + 1}`,
    pct: Math.round((q.score / q.total) * 100),
  }));

  return (
    <AppShell>
      <div className="glass-strong relative mb-4 overflow-hidden rounded-2xl p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-hero)" }}>
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Progress</h1>
            <p className="text-sm text-muted-foreground">Track experiments, quizzes, and concepts mastered.</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={reset}>Reset Demo Data</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatCard icon={<Award className="h-4 w-4" />} label="STEM Score" value={progress.stemScore} accent="var(--math)" />
        <StatCard icon={<Target className="h-4 w-4" />} label="Experiments" value={progress.runs.length} accent="var(--tech)" />
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Quizzes" value={progress.quizzes.length} accent="var(--engineering)" />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Day Streak" value={progress.streak} accent="var(--science)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Quiz Performance</h2>
          <div className="h-64">
            {quizData.length === 0 ? (
              <Empty>No quizzes yet. Take one to see your scores.</Empty>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.15)" />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip
                    cursor={{ fill: "oklch(0.5 0 0 / 0.08)" }}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
                  />
                  <Bar dataKey="pct" radius={[8, 8, 0, 0]} fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Experiment Mix</h2>
          <div className="h-64">
            {byType.every((b) => b.runs === 0) ? (
              <Empty>Run experiments to populate.</Empty>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="runs" innerRadius={50} outerRadius={86} paddingAngle={3}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            {byType.map((b, i) => (
              <div key={b.name} className="glass rounded-lg p-1.5">
                <div className="mx-auto h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                <div className="mt-1 font-semibold">{b.runs}</div>
                <div className="text-muted-foreground">{b.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Concepts Mastered</h2>
          <div className="flex flex-wrap gap-2">
            {progress.concepts.length === 0 && <span className="text-sm text-muted-foreground">None yet — run an experiment and tap “Explain with AI”.</span>}
            {progress.concepts.map((c) => (
              <Badge key={c} className="bg-primary/15 text-foreground hover:bg-primary/25">{c}</Badge>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-3xl font-bold gradient-text">{value}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="grid h-full place-items-center text-sm text-muted-foreground">{children}</div>;
}
