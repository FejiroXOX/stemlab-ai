import { useEffect, useState, useSyncExternalStore } from "react";

export type ExperimentRun = {
  id: string;
  experiment: "chemistry" | "circuit" | "projectile";
  label: string;
  result: string;
  at: number;
};

export type QuizScore = { topic: string; score: number; total: number; at: number };

export type Progress = {
  runs: ExperimentRun[];
  quizzes: QuizScore[];
  concepts: string[];
  streak: number;
  lastActive: string; // YYYY-MM-DD
  stemScore: number;
};

const KEY = "stemlab-progress-v1";

const SEED: Progress = {
  runs: [
    { id: "s1", experiment: "chemistry", label: "Vinegar + Baking Soda", result: "Vigorous fizz, CO₂ released", at: Date.now() - 86400000 * 2 },
    { id: "s2", experiment: "circuit", label: "Battery + Bulb + Switch", result: "Bulb lit at 75% brightness", at: Date.now() - 86400000 },
    { id: "s3", experiment: "projectile", label: "45° launch @ 25m/s", result: "Range 63.7m, Height 15.9m", at: Date.now() - 3600000 * 5 },
  ],
  quizzes: [
    { topic: "Acid–Base Reactions", score: 4, total: 5, at: Date.now() - 86400000 },
    { topic: "Ohm's Law", score: 5, total: 5, at: Date.now() - 3600000 * 10 },
  ],
  concepts: ["Neutralization", "Ohm's Law", "Projectile Motion", "Conservation of Energy", "Electrolytes"],
  streak: 4,
  lastActive: new Date().toISOString().slice(0, 10),
  stemScore: 720,
};

function read(): Progress {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Progress;
  } catch {
    return SEED;
  }
}

const listeners = new Set<() => void>();
let cache: Progress | null = null;
function getSnapshot(): Progress {
  if (cache === null) cache = read();
  return cache;
}
function emit() {
  cache = read();
  listeners.forEach((l) => l());
}

function write(updater: (p: Progress) => Progress) {
  const next = updater(read());
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useProgress() {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  const data = useSyncExternalStore(subscribe, getSnapshot, () => SEED);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    cache = read();
    setMounted(true);
    emit();
  }, []);

  return {
    progress: mounted ? data : SEED,
    addRun: (run: Omit<ExperimentRun, "id" | "at">) =>
      write((p) => ({
        ...p,
        stemScore: p.stemScore + 25,
        runs: [{ ...run, id: crypto.randomUUID(), at: Date.now() }, ...p.runs].slice(0, 30),
      })),
    addQuiz: (q: Omit<QuizScore, "at">) =>
      write((p) => ({
        ...p,
        stemScore: p.stemScore + q.score * 15,
        quizzes: [{ ...q, at: Date.now() }, ...p.quizzes].slice(0, 20),
      })),
    addConcepts: (cs: string[]) =>
      write((p) => ({ ...p, concepts: Array.from(new Set([...p.concepts, ...cs])).slice(0, 40) })),
    reset: () => write(() => SEED),
  };
}
