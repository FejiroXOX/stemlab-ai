import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AiTutorPanel } from "@/components/AiTutorPanel";
import { BrainCircuit } from "lucide-react";

export const Route = createFileRoute("/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — STEMLab AI" }] }),
  component: TutorPage,
});

function TutorPage() {
  return (
    <AppShell>
      <div className="glass-strong relative mb-4 overflow-hidden rounded-2xl p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-hero)" }}>
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI STEM Tutor</h1>
            <p className="text-sm text-muted-foreground">Ask anything across Science, Tech, Engineering, or Math.</p>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-12rem)]">
        <AiTutorPanel
          title="STEM Tutor"
          seedQuestions={[
            "Explain photosynthesis like I'm 12.",
            "What's the difference between AC and DC current?",
            "Why is the sky blue?",
            "How do rockets actually work?",
          ]}
        />
      </div>
    </AppShell>
  );
}
