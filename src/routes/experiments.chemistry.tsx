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

type Effect = "fizz" | "color" | "heat" | "precipitate" | "smoke" | "none";

type ReactionKey = string;
const REACTIONS: Record<ReactionKey, {
  label: string;
  products: string;
  observation: string;
  safety: string;
  effect: Effect;
  resultColor: string;
}> = {
  "HCl+NaOH": {
    label: "Neutralization: HCl + NaOH",
    products: "NaCl + H₂O",
    observation: "Solution warms; pH approaches 7. No visible gas.",
    safety: "Both reagents are corrosive — wear gloves and goggles.",
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
  "HCl+BakingSoda": {
    label: "Acid–Carbonate: HCl + Baking Soda",
    products: "NaCl + CO₂ ↑ + H₂O",
    observation: "Rapid fizzing; CO₂ released almost instantly.",
    safety: "HCl is corrosive — handle in a fume hood.",
    effect: "fizz",
    resultColor: "oklch(0.93 0.02 220)",
  },
  "CuSO4+Iron": {
    label: "Single Displacement: CuSO₄ + Fe",
    products: "FeSO₄ + Cu (reddish coating on iron)",
    observation: "Blue solution fades; iron darkens with copper deposit.",
    safety: "Copper sulfate is toxic if ingested. Wash hands.",
    effect: "color",
    resultColor: "oklch(0.55 0.18 40)",
  },
  "HCl+Iron": {
    label: "Acid + Metal: HCl + Fe",
    products: "FeCl₂ + H₂ ↑",
    observation: "Iron dissolves slowly; hydrogen gas bubbles up.",
    safety: "Hydrogen is flammable — keep flames away.",
    effect: "fizz",
    resultColor: "oklch(0.7 0.12 140)",
  },
  "HCl+Water": {
    label: "Dilution: HCl + H₂O",
    products: "Dilute HCl (exothermic mixing)",
    observation: "Solution warms noticeably as acid disperses. No reaction products.",
    safety: "ALWAYS add acid to water — never water to acid (splash hazard).",
    effect: "heat",
    resultColor: "oklch(0.9 0.04 220)",
  },
  "NaOH+Water": {
    label: "Dissolution: NaOH + H₂O",
    products: "Strongly basic solution (exothermic)",
    observation: "Pellets dissolve; solution becomes hot.",
    safety: "Very caustic — wear goggles and gloves.",
    effect: "heat",
    resultColor: "oklch(0.92 0.04 200)",
  },
  "CuSO4+NaOH": {
    label: "Precipitation: CuSO₄ + 2 NaOH",
    products: "Cu(OH)₂ ↓ (blue precipitate) + Na₂SO₄",
    observation: "A gelatinous blue precipitate of copper hydroxide forms instantly.",
    safety: "Avoid skin contact; copper salts are toxic.",
    effect: "precipitate",
    resultColor: "oklch(0.55 0.18 235)",
  },
  "Vinegar+Iron": {
    label: "Slow Oxidation: Vinegar + Fe",
    products: "Iron acetate + trace H₂",
    observation: "Iron slowly tarnishes over minutes; very mild bubbling.",
    safety: "Safe in small amounts — but avoid inhaling vapors.",
    effect: "color",
    resultColor: "oklch(0.6 0.08 50)",
  },
};

function key(a: Reagent, b: Reagent): ReactionKey {
  const sorted = [a, b].sort();
  const m: Record<string, ReactionKey> = {
    "HCl|NaOH": "HCl+NaOH",
    "BakingSoda|Vinegar": "Vinegar+BakingSoda",
    "BakingSoda|HCl": "HCl+BakingSoda",
    "CuSO4|Iron": "CuSO4+Iron",
    "HCl|Iron": "HCl+Iron",
    "HCl|Water": "HCl+Water",
    "NaOH|Water": "NaOH+Water",
    "CuSO4|NaOH": "CuSO4+NaOH",
    "Iron|Vinegar": "Vinegar+Iron",
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
            <div className="relative mt-6 h-72 overflow-hidden rounded-2xl border border-border/60" style={{ background: "linear-gradient(180deg, oklch(0.25 0.03 250 / 0.4), oklch(0.15 0.02 250 / 0.6))" }}>
              {/* lab bench */}
              <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: "linear-gradient(180deg, oklch(0.3 0.02 60 / 0.6), oklch(0.2 0.02 60 / 0.9))" }} />
              <div className="absolute inset-0 grid grid-cols-3 items-end gap-4 px-6 pb-10">
                <Flask color={reagentA.color} label={a} />
                <div className="grid h-full place-items-center">
                  {mixed && (
                    <div className="text-center">
                      <FlaskConical className="mx-auto h-10 w-10 animate-float text-primary" />
                      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Reacting…</div>
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
              No notable reaction with this pair. Try <b>Vinegar + Baking Soda</b>, <b>HCl + NaOH</b>, <b>CuSO₄ + NaOH</b>, <b>HCl + Iron</b>, or <b>HCl + Water</b>.
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

function Flask({ color, label, effect, resultColor }: { color: string; label: string; effect?: Effect; resultColor?: string }) {
  const liquid =
    effect === "color" || effect === "precipitate" ? (resultColor ?? color) : color;
  return (
    <div className="relative grid h-full place-items-end">
      <div className="relative h-52 w-32">
        {/* Smoke / vapor */}
        {effect === "smoke" && (
          <div className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex justify-center">
            <div className="h-10 w-16 rounded-full bg-white/20 blur-xl animate-pulse" />
          </div>
        )}
        {/* Rising bubbles for fizz */}
        {effect === "fizz" && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/80 shadow"
                style={{
                  width: 6 + (i % 4) * 3,
                  height: 6 + (i % 4) * 3,
                  left: `${15 + (i * 9) % 70}%`,
                  bottom: 8,
                  animation: `bubble ${1.1 + (i % 4) * 0.25}s ${i * 0.13}s ease-in infinite`,
                }}
              />
            ))}
          </div>
        )}
        {/* Heat shimmer */}
        {effect === "heat" && (
          <div className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <div className="h-6 w-10 rounded-full bg-orange-400/40 blur-md animate-pulse" />
          </div>
        )}
        {/* Flask neck */}
        <div className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 rounded-t-md border border-white/30 bg-white/5 backdrop-blur-sm" />
        {/* Flask shoulders + body using SVG for an Erlenmeyer shape */}
        <svg viewBox="0 0 100 140" className="absolute inset-x-0 top-7 h-44 w-full drop-shadow-lg">
          <defs>
            <linearGradient id={`glass-${label}`} x1="0" x2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="0.5" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.18)" />
            </linearGradient>
            <clipPath id={`clip-${label}`}>
              <path d="M35,0 L65,0 L95,120 Q95,135 80,135 L20,135 Q5,135 5,120 Z" />
            </clipPath>
          </defs>
          {/* Liquid fill */}
          <g clipPath={`url(#clip-${label})`}>
            <rect x="0" y="55" width="100" height="85" fill={liquid} />
            {/* Precipitate layer at bottom */}
            {effect === "precipitate" && (
              <>
                <rect x="0" y="110" width="100" height="30" fill={resultColor ?? liquid} opacity="0.95" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={10 + (i * 7) % 80}
                    cy={70 + (i * 11) % 40}
                    r={2 + (i % 3)}
                    fill={resultColor ?? "#fff"}
                    opacity="0.7"
                  >
                    <animate attributeName="cy" from="60" to="115" dur={`${1.2 + (i % 4) * 0.3}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </>
            )}
            {/* Color-change swirl */}
            {effect === "color" && (
              <rect x="0" y="55" width="100" height="85" fill={resultColor ?? liquid} opacity="0.9">
                <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze" />
              </rect>
            )}
            {/* Heat glow */}
            {effect === "heat" && (
              <rect x="0" y="55" width="100" height="85" fill="url(#heat-glow)" />
            )}
            <radialGradient id="heat-glow" cx="0.5" cy="1">
              <stop offset="0" stopColor="oklch(0.85 0.2 30 / 0.55)" />
              <stop offset="1" stopColor="transparent" />
            </radialGradient>
          </g>
          {/* Glass outline */}
          <path d="M35,0 L65,0 L95,120 Q95,135 80,135 L20,135 Q5,135 5,120 Z" fill={`url(#glass-${label})`} stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          {/* Measurement marks */}
          {[40, 65, 90, 115].map((y) => (
            <line key={y} x1="12" y1={y} x2="22" y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          ))}
        </svg>
      </div>
      <div className="mt-2 max-w-[120px] truncate text-center text-[11px] font-medium text-muted-foreground">{label}</div>
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
