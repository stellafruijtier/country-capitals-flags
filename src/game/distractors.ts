import { shuffle, type Rng } from "./shuffle";
import type { Category, CountryEntry } from "./types";

/**
 * Hand-curated flag look-alikes, used to make Flags rounds harder by
 * preferring a visually-similar wrong option over a random one when
 * available. Not exhaustive — falls back to same-continent/random picks.
 */
export const FLAG_LOOKALIKES: Record<string, string[]> = {
  TD: ["RO"],
  RO: ["TD", "MD"],
  ID: ["MC", "PL"],
  MC: ["ID", "PL"],
  PL: ["ID", "MC"],
  IE: ["CI"],
  CI: ["IE"],
  AU: ["NZ"],
  NZ: ["AU"],
  NL: ["LU"],
  LU: ["NL"],
  VE: ["EC", "CO"],
  EC: ["VE", "CO"],
  CO: ["VE", "EC"],
  SN: ["ML"],
  ML: ["SN"],
  MD: ["RO"],
};

/**
 * Picks `count` wrong options for `correct`, preferring (in order):
 * hand-curated look-alikes, same-continent countries, then anything else.
 * Never includes the correct answer or duplicates.
 */
export function pickDistractors(
  correct: CountryEntry,
  allCountries: CountryEntry[],
  count: number,
  category: Category,
  rng: Rng = Math.random,
): CountryEntry[] {
  const byCode = new Map(allCountries.map((c) => [c.code, c]));
  const pool = allCountries.filter((c) => c.code !== correct.code);
  const chosen: CountryEntry[] = [];
  const chosenCodes = new Set<string>();

  function take(candidates: CountryEntry[]) {
    for (const candidate of shuffle(candidates, rng)) {
      if (chosen.length >= count) return;
      if (chosenCodes.has(candidate.code)) continue;
      chosen.push(candidate);
      chosenCodes.add(candidate.code);
    }
  }

  if (category === "flags") {
    const lookalikeCodes = FLAG_LOOKALIKES[correct.code] ?? [];
    const lookalikes = lookalikeCodes
      .map((code) => byCode.get(code))
      .filter((c): c is CountryEntry => c !== undefined);
    take(lookalikes);
  }

  const sameContinent = pool.filter((c) => c.continent === correct.continent);
  take(sameContinent);

  if (chosen.length < count) {
    take(pool);
  }

  return chosen.slice(0, count);
}
