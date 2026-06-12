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

type Reagent =
  | "HCl" | "NaOH" | "Vinegar" | "BakingSoda" | "CuSO4" | "Iron" | "Water"
  | "AgNO3" | "NaCl" | "KI" | "Zn" | "Mg" | "H2O2" | "KMnO4" | "Sugar" | "Phenolphthalein";

const REAGENTS: { id: Reagent; name: string; color: string }[] = [
  { id: "HCl", name: "Hydrochloric Acid (HCl)", color: "oklch(0.85 0.1 90)" },
  { id: "NaOH", name: "Sodium Hydroxide (NaOH)", color: "oklch(0.9 0.06 200)" },
  { id: "Vinegar", name: "Vinegar (CH₃COOH)", color: "oklch(0.85 0.08 70)" },
  { id: "BakingSoda", name: "Baking Soda (NaHCO₃)", color: "oklch(0.95 0.02 100)" },
  { id: "CuSO4", name: "Copper Sulfate (CuSO₄)", color: "oklch(0.65 0.2 230)" },
  { id: "Iron", name: "Iron Filings (Fe)", color: "oklch(0.55 0.05 60)" },
  { id: "Water", name: "Water (H₂O)", color: "oklch(0.92 0.03 220)" },
  { id: "AgNO3", name: "Silver Nitrate (AgNO₃)", color: "oklch(0.95 0.02 250)" },
  { id: "NaCl", name: "Salt (NaCl)", color: "oklch(0.97 0.01 220)" },
  { id: "KI", name: "Potassium Iodide (KI)", color: "oklch(0.93 0.03 90)" },
  { id: "Zn", name: "Zinc (Zn)", color: "oklch(0.7 0.02 250)" },
  { id: "Mg", name: "Magnesium (Mg)", color: "oklch(0.85 0.02 250)" },
  { id: "H2O2", name: "Hydrogen Peroxide (H₂O₂)", color: "oklch(0.94 0.02 220)" },
  { id: "KMnO4", name: "Potassium Permanganate (KMnO₄)", color: "oklch(0.45 0.2 320)" },
  { id: "Sugar", name: "Sugar (C₁₂H₂₂O₁₁)", color: "oklch(0.97 0.01 90)" },
  { id: "Phenolphthalein", name: "Phenolphthalein (indicator)", color: "oklch(0.97 0.01 320)" },
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
  "HCl+NaOH": { label: "Neutralization: HCl + NaOH", products: "NaCl + H₂O", observation: "Solution warms; pH approaches 7. No visible gas.", safety: "Both reagents are corrosive — wear gloves and goggles.", effect: "heat", resultColor: "oklch(0.92 0.03 220)" },
  "Vinegar+BakingSoda": { label: "Acid–Carbonate: Vinegar + Baking Soda", products: "Sodium acetate + CO₂ ↑ + H₂O", observation: "Vigorous bubbling as CO₂ gas escapes.", safety: "Mild — but never seal the container, gas pressure builds.", effect: "fizz", resultColor: "oklch(0.95 0.02 100)" },
  "HCl+BakingSoda": { label: "Acid–Carbonate: HCl + Baking Soda", products: "NaCl + CO₂ ↑ + H₂O", observation: "Rapid fizzing; CO₂ released almost instantly.", safety: "HCl is corrosive — handle in a fume hood.", effect: "fizz", resultColor: "oklch(0.93 0.02 220)" },
  "CuSO4+Iron": { label: "Single Displacement: CuSO₄ + Fe", products: "FeSO₄ + Cu (reddish coating on iron)", observation: "Blue solution fades; iron darkens with copper deposit.", safety: "Copper sulfate is toxic if ingested. Wash hands.", effect: "color", resultColor: "oklch(0.55 0.18 40)" },
  "HCl+Iron": { label: "Acid + Metal: HCl + Fe", products: "FeCl₂ + H₂ ↑", observation: "Iron dissolves slowly; hydrogen gas bubbles up.", safety: "Hydrogen is flammable — keep flames away.", effect: "fizz", resultColor: "oklch(0.7 0.12 140)" },
  "HCl+Water": { label: "Dilution: HCl + H₂O", products: "Dilute HCl (exothermic mixing)", observation: "Solution warms noticeably as acid disperses.", safety: "ALWAYS add acid to water — never water to acid.", effect: "heat", resultColor: "oklch(0.9 0.04 220)" },
  "NaOH+Water": { label: "Dissolution: NaOH + H₂O", products: "Strongly basic solution (exothermic)", observation: "Pellets dissolve; solution becomes hot.", safety: "Very caustic — wear goggles and gloves.", effect: "heat", resultColor: "oklch(0.92 0.04 200)" },
  "CuSO4+NaOH": { label: "Precipitation: CuSO₄ + 2 NaOH", products: "Cu(OH)₂ ↓ + Na₂SO₄", observation: "A gelatinous blue precipitate of copper hydroxide forms instantly.", safety: "Avoid skin contact; copper salts are toxic.", effect: "precipitate", resultColor: "oklch(0.55 0.18 235)" },
  "Vinegar+Iron": { label: "Slow Oxidation: Vinegar + Fe", products: "Iron acetate + trace H₂", observation: "Iron slowly tarnishes; very mild bubbling.", safety: "Safe in small amounts.", effect: "color", resultColor: "oklch(0.6 0.08 50)" },
  "AgNO3+NaCl": { label: "Precipitation: AgNO₃ + NaCl", products: "AgCl ↓ + NaNO₃", observation: "A milky white precipitate of silver chloride forms instantly.", safety: "Silver nitrate stains skin black — wear gloves.", effect: "precipitate", resultColor: "oklch(0.95 0.005 220)" },
  "AgNO3+KI": { label: "Precipitation: AgNO₃ + KI", products: "AgI ↓ + KNO₃", observation: "A bright yellow precipitate of silver iodide drops out of solution.", safety: "Silver nitrate is corrosive and stains.", effect: "precipitate", resultColor: "oklch(0.88 0.16 95)" },
  "HCl+Zn": { label: "Acid + Metal: HCl + Zn", products: "ZnCl₂ + H₂ ↑", observation: "Vigorous fizzing as hydrogen gas evolves; zinc dissolves.", safety: "Hydrogen is flammable; HCl is corrosive.", effect: "fizz", resultColor: "oklch(0.9 0.03 220)" },
  "HCl+Mg": { label: "Acid + Metal: HCl + Mg", products: "MgCl₂ + H₂ ↑", observation: "Very vigorous bubbling; reaction is highly exothermic.", safety: "Strongly exothermic — small amounts only.", effect: "fizz", resultColor: "oklch(0.92 0.03 220)" },
  "Vinegar+Zn": { label: "Weak Acid + Metal: Vinegar + Zn", products: "Zinc acetate + H₂ ↑", observation: "Slow steady bubbling as zinc reacts with acetic acid.", safety: "Mild; ventilate the area.", effect: "fizz", resultColor: "oklch(0.9 0.03 220)" },
  "H2O2+KI": { label: "Catalytic Decomposition: H₂O₂ + KI", products: "2 H₂O + O₂ ↑ (KI catalyst)", observation: "Rapid foaming as oxygen gas is released — the 'elephant toothpaste' demo.", safety: "Use dilute peroxide.", effect: "fizz", resultColor: "oklch(0.95 0.02 90)" },
  "H2O2+KMnO4": { label: "Redox: H₂O₂ + KMnO₄", products: "Mn²⁺ + O₂ ↑ + H₂O", observation: "Purple color fades as oxygen bubbles vigorously.", safety: "KMnO₄ stains; reaction is exothermic.", effect: "fizz", resultColor: "oklch(0.9 0.03 220)" },
  "KMnO4+Water": { label: "Dissolution: KMnO₄ + H₂O", products: "Intense purple solution", observation: "Crystals dissolve to give a deep purple solution.", safety: "KMnO₄ is a strong oxidizer and stains skin.", effect: "color", resultColor: "oklch(0.4 0.2 320)" },
  "NaCl+Water": { label: "Dissolution: NaCl + H₂O", products: "Saline solution", observation: "Salt dissolves; solution stays clear.", safety: "Completely safe.", effect: "color", resultColor: "oklch(0.95 0.01 220)" },
  "Sugar+Water": { label: "Dissolution: Sugar + H₂O", products: "Sugar syrup", observation: "Sugar dissolves to give a clear sweet solution.", safety: "Safe.", effect: "color", resultColor: "oklch(0.96 0.015 90)" },
  "NaOH+Phenolphthalein": { label: "Indicator: NaOH + Phenolphthalein", products: "Bright pink complex", observation: "Solution turns bright pink — indicates a basic pH.", safety: "NaOH is caustic.", effect: "color", resultColor: "oklch(0.78 0.15 350)" },
  "HCl+Phenolphthalein": { label: "Indicator: HCl + Phenolphthalein", products: "Colorless (acidic)", observation: "Indicator stays colorless — confirms an acidic pH.", safety: "HCl is corrosive.", effect: "color", resultColor: "oklch(0.95 0.01 220)" },
  "Vinegar+Phenolphthalein": { label: "Indicator: Vinegar + Phenolphthalein", products: "Colorless (weak acid)", observation: "Stays colorless — vinegar is acidic.", safety: "Safe.", effect: "color", resultColor: "oklch(0.95 0.01 220)" },
  "BakingSoda+Phenolphthalein": { label: "Indicator: NaHCO₃ + Phenolphthalein", products: "Faint pink (weakly basic)", observation: "Solution turns faintly pink — baking soda is mildly basic.", safety: "Safe.", effect: "color", resultColor: "oklch(0.9 0.06 350)" },
  "CuSO4+Water": { label: "Dissolution: CuSO₄ + H₂O", products: "Blue copper sulfate solution", observation: "Crystals dissolve to give a clear blue solution.", safety: "Toxic if ingested.", effect: "color", resultColor: "oklch(0.65 0.2 230)" },
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
    "AgNO3|NaCl": "AgNO3+NaCl",
    "AgNO3|KI": "AgNO3+KI",
    "HCl|Zn": "HCl+Zn",
    "HCl|Mg": "HCl+Mg",
    "Vinegar|Zn": "Vinegar+Zn",
    "H2O2|KI": "H2O2+KI",
    "H2O2|KMnO4": "H2O2+KMnO4",
    "KMnO4|Water": "KMnO4+Water",
    "NaCl|Water": "NaCl+Water",
    "Sugar|Water": "Sugar+Water",
    "NaOH|Phenolphthalein": "NaOH+Phenolphthalein",
    "HCl|Phenolphthalein": "HCl+Phenolphthalein",
    "Phenolphthalein|Vinegar": "Vinegar+Phenolphthalein",
    "BakingSoda|Phenolphthalein": "BakingSoda+Phenolphthalein",
    "CuSO4|Water": "CuSO4+Water",
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
              No pre-modeled reaction for <b>{a} + {b}</b>. Tap <b>Explain with AI</b> below for a real chemistry prediction, or try classics like <b>Vinegar + Baking Soda</b> or <b>CuSO₄ + NaOH</b>.
            </div>
          ) : null}


          {mixed && (
            <ExplainWhatHappened
              key={`${a}-${b}-${mixed}`}
              experiment="Chemical Reaction"
              setup={`A student mixed ${reagentA.name} with ${reagentB.name} in a beaker at room temperature.`}
              result={reaction
                ? `Products: ${reaction.products}. Observation: ${reaction.observation}.`
                : `Predict whether a chemical reaction occurs between ${reagentA.name} and ${reagentB.name}. If yes, give the balanced products, expected observation, and safety notes. If not, explain why no notable reaction occurs.`}
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
