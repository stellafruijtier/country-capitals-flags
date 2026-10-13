// Copies the 4x3 detailed SVG flags from flag-icons into public/flags/
// so the app works fully offline and at build time with no CDN dependency.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const countries = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/countries.json"), "utf-8"),
) as { code: string }[];

const srcDir = path.join(ROOT, "node_modules/flag-icons/flags/4x3");
const destDir = path.join(ROOT, "public/flags");
fs.mkdirSync(destDir, { recursive: true });

let copied = 0;
for (const { code } of countries) {
  const lower = code.toLowerCase();
  const src = path.join(srcDir, `${lower}.svg`);
  const dest = path.join(destDir, `${lower}.svg`);
  fs.copyFileSync(src, dest);
  copied++;
}

console.log(`Copied ${copied} flag SVGs to public/flags/`);
