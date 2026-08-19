const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.5-flash";
const PREMIUM_MODEL = "openai/gpt-5.6-sol";

export class AIUnavailableError extends Error {}
export class AIRateLimitError extends Error {}

type Message = { role: "system" | "user"; content: string };

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = requestCounts.get(key);
  if (!bucket || now > bucket.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= max)
    throw new AIRateLimitError("AI rate limit exceeded. Please try again shortly.");
  bucket.count++;
}

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

function buildVoiceInstruction(voice?: string | null) {
  if (!voice) return "";
  return `The series voice profile is: "${voice}". Adapt tone, pacing, and word choice to match it without changing events.`;
}

/** Layer 2: AI-polished version of a single human contribution. */
export async function polishText(
  original: string,
  style: string,
  seriesVoice?: string | null,
): Promise<{ text: string; model: string }> {
  checkRateLimit("polish", 60, 60_000);
  const guide = POLISH_GUIDE[style] ?? POLISH_GUIDE["balanced"]!;
  return callAI(
    [
      {
        role: "system",
        content: [
          "You are the StoryWeaver editorial polisher. A human player wrote a short piece of a collaborative story.",
          guide,
          buildVoiceInstruction(seriesVoice),
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
  checkRateLimit("synthesize", 20, 60_000);
  return callAI(
    [
      {
        role: "system",
        content: [
          "You are the StoryWeaver chapter editor. You receive the ordered contributions of a finished multiplayer story game.",
          "Weave them into one continuous chapter: smooth transitions, consistent tense and names, clean paragraphing.",
          "Preserve every story event and the order they happened in. Do not invent new plot. Do not add a title or commentary.",
          buildVoiceInstruction(seriesVoice),
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
    { model: PREMIUM_MODEL, maxTokens: 2000 },
  );
}

/** AI Game Master: a challenge or twist for the next turn. */
export async function generateChallenge(
  premise: string,
  recent: string[],
  genre: string,
): Promise<{ kind: string; text: string; model: string }> {
  checkRateLimit("challenge", 30, 60_000);
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          "You are the StoryWeaver AI Game Master. Give the next writer ONE short instruction that raises tension without dictating the plot. Max 14 words. Reply with either 'TWIST: ...' or 'CHALLENGE: ...' and nothing else.",
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
  checkRateLimit("architect", 10, 60_000);
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          'You are the StoryWeaver Story Architect. Reply with ONLY minified JSON: {"title","genre","premise","tone","characters":["..."],"setting","conflict"}. Premise is 2 sentences, hook-first, written for strangers who will continue it.',
      },
      { role: "user", content: idea },
    ],
    { maxTokens: 600 },
  );
  const json = JSON.parse(
    text
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim(),
  ) as {
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
  checkRateLimit("continuity", 30, 60_000);
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
  const parsed = JSON.parse(
    out
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim(),
  ) as {
    ok: boolean;
    note?: string;
  };
  return { ok: parsed.ok !== false, note: parsed.note?.trim() || null, model };
}

/** AI Memory: summarize a series bible and recent chapters so the AI stays consistent across long runs. */
export async function summarizeSeriesMemory(
  title: string,
  bible: { kind: string; name: string; body: string }[],
  recentChapterSummaries: string[],
): Promise<{ summary: string; model: string }> {
  checkRateLimit("memory", 10, 60_000);
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          "You are the StoryWeaver Memory Keeper. Condense the provided Story Bible and recent chapter summaries into a tight 6-sentence briefing a writer can use to stay consistent. Focus on characters, places, unresolved threads, and tone. Return only the briefing.",
      },
      {
        role: "user",
        content: `Series: ${title}\n\nBible:\n${bible.map((b) => `- ${b.name} (${b.kind}): ${b.body}`).join("\n")}\n\nRecent chapters:\n${recentChapterSummaries.join("\n---\n")}`,
      },
    ],
    { model: PREMIUM_MODEL, maxTokens: 600 },
  );
  return { summary: text, model };
}

/** AI Narration: generate a text-to-speech-friendly narration script for a chapter. */
export async function narrateChapter(
  title: string,
  content: string,
): Promise<{ script: string; model: string }> {
  checkRateLimit("narrate", 10, 60_000);
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          "You are a calm audiobook narrator. Rewrite the chapter as a single spoken paragraph, smoothing out paragraph breaks and dialogue tags so it reads aloud naturally. Keep every event and line of dialogue. Return only the narration script.",
      },
      { role: "user", content: `Chapter: ${title}\n\n${content}` },
    ],
    { maxTokens: 2000 },
  );
  return { script: text, model };
}

/** Creator voice profile: validate and expand a short voice description into a fuller profile. */
export async function expandVoiceProfile(shortDescription: string): Promise<{
  voice: string;
  pacing: string;
  vocabulary: string;
  forbidden: string[];
  model: string;
}> {
  checkRateLimit("voice", 10, 60_000);
  const { text, model } = await callAI(
    [
      {
        role: "system",
        content:
          'You are a literary voice coach. Given a creator\'s short voice description, expand it into a structured profile. Reply with ONLY minified JSON: {"voice":"one sentence describing tone","pacing":"pacing guidance","vocabulary":"word-choice guidance","forbidden":["avoid this","and this"]}.',
      },
      { role: "user", content: shortDescription },
    ],
    { maxTokens: 400 },
  );
  const parsed = JSON.parse(
    text
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim(),
  ) as {
    voice: string;
    pacing: string;
    vocabulary: string;
    forbidden: string[];
  };
  return { ...parsed, model };
}
