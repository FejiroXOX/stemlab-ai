import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function extractJson(text: string): unknown {
  // Strip code fences
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Find first { ... last }
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("AI returned non-JSON response");
  }
}

const ExplainInput = z.object({
  experiment: z.string(),
  setup: z.string(),
  result: z.string(),
});

const ExplainOutput = z.object({
  headline: z.string(),
  whatHappened: z.string(),
  whyItHappened: z.string(),
  keyConcepts: z.array(z.string()),
  realWorld: z.string(),
  funFact: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const explainExperiment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ExplainInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt: `You are STEMLab AI, explaining an experiment to a curious student.

Experiment: ${data.experiment}
Setup: ${data.setup}
Result: ${data.result}

Formatting rules for ALL string fields:
- Write chemical formulas with Unicode subscripts/superscripts (H₂O, CO₂, H₃O⁺, SO₄²⁻, Fe³⁺), not "H2O" or "H_2O".
- Write math with Unicode (×, ÷, ±, ², ³, ½, π, θ, °, →), not LaTeX.
- Do NOT use "$", "\\(", "\\)", "\\[", "\\]", "^", "_", or any LaTeX/markdown delimiters.
- Plain prose only — no markdown, no code fences.

Respond with ONLY a valid JSON object matching this exact shape:
{
  "headline": "vivid one-line headline",
  "whatHappened": "1-2 sentences describing observable result",
  "whyItHappened": "2-3 sentences with the scientific reason",
  "keyConcepts": ["concept1", "concept2", "concept3"],
  "realWorld": "1-2 sentences on a real-world application",
  "funFact": "one surprising fact",
  "difficulty": "Beginner" | "Intermediate" | "Advanced"
}`,
    });

    return ExplainOutput.parse(extractJson(text));
  });

const QuizInput = z.object({
  topic: z.string().min(1),
  count: z.number().int().min(3).max(8).default(5),
});

const QuizOutput = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      type: z.enum(["mcq", "tf", "short"]),
      question: z.string(),
      options: z.array(z.string()).optional(),
      answer: z.string(),
      explanation: z.string(),
    }),
  ),
});

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuizInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt: `You are a STEM quiz generator. The user requested a quiz on: "${data.topic}".

FIRST: Decide whether "${data.topic}" is a real, recognizable STEM topic (Science, Technology, Engineering, or Math — including subfields like biology, chemistry, physics, computer science, electronics, algebra, calculus, etc.). Random keyboard mashing (e.g. "qwertyuiop", "asdfgh"), gibberish, or non-STEM topics (e.g. "celebrity gossip", "cooking pasta") are NOT valid.

If the topic is NOT a valid STEM topic, respond with ONLY:
{"error": "\\"${data.topic}\\" is not a recognized STEM topic. Try something like Photosynthesis, Ohm's Law, or Newton's Laws."}

If it IS a valid STEM topic, generate a ${data.count}-question high-school STEM quiz.
Mix question types: multiple-choice (with 4 options), true/false, and at least one short-answer.
For mcq: "answer" must exactly match one of "options". For tf: "answer" must be "True" or "False".
Keep questions clear and concise; include a brief explanation for each.

Respond with ONLY a valid JSON object (no markdown, no code fences). Either the error shape above, or:
{
  "title": "Quiz title about ${data.topic}",
  "questions": [
    { "type": "mcq", "question": "...", "options": ["A","B","C","D"], "answer": "A", "explanation": "..." },
    { "type": "tf",  "question": "...", "answer": "True", "explanation": "..." },
    { "type": "short", "question": "...", "answer": "...", "explanation": "..." }
  ]
}`,
    });

    const parsed = extractJson(text) as { error?: string };
    if (parsed && typeof parsed.error === "string") {
      return { error: parsed.error } as { error: string };
    }
    return QuizOutput.parse(parsed);
  });

