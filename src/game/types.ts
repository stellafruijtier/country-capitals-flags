export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

export interface CountryEntry {
  code: string;
  name: string;
  aliases: string[];
  capitals: string[];
  continent: Continent;
  flag: string;
}

export type Category = "capitals" | "flags";

export type Direction =
  | "country-to-capital"
  | "capital-to-country"
  | "flag-to-country"
  | "country-to-flag";

export type AnswerStyle = "multiple-choice" | "type-in";

export type Region = "World" | Continent;

export type RoundLength = 10 | 20 | "all";

export interface GameSettings {
  category: Category;
  direction: Direction;
  answerStyle: AnswerStyle;
  region: Region;
  length: RoundLength;
}

export interface MultipleChoiceQuestion {
  answerStyle: "multiple-choice";
  category: Category;
  direction: Direction;
  country: CountryEntry;
  options: CountryEntry[];
}

export interface TypeInQuestion {
  answerStyle: "type-in";
  category: Category;
  direction: Direction;
  country: CountryEntry;
}

export type Question = MultipleChoiceQuestion | TypeInQuestion;
