import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, GraduationCap, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateQuiz } from "@/lib/ai.functions";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz Generator — STEMLab AI" }] }),
  component: QuizPage,
});

type Quiz = Awaited<ReturnType<typeof generateQuiz>>;

const TOPICS = ["Acid–Base Reactions", "Ohm's Law", "Projectile Motion", "Photosynthesis", "Newton's Laws"];

function QuizPage() {
  const gen = useServerFn(generateQuiz);
  const { addQuiz } = useProgress();
  const [topic, setTopic] = useState("Projectile Motion");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    setLoading(true); setErr(null); setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const q = await gen({ data: { topic, count: 5 } });
      setQuiz(q);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Quiz generation failed");
    } finally { setLoading(false); }
  };

  const submit = () => {
    if (!quiz) return;
    setSubmitted(true);
    const score = quiz.questions.reduce((acc, q, i) => {
      const a = (answers[i] || "").trim().toLowerCase();
      const ok = a === q.answer.trim().toLowerCase();
      return acc + (ok ? 1 : 0);
    }, 0);
    addQuiz({ topic: quiz.title, score, total: quiz.questions.length });
  };

  const reset = () => { setQuiz(null); setAnswers({}); setSubmitted(false); };

  const score = quiz ? quiz.questions.reduce((acc, q, i) => acc + ((answers[i] || "").trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0), 0) : 0;

  return (
    <AppShell>
      <div className="glass-strong relative mb-4 overflow-hidden rounded-2xl p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-hero)" }}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
            <p className="text-sm text-muted-foreground">Practice quizzes generated from your experiments.</p>
          </div>
        </div>
      </div>

      {!quiz && (
        <div className="glass-strong rounded-2xl p-5">
          <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Choose a topic</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={cn("rounded-full border px-3 py-1.5 text-xs transition",
                  topic === t ? "border-primary bg-primary/15" : "border-border hover:bg-accent/40")}
              >{t}</button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Or type any STEM topic…" />
            <Button onClick={start} disabled={loading || !topic.trim()} size="lg" className="glow">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Quiz
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        </div>
      )}

      {quiz && (
        <div className="space-y-4">
          <div className="glass-strong flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Quiz</div>
              <h2 className="text-xl font-bold">{quiz.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {submitted && (
                <Badge className="bg-primary/15 text-foreground text-sm">
                  Score: {score} / {quiz.questions.length}
                </Badge>
              )}
              <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" /> New Quiz</Button>
            </div>
          </div>

          {quiz.questions.map((q, i) => {
            const user = (answers[i] || "").trim();
            const correct = user.toLowerCase() === q.answer.trim().toLowerCase();
            return (
              <div key={i} className="glass-strong rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Q{i + 1}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase">{q.type === "mcq" ? "Multiple choice" : q.type === "tf" ? "True / False" : "Short answer"}</Badge>
                </div>
                <p className="mb-3 font-medium">{q.question}</p>

                {q.type === "mcq" && q.options && (
                  <div className="grid gap-2 md:grid-cols-2">
                    {q.options.map((opt) => {
                      const selected = user === opt;
                      const isAnswer = submitted && opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                      return (
                        <button
                          key={opt}
                          disabled={submitted}
                          onClick={() => setAnswers({ ...answers, [i]: opt })}
                          className={cn("glass rounded-xl border-2 border-transparent px-3 py-2 text-left text-sm transition",
                            selected && !submitted && "border-primary bg-primary/25 ring-2 ring-primary/40 font-semibold shadow-md",
                            submitted && isAnswer && "border-[color:var(--science)] bg-[color:var(--science)]/15",
                            submitted && selected && !isAnswer && "border-destructive bg-destructive/15")}
                        >
                          <span className="mr-2 inline-block w-4">{selected ? "●" : "○"}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "tf" && (
                  <div className="flex gap-2">
                    {["True", "False"].map((opt) => {
                      const selected = user === opt;
                      const isAnswer = submitted && opt.toLowerCase() === q.answer.trim().toLowerCase();
                      return (
                        <button
                          key={opt}
                          disabled={submitted}
                          onClick={() => setAnswers({ ...answers, [i]: opt })}
                          className={cn("glass flex-1 rounded-xl border-2 border-transparent px-3 py-2 text-sm",
                            selected && !submitted && "border-primary bg-primary/25 ring-2 ring-primary/40 font-semibold shadow-md",
                            submitted && isAnswer && "border-[color:var(--science)] bg-[color:var(--science)]/15",
                            submitted && selected && !isAnswer && "border-destructive bg-destructive/15")}
                        >{opt}</button>
                      );
                    })}
                  </div>
                )}

                {q.type === "short" && (
                  <Input
                    value={user}
                    disabled={submitted}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    placeholder="Your answer…"
                  />
                )}

                {submitted && (
                  <div className={cn("mt-3 rounded-xl p-3 text-sm", correct ? "bg-[color:var(--science)]/15" : "bg-destructive/10")}>
                    <div className="flex items-center gap-2 font-semibold">
                      {correct ? <Check className="h-4 w-4 text-[color:var(--science)]" /> : <X className="h-4 w-4 text-destructive" />}
                      {correct ? "Correct!" : <>Correct answer: <span className="font-mono">{q.answer}</span></>}
                    </div>
                    <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <Button size="lg" className="w-full glow" onClick={submit}>
              Submit Quiz {Object.keys(answers).length < quiz.questions.length && `(${quiz.questions.length - Object.keys(answers).length} unanswered)`}
            </Button>
          )}
        </div>
      )}
    </AppShell>
  );
}
