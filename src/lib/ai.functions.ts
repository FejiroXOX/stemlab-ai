import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ExplainInput = z.object({
  experiment: z.string(),
  setup: z.string(),
  result: z.string(),
});

export const explainExperiment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ExplainInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          headline: z.string(),
          whatHappened: z.string(),
          whyItHappened: z.string(),
          keyConcepts: z.array(z.string()),
          realWorld: z.string(),
          funFact: z.string(),
          difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
        }),
      }),
      prompt: `Explain this STEM experiment to a curious student.

Experiment: ${data.experiment}
Setup: ${data.setup}
Result: ${data.result}

Provide a vivid headline, a clear "what happened", a scientific "why", 3-5 key concepts, a real-world application, a fun fact, and a difficulty rating.`,
    });
    return output;
  });

const QuizInput = z.object({
  topic: z.string(),
  count: z.number().int().min(3).max(8).default(5),
});

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuizInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
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
        }),
      }),
      prompt: `Generate a ${data.count}-question quiz on: ${data.topic}. Mix multiple-choice (4 options), true/false, and one short-answer question. Keep questions clear, age-appropriate for high schoolers, and include concise explanations.`,
    });
    return output;
  });
