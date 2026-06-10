import { createFileRoute } from "@tanstack/react-router";
import { Battery, Lightbulb, Power, Zap, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AiTutorPanel } from "@/components/AiTutorPanel";
import { ExplainWhatHappened } from "@/components/ExplainWhatHappened";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/experiments/circuit")({
  head: () => ({ meta: [{ title: "Circuit Builder — STEMLab AI" }] }),
  component: CircuitLab,
});

function CircuitLab() {
  const [batteries, setBatteries] = useState(1); // 1.5V each
  const [bulbs, setBulbs] = useState(1); // 3Ω each
  const [switchOn, setSwitchOn] = useState(true);
  const { addRun } = useProgress();

  const voltage = batteries * 1.5;
  const resistance = Math.max(1, bulbs * 3);
  const current = switchOn && batteries > 0 && bulbs > 0 ? voltage / resistance : 0;
  const brightness = Math.min(1, current / 0.5); // 0..1
  const works = current > 0;

  const status = useMemo(() => {
    if (!batteries) return "No battery — no current.";
    if (!bulbs) return "Add a bulb to see anything.";
    if (!switchOn) return "Switch is open — circuit is broken.";
    return `Current flowing at ${current.toFixed(2)}A. Bulbs at ${Math.round(brightness * 100)}% brightness.`;
  }, [batteries, bulbs, switchOn, current, brightness]);

  const runOnce = () => addRun({
    experiment: "circuit",
    label: `${batteries} battery × ${bulbs} bulb (switch ${switchOn ? "closed" : "open"})`,
    result: status,
  });

  return (
    <AppShell>
      <Header icon={<Zap className="h-5 w-5" />} title="Circuit Builder" subtitle="Build a series circuit and measure the current." accent="var(--tech)" />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Builder */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Counter label="Batteries (1.5V)" icon={<Battery className="h-4 w-4" />} value={batteries} setValue={setBatteries} min={0} max={4} />
              <Counter label="Bulbs (3Ω)" icon={<Lightbulb className="h-4 w-4" />} value={bulbs} setValue={setBulbs} min={0} max={4} />
              <div className="glass rounded-xl p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
                  <Power className="h-4 w-4" /> Switch
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{switchOn ? "Closed" : "Open"}</span>
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                </div>
              </div>
            </div>

            {/* Diagram */}
            <div className="relative mt-6 h-56 overflow-hidden rounded-2xl border border-border/60 bg-background/30 p-6">
              <svg viewBox="0 0 800 200" className="h-full w-full">
                <defs>
                  <linearGradient id="wire" x1="0" x2="1">
                    <stop offset="0" stopColor="oklch(0.72 0.2 230)" />
                    <stop offset="1" stopColor="oklch(0.72 0.2 280)" />
                  </linearGradient>
                </defs>
                {/* Wire path */}
                <path
                  d="M 60 100 L 180 100 L 180 40 L 620 40 L 620 100 L 740 100 L 740 160 L 60 160 Z"
                  fill="none"
                  stroke={works ? "url(#wire)" : "oklch(0.55 0.02 260)"}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
                {/* Current dots */}
                {works &&
                  [0, 0.2, 0.4, 0.6, 0.8].map((p) => (
                    <circle key={p} r="5" fill="oklch(0.9 0.18 230)">
                      <animateMotion
                        dur={`${Math.max(0.6, 2 - current)}s`}
                        repeatCount="indefinite"
                        begin={`${p * 2}s`}
                        path="M 60 100 L 180 100 L 180 40 L 620 40 L 620 100 L 740 100 L 740 160 L 60 160 Z"
                      />
                    </circle>
                  ))}

                {/* Batteries */}
                {Array.from({ length: batteries }).map((_, i) => {
                  const x = 220 + i * 80;
                  return (
                    <g key={`b${i}`}>
                      <rect x={x} y={20} width={60} height={40} rx={6} fill="oklch(0.78 0.18 70)" />
                      <text x={x + 30} y={45} textAnchor="middle" fontSize="14" fill="oklch(0.15 0 0)" fontWeight={700}>1.5V</text>
                    </g>
                  );
                })}

                {/* Bulbs */}
                {Array.from({ length: bulbs }).map((_, i) => {
                  const x = 220 + i * 130;
                  const lit = works;
                  return (
                    <g key={`bulb${i}`} transform={`translate(${x},120)`}>
                      <circle r="26" fill={lit ? `oklch(0.92 0.18 90 / ${brightness})` : "oklch(0.4 0.02 260)"} />
                      <circle r="20" fill="none" stroke={lit ? "oklch(0.85 0.16 80)" : "oklch(0.5 0 0)"} strokeWidth="2" />
                      <Lightbulb x={-10} y={-10} width="20" height="20" color={lit ? "oklch(0.2 0.05 60)" : "oklch(0.7 0 0)"} />
                    </g>
                  );
                })}

                {/* Switch */}
                <g transform="translate(700,150)">
                  <circle r="5" fill="oklch(0.7 0.05 260)" />
                  <line x1="0" y1="0" x2={switchOn ? 30 : 22} y2={switchOn ? 0 : -16} stroke="oklch(0.85 0.05 260)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx={30} cy={0} r="5" fill="oklch(0.7 0.05 260)" />
                </g>
              </svg>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Stat label="Voltage" value={`${voltage.toFixed(1)} V`} />
              <Stat label="Resistance" value={`${resistance} Ω`} />
              <Stat label="Current" value={`${current.toFixed(2)} A`} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className={`glass flex-1 rounded-xl px-4 py-3 text-sm ${works ? "border-[color:var(--science)]/40" : "border-destructive/40"} border`}>
                {status}
              </div>
              <Button onClick={runOnce} className="glow">Log Run</Button>
            </div>
          </div>

          <ExplainWhatHappened
            experiment="Electric Circuit"
            setup={`${batteries} × 1.5V battery, ${bulbs} × 3Ω bulb, switch ${switchOn ? "closed" : "open"} in series.`}
            result={status}
          />
        </div>

        <div className="h-[640px] lg:sticky lg:top-20">
          <AiTutorPanel
            context={`Circuit lab. Series circuit with ${batteries} batteries, ${bulbs} bulbs, switch ${switchOn ? "closed" : "open"}. Current: ${current.toFixed(2)}A.`}
            seedQuestions={[
              "Why does the bulb get dimmer when I add more bulbs?",
              "What does Ohm's Law say?",
              "How is this different from a parallel circuit?",
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}

function Counter({ label, icon, value, setValue, min, max }: { label: string; icon: React.ReactNode; value: number; setValue: (n: number) => void; min: number; max: number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">{icon}{label}</div>
      <div className="flex items-center justify-between">
        <Button size="icon" variant="outline" onClick={() => setValue(Math.max(min, value - 1))}><Trash2 className="h-4 w-4" /></Button>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <Button size="icon" onClick={() => setValue(Math.min(max, value + 1))}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xl font-bold gradient-text">{value}</div>
    </div>
  );
}

function Header({ icon, title, subtitle, accent }: { icon: React.ReactNode; title: string; subtitle: string; accent: string }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: accent }}>{icon}</div>
        <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-muted-foreground">{subtitle}</p></div>
        <Badge variant="secondary" className="ml-auto hidden md:inline-flex">Virtual Lab</Badge>
      </div>
    </div>
  );
}
