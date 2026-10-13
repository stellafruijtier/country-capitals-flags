import { describe, expect, it } from "vitest";
import countriesData from "../data/countries.json";
import {
  buildRoundCountries,
  createRound,
  currentCountry,
  filterByRegion,
  isRoundComplete,
  submitAnswer,
} from "./round";
import { seededRng } from "./testRng";
import type { CountryEntry } from "./types";

const countries = countriesData as CountryEntry[];

describe("filterByRegion", () => {
  it("returns everything for World", () => {
    expect(filterByRegion(countries, "World")).toHaveLength(countries.length);
  });

  it("restricts to a single continent", () => {
    const africa = filterByRegion(countries, "Africa");
    expect(africa.length).toBeGreaterThan(0);
    expect(africa.every((c) => c.continent === "Africa")).toBe(true);
    expect(africa.length).toBeLessThan(countries.length);
  });
});

describe("buildRoundCountries", () => {
  it("respects the continent filter", () => {
    const round = buildRoundCountries(countries, "Europe", 10, seededRng(1));
    expect(round).toHaveLength(10);
    expect(round.every((c) => c.continent === "Europe")).toBe(true);
  });

  it("never repeats a country within the round", () => {
    const round = buildRoundCountries(countries, "World", 20, seededRng(2));
    const codes = round.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("'all' returns the full filtered pool with no repeats", () => {
    const round = buildRoundCountries(countries, "South America", "all", seededRng(3));
    const expectedCount = countries.filter((c) => c.continent === "South America").length;
    expect(round).toHaveLength(expectedCount);
    expect(new Set(round.map((c) => c.code)).size).toBe(expectedCount);
  });
});

describe("round state machine", () => {
  it("tracks score, streak, and misses across a round", () => {
    const roundCountries = buildRoundCountries(countries, "World", 10, seededRng(4));
    let state = createRound(roundCountries);

    expect(isRoundComplete(state)).toBe(false);
    expect(currentCountry(state)).toBe(roundCountries[0]);

    state = submitAnswer(state, true);
    expect(state.score).toBe(1);
    expect(state.streak).toBe(1);
    expect(state.misses).toHaveLength(0);

    state = submitAnswer(state, false);
    expect(state.score).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.misses).toHaveLength(1);
    expect(state.misses[0]).toBe(roundCountries[1]);

    for (let i = 2; i < 10; i++) {
      state = submitAnswer(state, true);
    }
    expect(isRoundComplete(state)).toBe(true);
    expect(state.score).toBe(1 + 8);
  });
});
