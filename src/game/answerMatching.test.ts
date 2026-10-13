import { describe, expect, it } from "vitest";
import countriesData from "../data/countries.json";
import { matchAnswer, normalizeAnswer } from "./answerMatching";
import type { CountryEntry } from "./types";

const countries = countriesData as CountryEntry[];
const byName = (name: string) => countries.find((c) => c.name === name)!;

describe("normalizeAnswer", () => {
  it("lowercases, strips accents, punctuation, and extra whitespace", () => {
    expect(normalizeAnswer("Côte d'Ivoire")).toBe("cote d ivoire");
    expect(normalizeAnswer("  São   Tomé  ")).toBe("sao tome");
    expect(normalizeAnswer("ST. VINCENT")).toBe("st vincent");
  });
});

describe("matchAnswer - country target", () => {
  it("accepts the canonical name case-insensitively and accent-insensitively", () => {
    const turkiye = byName("Türkiye");
    expect(matchAnswer("turkiye", turkiye.code, "country", countries).correct).toBe(true);
    expect(matchAnswer("TURKIYE", turkiye.code, "country", countries).correct).toBe(true);
  });

  it("accepts listed aliases", () => {
    const turkiye = byName("Türkiye");
    expect(matchAnswer("Turkey", turkiye.code, "country", countries).correct).toBe(true);

    const eswatini = byName("Eswatini");
    expect(matchAnswer("Swaziland", eswatini.code, "country", countries).correct).toBe(true);

    const czechia = byName("Czechia");
    expect(matchAnswer("Czech Republic", czechia.code, "country", countries).correct).toBe(true);
  });

  it("keeps the two Congos distinguishable", () => {
    const dr = byName("Democratic Republic of the Congo");
    const republic = byName("Republic of the Congo");
    expect(matchAnswer("Democratic Republic of the Congo", dr.code, "country", countries).correct).toBe(
      true,
    );
    expect(matchAnswer("Democratic Republic of the Congo", republic.code, "country", countries).correct).toBe(
      false,
    );
    expect(matchAnswer("Republic of the Congo", republic.code, "country", countries).correct).toBe(true);
    expect(matchAnswer("Republic of the Congo", dr.code, "country", countries).correct).toBe(false);
  });

  it("tolerates a small typo on a long name", () => {
    const madagascar = byName("Madagascar");
    expect(matchAnswer("Madagsacar", madagascar.code, "country", countries).matchedVia).toBe("typo");
  });

  it("rejects a typo that is equally close to a different country (Niger/Nigeria)", () => {
    const niger = byName("Niger");
    const nigeria = byName("Nigeria");
    expect(matchAnswer("Nigeria", niger.code, "country", countries).correct).toBe(false);
    expect(matchAnswer("Niger", nigeria.code, "country", countries).correct).toBe(false);
  });

  it("rejects a typo that is equally close to a different country (Guinea/Guinea-Bissau)", () => {
    const guinea = byName("Guinea");
    const guineaBissau = byName("Guinea-Bissau");
    expect(matchAnswer("Guinea-Bissau", guinea.code, "country", countries).correct).toBe(false);
    expect(matchAnswer("Guinea", guineaBissau.code, "country", countries).correct).toBe(false);
  });

  it("rejects a typo that is equally close to a different country (Dominica/Dominican Republic)", () => {
    const dominica = byName("Dominica");
    const dominicanRepublic = byName("Dominican Republic");
    expect(matchAnswer("Dominican Republic", dominica.code, "country", countries).correct).toBe(false);
    expect(matchAnswer("Dominica", dominicanRepublic.code, "country", countries).correct).toBe(false);
  });

  it("requires an exact match for short names (no typo budget under 5 letters)", () => {
    const chad = byName("Chad");
    expect(matchAnswer("Chab", chad.code, "country", countries).correct).toBe(false);
  });
});

describe("matchAnswer - capital target", () => {
  it("accepts any listed capital for multi-capital countries", () => {
    const southAfrica = byName("South Africa");
    expect(matchAnswer("Pretoria", southAfrica.code, "capital", countries).correct).toBe(true);
    expect(matchAnswer("Bloemfontein", southAfrica.code, "capital", countries).correct).toBe(true);
    expect(matchAnswer("Cape Town", southAfrica.code, "capital", countries).correct).toBe(true);

    const bolivia = byName("Bolivia");
    expect(matchAnswer("Sucre", bolivia.code, "capital", countries).correct).toBe(true);
    expect(matchAnswer("La Paz", bolivia.code, "capital", countries).correct).toBe(true);

    const netherlands = byName("Netherlands");
    expect(matchAnswer("Amsterdam", netherlands.code, "capital", countries).correct).toBe(true);
    expect(matchAnswer("The Hague", netherlands.code, "capital", countries).correct).toBe(true);
  });

  it("is case and accent insensitive for capitals", () => {
    const mexico = byName("Mexico");
    expect(matchAnswer("mexico city", mexico.code, "capital", countries).correct).toBe(true);

    const peru = byName("Peru");
    const lima = countries.find((c) => c.name === "Peru")!.capitals[0];
    expect(lima).toBe("Lima");
    expect(matchAnswer("LIMA", peru.code, "capital", countries).correct).toBe(true);
  });

  it("tolerates a small typo on a capital", () => {
    const australia = byName("Australia");
    expect(matchAnswer("Canberrra", australia.code, "capital", countries).matchedVia).toBe("typo");
  });

  it("rejects empty or whitespace-only input", () => {
    const france = byName("France");
    expect(matchAnswer("   ", france.code, "capital", countries).correct).toBe(false);
    expect(matchAnswer("", france.code, "capital", countries).correct).toBe(false);
  });
});
