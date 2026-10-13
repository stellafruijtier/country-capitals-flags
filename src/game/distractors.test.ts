import { describe, expect, it } from "vitest";
import countriesData from "../data/countries.json";
import { pickDistractors } from "./distractors";
import { seededRng } from "./testRng";
import type { CountryEntry } from "./types";

const countries = countriesData as CountryEntry[];
const byName = (name: string) => countries.find((c) => c.name === name)!;

describe("pickDistractors", () => {
  it("never includes the correct answer and has no duplicates", () => {
    const correct = byName("France");
    for (let seed = 0; seed < 20; seed++) {
      const distractors = pickDistractors(correct, countries, 3, "capitals", seededRng(seed));
      expect(distractors).toHaveLength(3);
      expect(distractors.some((d) => d.code === correct.code)).toBe(false);
      const codes = distractors.map((d) => d.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("prefers the same continent as the correct answer", () => {
    const correct = byName("Kenya"); // Africa has plenty of countries
    const distractors = pickDistractors(correct, countries, 3, "capitals", seededRng(1));
    expect(distractors.every((d) => d.continent === "Africa")).toBe(true);
  });

  it("fills from a smaller pool without exceeding what's available", () => {
    const correct = byName("Monaco");
    // A pool with only 2 other countries total (smaller than the requested count of 3).
    const smallPool = [correct, byName("San Marino"), byName("Liechtenstein")];
    const distractors = pickDistractors(correct, smallPool, 3, "flags", seededRng(2));
    expect(distractors.length).toBe(2); // can't exceed available pool
    expect(distractors.every((d) => d.code !== correct.code)).toBe(true);
  });

  it("prefers curated look-alikes for flags when available", () => {
    const chad = byName("Chad");
    const distractors = pickDistractors(chad, countries, 3, "flags", seededRng(3));
    expect(distractors.some((d) => d.name === "Romania")).toBe(true);
  });
});
