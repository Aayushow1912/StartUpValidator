import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `You are a startup analyst. Given a startup idea, return a STRICT JSON object with this exact shape and no extra prose:
{
  "swot": {
    "strengths": [string, string, string],
    "weaknesses": [string, string, string],
    "opportunities": [string, string, string],
    "threats": [string, string, string]
  },
  "competitors": [{"name": string, "description": string, "threat": "Low Threat"|"Medium Threat"|"High Threat"}],
  "revenueModels": [{"name": string, "description": string, "viability": "Low Viability"|"Medium Viability"|"High Viability"}],
  "risks": {
    "overall": number,
    "items": [
      {"name": "Market Competition", "score": number, "description": string},
      {"name": "Technical Feasibility", "score": number, "description": string},
      {"name": "Market Demand", "score": number, "description": string},
      {"name": "Regulatory Risk", "score": number, "description": string}
    ]
  },
  "scaling": string
}
Provide exactly 3 items in each SWOT array, 3 competitors, 3 revenue models. Scores 0-10. "scaling" is 2-3 paragraphs of substantive recommendations.`;

export const analyzeIdea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ idea: z.string().min(5).max(2000) }).parse(data))
  .handler(async ({ data, context }) => {
    // Use OpenRouter (OpenAI-compatible API) instead of Lovable's private gateway.
    // OPENROUTER_API_KEY is the server-side var; VITE_OPENAI_API_KEY is the fallback
    // already present in this project's .env (an OpenRouter key).
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter recommends these; they are optional but helpful.
        "HTTP-Referer": "https://startup-validator.local",
        "X-Title": "StartUp Validator",
      },
      body: JSON.stringify({
        model: "tencent/hy3:free",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Startup idea: ${data.idea}` },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI request failed: ${res.status} ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("analyses")
      .insert({ user_id: userId, idea: data.idea, result: parsed as never })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });