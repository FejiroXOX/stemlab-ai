import { createFileRoute } from "@tanstack/react-router";
import { Rocket, Target, Timer, TrendingUp, Play, RotateCcw } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { AiTutorPanel } from "@/components/AiTutorPanel";
import { ExplainWhatHappened } from "@/components/ExplainWhatHappened";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/experiments/projectile")({
  head: () => ({ meta: [{ title: "Projectile Motion — STEMLab AI" }] }),
  component: ProjectileLab,
});

function ProjectileLab() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(25);
  const [gravity, setGravity] = useState(9.81);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number>(0);
  const { addRun } = useProgress();

  const physics = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const tof = (2 * vy) / gravity;
    const range = vx * tof;
    const maxH = (vy * vy) / (2 * gravity);
    return { vx, vy, tof, range, maxH };
  }, [angle, velocity, gravity]);

  useEffect(() => {
    if (!playing) return;
    startedAt.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startedAt.current) / 1000;
      if (elapsed >= physics.tof) {
        setT(physics.tof);
        setPlaying(false);
        addRun({
          experiment: "projectile",
          label: `${angle}° @ ${velocity} m/s, g=${gravity}`,
          result: `Range ${physics.range.toFixed(1)}m, Max height ${physics.maxH.toFixed(1)}m, ToF ${physics.tof.toFixed(2)}s`,
        });
        return;
      }
      setT(elapsed);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const launch = () => { setT(0); setPlaying(true); };
  const reset = () => { setT(0); setPlaying(false); };

  // Plot dims
  const W = 760, H = 280, padX = 40, padY = 20;
  const xMax = Math.max(physics.range, 10);
  const yMax = Math.max(physics.maxH, 5);
  const sx = (x: number) => padX + (x / xMax) * (W - padX * 2);
  const sy = (y: number) => H - padY - (y / yMax) * (H - padY * 2);

  // Sample trajectory path
  const path = useMemo(() => {
    const pts: string[] = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const tt = (i / N) * physics.tof;
      const x = physics.vx * tt;
      const y = physics.vy * tt - 0.5 * gravity * tt * tt;
      pts.push(`${sx(x).toFixed(1)},${sy(Math.max(0, y)).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [physics, gravity]);

  // Current ball position
  const cx = sx(physics.vx * t);
  const cy = sy(Math.max(0, physics.vy * t - 0.5 * gravity * t * t));

  return (
    <AppShell>
      <Header icon={<Rocket className="h-5 w-5" />} title="Projectile Motion" subtitle="Adjust the launch and trace the parabola." accent="var(--engineering)" />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Plot */}
          <div className="glass-strong rounded-2xl p-5">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/30">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-72 w-full">
                <defs>
                  <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="oklch(0.5 0.05 140 / 0.3)" />
                    <stop offset="1" stopColor="oklch(0.4 0.05 140 / 0.05)" />
                  </linearGradient>
                </defs>
                <rect x="0" y={H - padY} width={W} height={padY} fill="url(#ground)" />
                {/* axes */}
                <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="oklch(0.5 0 0 / 0.3)" />
                <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="oklch(0.5 0 0 / 0.3)" />
                {/* trajectory */}
                <path d={path} fill="none" stroke="url(#wire-traj)" strokeWidth="2.5" strokeDasharray="4 4" />
                <defs>
                  <linearGradient id="wire-traj" x1="0" x2="1">
                    <stop offset="0" stopColor="oklch(0.72 0.2 280)" />
                    <stop offset="1" stopColor="oklch(0.78 0.18 70)" />
                  </linearGradient>
                </defs>
                {/* peak marker */}
                <line x1={sx(physics.range / 2)} y1={sy(physics.maxH)} x2={sx(physics.range / 2)} y2={H - padY} stroke="oklch(0.72 0.2 280 / 0.4)" strokeDasharray="2 4" />
                {/* ball */}
                <circle cx={cx} cy={cy} r="9" fill="oklch(0.78 0.18 70)" stroke="oklch(0.5 0.1 60)" />
                {/* launch arrow */}
                <g transform={`translate(${padX}, ${H - padY}) rotate(${-angle})`}>
                  <line x1="0" y1="0" x2="40" y2="0" stroke="oklch(0.72 0.2 280)" strokeWidth="3" />
                  <polygon points="40,-5 50,0 40,5" fill="oklch(0.72 0.2 280)" />
                </g>
                {/* labels */}
                <text x={W - padX - 8} y={H - padY - 6} textAnchor="end" fontSize="11" fill="oklch(0.6 0.02 260)">Range: {physics.range.toFixed(1)} m</text>
                <text x={padX + 6} y={padY + 12} fontSize="11" fill="oklch(0.6 0.02 260)">Peak: {physics.maxH.toFixed(1)} m</text>
              </svg>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <SliderRow label="Launch Angle" value={angle} setValue={setAngle} min={5} max={85} step={1} unit="°" />
              <SliderRow label="Initial Velocity" value={velocity} setValue={setVelocity} min={5} max={60} step={1} unit=" m/s" />
              <SliderRow label="Gravity" value={gravity} setValue={(v) => setGravity(v)} min={1.6} max={24.8} step={0.1} unit=" m/s²" />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={launch} className="glow"><Play className="mr-2 h-4 w-4" /> Launch</Button>
              <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
              <div className="ml-auto flex flex-wrap gap-2">
                <Pill icon={<Target className="h-3.5 w-3.5" />} label="Range" value={`${physics.range.toFixed(1)} m`} />
                <Pill icon={<TrendingUp className="h-3.5 w-3.5" />} label="Max H" value={`${physics.maxH.toFixed(1)} m`} />
                <Pill icon={<Timer className="h-3.5 w-3.5" />} label="ToF" value={`${physics.tof.toFixed(2)} s`} />
              </div>
            </div>
          </div>

          <ExplainWhatHappened
            experiment="Projectile Motion"
            setup={`Launch angle ${angle}°, initial velocity ${velocity} m/s, gravity ${gravity} m/s².`}
            result={`Range ${physics.range.toFixed(1)}m, max height ${physics.maxH.toFixed(1)}m, time of flight ${physics.tof.toFixed(2)}s.`}
          />
        </div>

        <div className="h-[640px] lg:sticky lg:top-20">
          <AiTutorPanel
            context={`Projectile lab. Angle ${angle}°, velocity ${velocity} m/s, gravity ${gravity} m/s². Range ${physics.range.toFixed(1)}m, max height ${physics.maxH.toFixed(1)}m.`}
            seedQuestions={[
              "Why does 45° give the maximum range?",
              "What happens to range if I double the velocity?",
              "How would this differ on the Moon?",
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}

function SliderRow({ label, value, setValue, min, max, step, unit }: { label: string; value: number; setValue: (n: number) => void; min: number; max: number; step: number; unit: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono font-bold gradient-text">{value.toFixed(step < 1 ? 1 : 0)}{unit}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}

function Pill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
      {icon}<span className="text-muted-foreground">{label}:</span><span className="font-semibold">{value}</span>
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
