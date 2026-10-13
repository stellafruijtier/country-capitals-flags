// One-off/rerunnable data generator. Not part of the app runtime bundle.
// Builds src/data/countries.json from world-countries (primary) cross-checked
// against countries-list (secondary), with hand-authored overrides for
// display names, multi-capital entries, and typed-answer aliases.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error - no types published, shape confirmed by manual inspection
import worldCountries from "world-countries";
// @ts-expect-error - no types published
import { countries as countriesList } from "countries-list";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania";

interface CountryEntry {
  code: string;
  name: string;
  aliases: string[];
  capitals: string[];
  continent: Continent;
  flag: string;
}

interface Override {
  name?: string;
  capitals?: string[];
  aliases?: string[];
}

// Vatican City (VA) is flagged unMember:true in world-countries, but the
// Holy See is a UN *observer* state, not a member. Exclude it to land on
// exactly 193 UN member states.
const EXCLUDE_CODES = new Set(["VA"]);

// Hand-authored overrides: display name corrections, extra official
// capitals not captured by either source dataset, and typed-answer aliases.
// Deliberately conservative about aliases that could collide across
// countries (e.g. never aliasing bare "Guinea" or "Congo").
const OVERRIDES: Record<string, Override> = {
  AE: { aliases: ["UAE"] },
  BA: { aliases: ["Bosnia"] },
  BN: { aliases: ["Brunei Darussalam"] },
  BO: { capitals: ["Sucre", "La Paz"], aliases: ["Plurinational State of Bolivia"] },
  BS: { aliases: ["The Bahamas"] },
  CD: {
    name: "Democratic Republic of the Congo",
    aliases: ["DR Congo", "DRC", "Congo-Kinshasa", "Zaire"],
  },
  CF: { aliases: ["CAR"] },
  CG: { aliases: ["Congo-Brazzaville"] },
  CH: { aliases: ["Swiss Confederation"] },
  CI: { aliases: ["Côte d'Ivoire", "Cote d'Ivoire"] },
  CN: { aliases: ["People's Republic of China", "PRC"] },
  CV: { name: "Cabo Verde", aliases: ["Cape Verde"] },
  CZ: { aliases: ["Czech Republic"] },
  FM: { aliases: ["Federated States of Micronesia"] },
  GB: { aliases: ["UK", "Britain", "Great Britain"] },
  GM: { aliases: ["The Gambia"] },
  GR: { aliases: ["Hellenic Republic"] },
  IE: { aliases: ["Republic of Ireland", "Eire"] },
  IN: { aliases: ["Bharat"] },
  IR: { aliases: ["Islamic Republic of Iran"] },
  KN: { aliases: ["St Kitts and Nevis", "St. Kitts and Nevis"] },
  KP: { aliases: ["DPRK", "Democratic People's Republic of Korea"] },
  KR: { aliases: ["Korea", "Republic of Korea"] },
  LA: { aliases: ["Lao PDR"] },
  LC: { aliases: ["St Lucia", "St. Lucia"] },
  LK: { capitals: ["Colombo", "Sri Jayawardenepura Kotte"], aliases: ["Ceylon"] },
  MD: { aliases: ["Republic of Moldova"] },
  MK: { aliases: ["Macedonia"] },
  MM: { aliases: ["Burma"] },
  MY: { capitals: ["Kuala Lumpur", "Putrajaya"] },
  NL: { capitals: ["Amsterdam", "The Hague"], aliases: ["Holland"] },
  PG: { aliases: ["PNG"] },
  RU: { aliases: ["Russian Federation"] },
  ST: { aliases: ["Sao Tome and Principe"] },
  SY: { aliases: ["Syrian Arab Republic"] },
  SZ: { capitals: ["Mbabane", "Lobamba"], aliases: ["Swaziland"] },
  TH: { aliases: ["Siam"] },
  TL: { aliases: ["East Timor"] },
  TR: { name: "Türkiye", aliases: ["Turkey"] },
  TZ: { aliases: ["United Republic of Tanzania"] },
  US: { aliases: ["USA", "US", "United States of America", "America"] },
  VC: { aliases: ["St Vincent and the Grenadines", "St. Vincent and the Grenadines"] },
  VN: { aliases: ["Viet Nam"] },
  WS: { aliases: ["Western Samoa"] },
};

function mapContinent(region: string, subregion: string): Continent {
  switch (region) {
    case "Africa":
      return "Africa";
    case "Europe":
      return "Europe";
    case "Asia":
      return "Asia";
    case "Oceania":
      return "Oceania";
    case "Americas":
      return subregion === "South America" ? "South America" : "North America";
    default:
      throw new Error(`Unmapped region: ${region}`);
  }
}

const members = (worldCountries as any[]).filter(
  (c) => c.unMember === true && !EXCLUDE_CODES.has(c.cca2),
);

if (members.length !== 193) {
  throw new Error(`Expected 193 UN member states, got ${members.length}`);
}

const disagreements: string[] = [];
const entries: CountryEntry[] = members
  .map((c): CountryEntry => {
    const code = c.cca2 as string;
    const override = OVERRIDES[code] ?? {};
    const primaryCapitals: string[] = c.capital ?? [];
    const secondaryCapital: string | undefined = countriesList[code]?.capital;

    if (secondaryCapital) {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
      const matches = primaryCapitals.some((cap) => norm(cap) === norm(secondaryCapital));
      if (!matches) {
        disagreements.push(
          `${code} ${c.name.common}: world-countries=${JSON.stringify(primaryCapitals)} vs countries-list=${secondaryCapital}`,
        );
      }
    }

    const capitals = override.capitals ?? primaryCapitals;

    return {
      code,
      name: override.name ?? c.name.common,
      aliases: override.aliases ?? [],
      capitals,
      continent: mapContinent(c.region, c.subregion),
      flag: `/flags/${code.toLowerCase()}.svg`,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(
  path.join(ROOT, "src/data/countries.json"),
  JSON.stringify(entries, null, 2) + "\n",
);

console.log(`Wrote ${entries.length} countries to src/data/countries.json`);
if (disagreements.length) {
  console.log("\nCapital source disagreements (world-countries vs countries-list):");
  disagreements.forEach((d) => console.log(" - " + d));
} else {
  console.log("No disagreements between world-countries and countries-list.");
}
