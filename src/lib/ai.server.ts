const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.5-flash";

export class AIUnavailableError extends Error {}

type Message = { role: "system" | "user"; content: string };

/** Single low-level call to the Lovable AI Gateway. Server-only. */
export async function callAI(
  messages: Message[],
  opts: { model?: string; maxTokens?: number } = {},
): Promise<{ text: string; model: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AIUnavailableError("AI gateway is not configured");

  const model = opts.model ?? DEFAULT_MODEL;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: opts.maxTokens ?? 900 }),
  });

  if (!res.ok) {
    throw new AIUnavailableError(`AI gateway responded ${res.status}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AIUnavailableError("AI gateway returned no content");
  return { text, model };
}

const POLISH_GUIDE: Record<string, string> = {
  light: "Fix only grammar, spelling and punctuation. Keep every word choice you can.",
  balanced:
    "Improve grammar, clarity, sentence rhythm and readability while preserving the writer's voice and every story fact.",
  cinematic:
    "Edit expressively for literary impact: stronger rhythm, sharper imagery, cleaner paragraph breaks. Invent no new events, characters or facts.",
};

/** Layer 2: AI-polished version of a single human contribution. */
export async function polishText(
  original: string,
  style: string,
  seriesVoice?: string | null,
): Promise<{ text: string; model: string }> {
  const guide = POLISH_GUIDE[style] ?? POLISH_GUIDE["balanced"]!;
  return callAI(
    [
      {
        role: "system",
        content: [
          "You are the StoryPass editorial polisher. A human player wrote a short piece of a collaborative story.",
          guide,
          seriesVoice ? `Series voice to preserve: ${seriesVoice}.` : "",
          "Never add new plot events, characters or dialogue. Never comment. Return only the edited prose.",
        ]
          .filter(Boolean)
          .join(" "),
      },
      { role: "user", content: original },
    ],
    { maxTokens: 700 },
  );
}

/** Layer 3: synthesise the canonical chapter from the polished contributions. */
export async function synthesizeChapter(
  title: string,
  premise: string,
  passages: string[],
  seriesVoice?: string | null,
): Promise<{ text: string; model: string }> {
  return callAI(
    [
      {
        role: "system",
        content: [
          "You are the StoryPass chapter editor. You receive the ordered contributions of a finished multiplayer story game.",
          "Weave them into one continuous chapter: smooth transitions, consistent tense and names, clean paragraphing.",
          "Preserve every story event and the order they happened in. Do not invent new plot. Do not add a title or commentary.",
          seriesVoice ? `Series voice: ${seriesVoice}.` : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
      {
        role: "user",
        content: `Chapter title: ${title}\nPremise: ${premise}\n\nContributions in order:\n\n${passages
          .map((p, i) => `[${i + 1}] ${p}`)
          .join("\n\n")}`,
      },
    ],
    { maxTokens: 2000 },
  );
}

/** AI Game Master: a challenge or twist for the next turn. */
export async function generateChallenge(
  premise: string,
  recent: string[],
  genre: string,
): Promise<{ kind: string; text: string; model: string }> {
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          "You are the StoryPass AI Game Master. Give the next writer ONE short instruction that raises tension without dictating the plot. Max 14 words. Reply with either 'TWIST: ...' or 'CHALLENGE: ...' and nothing else.",
      },
      {
        role: "user",
        content: `Genre: ${genre}\nPremise: ${premise}\nRecent story:\n${recent.slice(-3).join("\n")}`,
      },
    ],
    { maxTokens: 80 },
  );
  const kind = text.toUpperCase().startsWith("TWIST") ? "twist" : "challenge";
  return { kind, text: text.replace(/^(TWIST|CHALLENGE)\s*:\s*/i, ""), model };
}

/** AI Story Architect: propose the shape of a new story. */
export async function architectStory(idea: string): Promise<{
  title: string;
  genre: string;
  premise: string;
  tone: string;
  characters: string[];
  setting: string;
  conflict: string;
  model: string;
}> {
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          'You are the StoryPass Story Architect. Reply with ONLY minified JSON: {"title","genre","premise","tone","characters":["..."],"setting","conflict"}. Premise is 2 sentences, hook-first, written for strangers who will continue it.',
      },
      { role: "user", content: idea },
    ],
    { maxTokens: 600 },
  );
  const json = JSON.parse(text.replace(/^```(json)?/i, "").replace(/```$/, "").trim()) as {
    title: string;
    genre: string;
    premise: string;
    tone: string;
    characters: string[];
    setting: string;
    conflict: string;
  };
  return { ...json, model };
}

/** AI Continuity Manager: flag conflicts with established canon. */
export async function checkContinuity(
  text: string,
  bible: { kind: string; name: string; body: string }[],
): Promise<{ ok: boolean; note: string | null; model: string }> {
  if (bible.length === 0) return { ok: true, note: null, model: "skipped" };
  const { text: out, model } = await callAI(
    [
      {
        role: "system",
        content:
          'You check a new story contribution against a Story Bible. Reply with ONLY minified JSON: {"ok":true|false,"note":"one sentence or empty"}. Only flag a real contradiction of an established fact.',
      },
      {
        role: "user",
        content: `Story Bible:\n${bible
          .map((b) => `- (${b.kind}) ${b.name}: ${b.body}`)
          .join("\n")}\n\nNew contribution:\n${text}`,
      },
    ],
    { maxTokens: 200 },
  );
  const parsed = JSON.parse(out.replace(/^```(json)?/i, "").replace(/```$/, "").trim()) as {
    ok: boolean;
    note?: string;
  };
  return { ok: parsed.ok !== false, note: parsed.note?.trim() || null, model };
}
