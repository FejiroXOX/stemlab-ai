import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AiTutorPanel } from "@/components/AiTutorPanel";
import { ExplainWhatHappened } from "@/components/ExplainWhatHappened";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker, FlaskConical, ShieldAlert, Sparkles } from "lucide-react";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/experiments/chemistry")({
  head: () => ({ meta: [{ title: "Chemical Reactions — STEMLab AI" }] }),
  component: ChemistryLab,
});

type Reagent = "HCl" | "NaOH" | "Vinegar" | "BakingSoda" | "CuSO4" | "Iron" | "Water";

const REAGENTS: { id: Reagent; name: string; color: string }[] = [
  { id: "HCl", name: "Hydrochloric Acid (HCl)", color: "oklch(0.85 0.1 90)" },
  { id: "NaOH", name: "Sodium Hydroxide (NaOH)", color: "oklch(0.9 0.06 200)" },
  { id: "Vinegar", name: "Vinegar (CH₃COOH)", color: "oklch(0.85 0.08 70)" },
  { id: "BakingSoda", name: "Baking Soda (NaHCO₃)", color: "oklch(0.95 0.02 100)" },
  { id: "CuSO4", name: "Copper Sulfate (CuSO₄)", color: "oklch(0.65 0.2 230)" },
  { id: "Iron", name: "Iron Filings (Fe)", color: "oklch(0.55 0.05 60)" },
  { id: "Water", name: "Water (H₂O)", color: "oklch(0.92 0.03 220)" },
];

type ReactionKey = string;
const REACTIONS: Record<ReactionKey, {
  label: string;
  products: string;
  observation: string;
  safety: string;
  effect: "fizz" | "color" | "heat" | "none";
  resultColor: string;
}> = {
  "HCl+NaOH": {
    label: "Neutralization: HCl + NaOH",
    products: "NaCl + H₂O",
    observation: "Solution warms; pH approaches 7. No visible gas.",
    safety: "Both reagents corrosive — wear gloves and goggles.",
    effect: "heat",
    resultColor: "oklch(0.92 0.03 220)",
  },
  "Vinegar+BakingSoda": {
    label: "Acid–Carbonate: Vinegar + Baking Soda",
    products: "Sodium acetate + CO₂ ↑ + H₂O",
    observation: "Vigorous bubbling as CO₂ gas escapes.",
    safety: "Mild — but never seal the container, gas pressure builds.",
    effect: "fizz",
    resultColor: "oklch(0.95 0.02 100)",
  },
  "CuSO4+Iron": {
    label: "Single Displacement: CuSO₄ + Fe",
    products: "FeSO₄ + Cu (reddish coating on iron)",
    observation: "Blue solution fades; iron darkens with copper deposit.",
    safety: "Copper sulfate is toxic if ingested. Wash hands.",
    effect: "color",
    resultColor: "oklch(0.55 0.18 40)",
  },
};

function key(a: Reagent, b: Reagent): ReactionKey {
  const sorted = [a, b].sort();
  // map known pairs
  const m: Record<string, ReactionKey> = {
    "HCl|NaOH": "HCl+NaOH",
    "BakingSoda|Vinegar": "Vinegar+BakingSoda",
    "CuSO4|Iron": "CuSO4+Iron",
  };
  return m[sorted.join("|")] ?? "";
}

function ChemistryLab() {
  const [a, setA] = useState<Reagent>("Vinegar");
  const [b, setB] = useState<Reagent>("BakingSoda");
  const [mixed, setMixed] = useState<ReactionKey | null>(null);
  const { addRun } = useProgress();

  const reaction = useMemo(() => (mixed ? REACTIONS[mixed] : null), [mixed]);

  const mix = () => {
    const k = key(a, b);
    setMixed(k);
    if (k && REACTIONS[k]) {
      addRun({ experiment: "chemistry", label: REACTIONS[k].label, result: REACTIONS[k].observation });
    } else {
      addRun({ experiment: "chemistry", label: `${a} + ${b}`, result: "No notable reaction observed." });
    }
  };

  const reagentA = REAGENTS.find((r) => r.id === a)!;
  const reagentB = REAGENTS.find((r) => r.id === b)!;

  return (
    <AppShell>
      <Header
        icon={<Beaker className="h-5 w-5" />}
        title="Chemical Reactions"
        subtitle="Combine reagents and observe what nature does."
        accent="var(--science)"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Bench */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <ReagentPicker label="Beaker A" value={a} onChange={setA} />
              <ReagentPicker label="Beaker B" value={b} onChange={setB} />
            </div>

            {/* Visualization */}
            <div className="relative mt-6 h-64 overflow-hidden rounded-2xl border border-border/60 bg-background/30">
              <div className="absolute inset-0 grid grid-cols-3 items-end gap-6 px-8 pb-6">
                <Flask color={reagentA.color} label={a} />
                <div className="grid h-full place-items-center">
                  {mixed && (
                    <div className="text-center">
                      <FlaskConical className="mx-auto h-10 w-10 animate-float text-primary" />
                      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Mixing…</div>
                    </div>
                  )}
                </div>
                <Flask color={reagentB.color} label={b} effect={reaction?.effect} resultColor={reaction?.resultColor} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={mix} size="lg" className="glow">
                <Sparkles className="mr-2 h-4 w-4" /> Mix Reagents
              </Button>
              {mixed && (
                <Button variant="outline" onClick={() => setMixed(null)} size="lg">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          {reaction ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title="Products" tone="primary">{reaction.products}</InfoCard>
              <InfoCard title="Observation">{reaction.observation}</InfoCard>
              <InfoCard title="Safety Notes" tone="warn" icon={<ShieldAlert className="h-4 w-4" />}>
                {reaction.safety}
              </InfoCard>
              <InfoCard title="Reaction">{reaction.label}</InfoCard>
            </div>
          ) : mixed !== null ? (
            <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
              No notable reaction — try a known combination like <b>Vinegar + Baking Soda</b>, <b>HCl + NaOH</b>, or <b>CuSO₄ + Iron</b>.
            </div>
          ) : null}

          {mixed && reaction && (
            <ExplainWhatHappened
              experiment="Chemical Reaction"
              setup={`${a} mixed with ${b}`}
              result={`Products: ${reaction.products}. Observation: ${reaction.observation}.`}
            />
          )}
        </div>

        <div className="h-[640px] lg:sticky lg:top-20">
          <AiTutorPanel
            context={`Chemistry lab. User mixed ${a} with ${b}.${reaction ? ` Reaction: ${reaction.label}. Products: ${reaction.products}.` : ""}`}
            seedQuestions={[
              "What is a neutralization reaction?",
              "Why does baking soda fizz with vinegar?",
              "Where do these reactions show up in everyday life?",
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}

function ReagentPicker({ label, value, onChange }: { label: string; value: Reagent; onChange: (r: Reagent) => void }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={(v) => onChange(v as Reagent)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {REAGENTS.map((r) => (
            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Flask({ color, label, effect, resultColor }: { color: string; label: string; effect?: "fizz" | "color" | "heat" | "none"; resultColor?: string }) {
  const liquid = effect === "color" && resultColor ? resultColor : color;
  return (
    <div className="relative grid h-full place-items-end">
      <div className="relative h-44 w-28">
        {/* Bubbles */}
        {effect === "fizz" && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-10 grid grid-cols-3 place-items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/70"
                style={{
                  width: 8 + (i % 3) * 3,
                  height: 8 + (i % 3) * 3,
                  left: 8 + i * 14,
                  animation: `bubble ${1.2 + (i % 3) * 0.3}s ${i * 0.18}s ease-in infinite`,
                }}
              />
            ))}
          </div>
        )}
        {/* Flask shape */}
        <div className="absolute inset-x-9 top-0 h-6 rounded-t-md border border-border bg-background/40" />
        <div className="absolute inset-x-3 top-6 bottom-0 overflow-hidden rounded-b-3xl rounded-t-md border border-border bg-background/30">
          <div
            className="absolute inset-x-0 bottom-0 transition-all"
            style={{
              height: "60%",
              background: liquid,
              boxShadow: effect === "heat" ? "inset 0 0 30px oklch(0.7 0.2 30 / 0.4)" : undefined,
            }}
          />
          {effect === "heat" && (
            <div className="absolute inset-0 animate-pulse" style={{ background: "radial-gradient(circle at 50% 90%, oklch(0.8 0.2 30 / 0.3), transparent 60%)" }} />
          )}
        </div>
      </div>
      <div className="mt-2 max-w-[110px] truncate text-center text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoCard({ title, children, tone, icon }: { title: string; children: React.ReactNode; tone?: "primary" | "warn"; icon?: React.ReactNode }) {
  const ring = tone === "primary" ? "border-primary/40" : tone === "warn" ? "border-[color:var(--engineering)]/40" : "";
  return (
    <div className={`glass rounded-xl border p-4 ${ring}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        {icon}{title}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Header({ icon, title, subtitle, accent }: { icon: React.ReactNode; title: string; subtitle: string; accent: string }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: accent }}>{icon}</div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary" className="ml-auto hidden md:inline-flex">Virtual Lab</Badge>
      </div>
    </div>
  );
}
