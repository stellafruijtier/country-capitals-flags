import type { CountryEntry } from "./types";

export type MatchTarget = "country" | "capital";

export interface MatchResult {
  correct: boolean;
  matchedVia: "exact" | "typo" | null;
}

/** Lowercases, strips diacritics and punctuation, collapses whitespace. */
export function normalizeAnswer(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Typo tolerance budget based on the length of the canonical answer. */
export function typoThreshold(normalizedLength: number): number {
  if (normalizedLength >= 10) return 2;
  if (normalizedLength >= 5) return 1;
  return 0;
}

interface Candidate {
  code: string;
  value: string;
  normalized: string;
}

function buildCandidates(countries: CountryEntry[], target: MatchTarget): Candidate[] {
  const candidates: Candidate[] = [];
  for (const country of countries) {
    const values = target === "country" ? [country.name, ...country.aliases] : country.capitals;
    for (const value of values) {
      candidates.push({ code: country.code, value, normalized: normalizeAnswer(value) });
    }
  }
  return candidates;
}

/**
 * Matches a typed answer against the accepted names/capitals for
 * `targetCode`, forgiving case/accents/punctuation and small typos, while
 * refusing a typo that is equally close to a different country's answer
 * (e.g. "Niger" vs "Nigeria") so look-alikes are never accidentally accepted.
 */
export function matchAnswer(
  rawInput: string,
  targetCode: string,
  target: MatchTarget,
  countries: CountryEntry[],
): MatchResult {
  const normInput = normalizeAnswer(rawInput);
  if (!normInput) return { correct: false, matchedVia: null };

  const candidates = buildCandidates(countries, target);

  const exactMatch = candidates.some((c) => c.code === targetCode && c.normalized === normInput);
  if (exactMatch) return { correct: true, matchedVia: "exact" };

  const typoMatchedCodes = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.normalized === normInput) continue; // exact matches to other countries are rejected, not typos
    const distance = levenshtein(normInput, candidate.normalized);
    if (distance > 0 && distance <= typoThreshold(candidate.normalized.length)) {
      typoMatchedCodes.add(candidate.code);
    }
  }

  if (typoMatchedCodes.size === 1 && typoMatchedCodes.has(targetCode)) {
    return { correct: true, matchedVia: "typo" };
  }

  return { correct: false, matchedVia: null };
}
