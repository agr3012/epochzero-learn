// lib/forum/ruleFilter.ts
// Layer 1 moderation — fast, synchronous, zero-cost rule checks.
// Runs before the AI screen. Hard matches reject immediately.

export type RuleResult = {
  decision: 'pass' | 'reject';
  reason?: string;
};

// ── Profanity / abuse wordlist (English + common transliterated abuse) ──
// Kept deliberately conservative to avoid false positives on technical terms.
// Uses word-boundary matching so "assistant", "class", "Scunthorpe" etc. are safe.
const PROFANITY = [
  // English
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'dick', 'cunt', 'slut',
  'whore', 'motherfucker', 'fucker', 'nigger', 'faggot', 'retard',
  // Common transliterated Hindi/Gujarati abuse
  'bhenchod', 'behenchod', 'madarchod', 'madarchod', 'bhosdi', 'bhosdike',
  'chutiya', 'chutia', 'gandu', 'gaandu', 'harami', 'randi', 'lavde',
  'lund', 'chod', 'mc', 'bc',
];

// ── Piracy / illegal content domains and keywords ──────────────────────
const PIRACY_PATTERNS = [
  'torrent', 'warez', 'crack', 'keygen', 'serial key', 'cracked',
  'pirated', 'free download full', 'nulled', 'rapidgator', 'mega.nz/file',
  '1337x', 'thepiratebay', 'piratebay', 'kickass', 'limetorrent',
  'movierulz', 'tamilrockers', 'filmywap', 'gomovies', '123movies',
];

// ── Illegal / dangerous solicitation ───────────────────────────────────
const ILLEGAL_PATTERNS = [
  'buy drugs', 'sell drugs', 'child porn', 'cp link', 'hire hacker',
  'hack someone', 'ddos for hire', 'stolen card', 'cc dump', 'carding',
  'fake passport', 'buy weapon', 'sell weapon',
];

// ── Spam patterns ──────────────────────────────────────────────────────
const PHONE_REGEX  = /(?:\+?\d[\d\s\-]{8,}\d)/g;          // long digit runs
const URL_REGEX    = /https?:\/\/[^\s]+/gi;
const REPEAT_CHAR  = /(.)\1{9,}/;                          // aaaaaaaaaa

function hasWordBoundaryMatch(text: string, words: string[]): string | null {
  const lower = text.toLowerCase();
  for (const w of words) {
    // word-boundary for multi-word and single-word terms
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(w)}([^a-z0-9]|$)`, 'i');
    if (re.test(lower)) return w;
  }
  return null;
}

function hasSubstring(text: string, patterns: string[]): string | null {
  const lower = text.toLowerCase();
  for (const p of patterns) {
    if (lower.includes(p)) return p;
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function ruleFilter(title: string, body: string): RuleResult {
  const combined = `${title}\n${body}`;

  // 1. Profanity (word-boundary)
  const prof = hasWordBoundaryMatch(combined, PROFANITY);
  if (prof) {
    return { decision: 'reject', reason: 'Your post contains language that is not allowed on this forum. Please rephrase respectfully.' };
  }

  // 2. Piracy
  const piracy = hasSubstring(combined, PIRACY_PATTERNS);
  if (piracy) {
    return { decision: 'reject', reason: 'Posts referencing piracy or illegal downloads are not permitted.' };
  }

  // 3. Illegal solicitation
  const illegal = hasSubstring(combined, ILLEGAL_PATTERNS);
  if (illegal) {
    return { decision: 'reject', reason: 'This post appears to reference illegal activity and cannot be published.' };
  }

  // 4. Spam — excessive URLs
  const urls = combined.match(URL_REGEX) ?? [];
  if (urls.length > 3) {
    return { decision: 'reject', reason: 'Too many links in a single post. Please limit external links.' };
  }

  // 5. Spam — phone number harvesting
  const phones = combined.match(PHONE_REGEX) ?? [];
  if (phones.length > 1) {
    return { decision: 'reject', reason: 'Posting multiple phone numbers is not allowed.' };
  }

  // 6. Spam — character flooding
  if (REPEAT_CHAR.test(combined)) {
    return { decision: 'reject', reason: 'Your post appears to contain spam (repeated characters).' };
  }

  // 7. Minimum quality — empty or too short
  if (body.trim().length < 10) {
    return { decision: 'reject', reason: 'Your post is too short. Please add more detail.' };
  }

  return { decision: 'pass' };
}
