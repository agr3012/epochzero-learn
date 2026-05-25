// lib/forum/aiScreen.ts
// Layer 2 moderation — Gemini Flash (free tier).
// Called only after the rule filter passes.
// Fail-safe: any error or timeout returns 'hold' (never auto-publishes).

export type AiDecision = {
  decision: 'approve' | 'hold' | 'reject';
  reason?: string;
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

const SYSTEM_PROMPT = `You are a strict content moderator for an academic cybersecurity learning forum run by a government university in India. Students post technical questions and discussions about reverse engineering, malware analysis, cloud security, cryptography, and web development.

Evaluate the POST below and return ONLY a JSON object, no markdown, no preamble:
{"decision":"approve|hold|reject","reason":"short reason if not approved"}

Decision rules:
- "approve": legitimate technical discussion, questions, answers, study help. Discussing malware analysis, exploits, vulnerabilities, hacking techniques in an EDUCATIONAL/DEFENSIVE context is ALLOWED and normal for this forum.
- "hold": borderline cases needing human review — mild personal attacks, possible spam, off-topic but not harmful, unclear intent.
- "reject": abusive/harassing language, sexual or pornographic content, hate speech targeting religion/caste/gender/community, piracy or illegal download links, real requests to harm/hack specific people or systems maliciously, drug/weapon sales, doxxing, or sharing others' private data.

IMPORTANT: This is a cybersecurity course. Technical talk about malware, exploits, payloads, reverse engineering, and attacks is the SUBJECT MATTER and must be approved. Only reject genuinely malicious real-world solicitation or clearly abusive/illegal content — not academic security discussion.

Return strict JSON only.`;

export async function aiScreen(title: string, body: string): Promise<AiDecision> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // No key configured — fail safe to hold
    return { decision: 'hold', reason: 'AI screening unavailable; queued for review.' };
  }

  const post = `POST TITLE: ${title}\nPOST BODY: ${body}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000); // 4s hard limit

  try {
    const res = await fetch(GEMINI_URL(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: post }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 100,
          responseMimeType: 'application/json',
        },
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { decision: 'hold', reason: 'AI screening error; queued for review.' };
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) return { decision: 'hold', reason: 'AI returned empty; queued for review.' };

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    const decision = parsed.decision;

    if (decision === 'approve' || decision === 'hold' || decision === 'reject') {
      return { decision, reason: parsed.reason };
    }
    return { decision: 'hold', reason: 'Unrecognised AI response; queued for review.' };
  } catch {
    clearTimeout(timeout);
    // Timeout or network error — fail safe
    return { decision: 'hold', reason: 'AI screening timed out; queued for review.' };
  }
}
