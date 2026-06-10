import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  context?: string;
  seedQuestions?: string[];
  className?: string;
  title?: string;
};

export function AiTutorPanel({ context, seedQuestions, className, title = "AI STEM Tutor" }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: { context },
  });

  const { messages, sendMessage, status, error } = useChat({
    id: "tutor-" + (context?.slice(0, 24) ?? "default"),
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || busy) return;
    setInput("");
    await sendMessage({ text: value });
    inputRef.current?.focus();
  };

  return (
    <div className={cn("glass-strong flex h-full flex-col overflow-hidden rounded-2xl", className)}>
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-muted-foreground">Ask anything about this experiment</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              I'll explain what's happening in plain English, give analogies, and connect it to the real world.
            </p>
            {seedQuestions && (
              <div className="space-y-1.5">
                {seedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => submit(q)}
                    className="glass w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-accent/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m: UIMessage) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "text-foreground",
                )}
              >
                {isUser ? (
                  text
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-strong:text-foreground">
                    <ReactMarkdown>{text || "…"}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
        {error && <div className="text-xs text-destructive">Tutor unavailable. Try again in a moment.</div>}
      </div>

      <form
        className="flex items-end gap-2 border-t border-border/60 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about this experiment…"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
