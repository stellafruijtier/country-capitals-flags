import { shuffle, type Rng } from "./shuffle";
import type { CountryEntry, Region, RoundLength } from "./types";

export function filterByRegion(countries: CountryEntry[], region: Region): CountryEntry[] {
  return region === "World" ? countries : countries.filter((c) => c.continent === region);
}

/** Builds the unique, shuffled sequence of countries for one round. */
export function buildRoundCountries(
  countries: CountryEntry[],
  region: Region,
  length: RoundLength,
  rng: Rng = Math.random,
): CountryEntry[] {
  const pool = filterByRegion(countries, region);
  const shuffled = shuffle(pool, rng);
  return length === "all" ? shuffled : shuffled.slice(0, length);
}

export interface RoundState {
  countries: CountryEntry[];
  currentIndex: number;
  score: number;
  streak: number;
  misses: CountryEntry[];
}

export function createRound(countries: CountryEntry[]): RoundState {
  return { countries, currentIndex: 0, score: 0, streak: 0, misses: [] };
}

export function submitAnswer(state: RoundState, wasCorrect: boolean): RoundState {
  const current = state.countries[state.currentIndex];
  return {
    countries: state.countries,
    currentIndex: state.currentIndex + 1,
    score: state.score + (wasCorrect ? 1 : 0),
    streak: wasCorrect ? state.streak + 1 : 0,
    misses: wasCorrect ? state.misses : [...state.misses, current],
  };
}

export function isRoundComplete(state: RoundState): boolean {
  return state.currentIndex >= state.countries.length;
}

export function currentCountry(state: RoundState): CountryEntry | undefined {
  return state.countries[state.currentIndex];
}
