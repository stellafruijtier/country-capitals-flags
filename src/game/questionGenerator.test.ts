import { describe, expect, it } from "vitest";
import countriesData from "../data/countries.json";
import { buildQuestion } from "./questionGenerator";
import { seededRng } from "./testRng";
import type { CountryEntry } from "./types";

const countries = countriesData as CountryEntry[];
const byName = (name: string) => countries.find((c) => c.name === name)!;

describe("buildQuestion - multiple choice", () => {
  it("produces exactly 4 options with no duplicates and the correct answer present", () => {
    const country = byName("Kenya");
    for (let seed = 0; seed < 15; seed++) {
      const question = buildQuestion(
        country,
        countries,
        "capitals",
        "country-to-capital",
        "multiple-choice",
        seededRng(seed),
      );
      if (question.answerStyle !== "multiple-choice") throw new Error("expected MC question");
      expect(question.options).toHaveLength(4);
      const codes = question.options.map((o) => o.code);
      expect(new Set(codes).size).toBe(4);
      expect(question.options.some((o) => o.code === country.code)).toBe(true);
    }
  });

  it("builds a 2x2-ready 4-option set for country-to-flag", () => {
    const country = byName("Brazil");
    const question = buildQuestion(
      country,
      countries,
      "flags",
      "country-to-flag",
      "multiple-choice",
      seededRng(7),
    );
    if (question.answerStyle !== "multiple-choice") throw new Error("expected MC question");
    expect(question.options).toHaveLength(4);
  });
});

describe("buildQuestion - type-in", () => {
  it("has no options field", () => {
    const country = byName("Brazil");
    const question = buildQuestion(
      country,
      countries,
      "capitals",
      "capital-to-country",
      "type-in",
      seededRng(1),
    );
    expect(question.answerStyle).toBe("type-in");
    expect("options" in question).toBe(false);
  });
});
