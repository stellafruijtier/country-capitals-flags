import { pickDistractors } from "./distractors";
import { shuffle, type Rng } from "./shuffle";
import type { AnswerStyle, Category, CountryEntry, Direction, Question } from "./types";

const OPTION_COUNT = 4;

export function buildQuestion(
  country: CountryEntry,
  allCountries: CountryEntry[],
  category: Category,
  direction: Direction,
  answerStyle: AnswerStyle,
  rng: Rng = Math.random,
): Question {
  if (answerStyle === "type-in") {
    return { answerStyle: "type-in", category, direction, country };
  }

  const distractors = pickDistractors(country, allCountries, OPTION_COUNT - 1, category, rng);
  const options = shuffle([country, ...distractors], rng);
  return { answerStyle: "multiple-choice", category, direction, country, options };
}
