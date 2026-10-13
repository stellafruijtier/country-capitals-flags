import type { CountryEntry, Direction } from "./types";

/** The question prompt shown above the answer area. */
export function promptText(direction: Direction, country: CountryEntry): string {
  switch (direction) {
    case "country-to-capital":
      return `What is the capital of ${country.name}?`;
    case "capital-to-country":
      return `Which country has the capital ${country.capitals[0]}?`;
    case "flag-to-country":
      return "Which country does this flag belong to?";
    case "country-to-flag":
      return `Which flag belongs to ${country.name}?`;
  }
}

/** Text label for a multiple-choice option (unused for country-to-flag, which renders images). */
export function optionLabel(direction: Direction, option: CountryEntry): string {
  switch (direction) {
    case "country-to-capital":
      return option.capitals[0];
    case "capital-to-country":
    case "flag-to-country":
      return option.name;
    case "country-to-flag":
      return option.name; // used for aria-label only, never rendered as visible text
  }
}

/** What the player is meant to type in, for placeholder/label text. */
export function typeInLabel(direction: Direction): string {
  switch (direction) {
    case "country-to-capital":
      return "Capital";
    case "capital-to-country":
    case "flag-to-country":
      return "Country";
    case "country-to-flag":
      throw new Error("country-to-flag has no type-in mode");
  }
}
