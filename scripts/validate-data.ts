// Validates src/data/countries.json and public/flags/ against the rules
// the app depends on. Run with `npx tsx scripts/validate-data.ts`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

interface CountryEntry {
  code: string;
  name: string;
  aliases: string[];
  capitals: string[];
  continent: string;
  flag: string;
}

const CONTINENTS = new Set([
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
]);

const errors: string[] = [];

const countries: CountryEntry[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/countries.json"), "utf-8"),
);

// Exactly 193 entries
if (countries.length !== 193) {
  errors.push(`Expected exactly 193 entries, found ${countries.length}`);
}

// Unique codes
const codeCounts = new Map<string, number>();
for (const c of countries) {
  codeCounts.set(c.code, (codeCounts.get(c.code) ?? 0) + 1);
}
for (const [code, count] of codeCounts) {
  if (count > 1) errors.push(`Duplicate code: ${code} (${count} times)`);
}

// Every entry has at least one capital; continent is valid; flag exists & non-trivial
for (const c of countries) {
  if (!c.capitals || c.capitals.length === 0) {
    errors.push(`${c.code} (${c.name}): has no capitals`);
  }
  if (!CONTINENTS.has(c.continent)) {
    errors.push(`${c.code} (${c.name}): invalid continent "${c.continent}"`);
  }
  const flagPath = path.join(ROOT, "public", c.flag.replace(/^\//, ""));
  if (!fs.existsSync(flagPath)) {
    errors.push(`${c.code} (${c.name}): flag file missing at ${c.flag}`);
  } else {
    const stat = fs.statSync(flagPath);
    const contents = fs.readFileSync(flagPath, "utf-8");
    if (stat.size < 100 || !contents.includes("<svg")) {
      errors.push(`${c.code} (${c.name}): flag file looks trivial/invalid (${stat.size} bytes)`);
    }
  }
}

// No duplicate names or aliases pointing at two different countries
const nameOwners = new Map<string, Set<string>>();
function registerName(name: string, code: string) {
  const key = name.trim().toLowerCase();
  if (!nameOwners.has(key)) nameOwners.set(key, new Set());
  nameOwners.get(key)!.add(code);
}
for (const c of countries) {
  registerName(c.name, c.code);
  for (const alias of c.aliases) registerName(alias, c.code);
}
for (const [name, owners] of nameOwners) {
  if (owners.size > 1) {
    errors.push(`Name/alias "${name}" is claimed by multiple countries: ${[...owners].join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} validation error(s)\n`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
} else {
  console.log(`OK: ${countries.length} countries validated, 0 errors.`);
}
