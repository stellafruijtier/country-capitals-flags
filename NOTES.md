# Build Notes — World Passport (Capitals & Flags)

Built autonomously per the original spec. This file records the judgment calls made along the way, what was verified, and what's worth a manual double-check.

## UI refinement pass (unify design, replace stamp with color feedback)

A follow-up pass, scoped to UI only — `src/game/` (and its tests) were not touched.

**Unified the front page with the in-game screens.** The setup screen had its own navy "passport cover" look (gold text, circular emblem, fully-rounded pill buttons) that was visually a different app from the paper-toned question/results screens. Removed the `--cover-*` CSS variables entirely and the emblem SVG; the setup screen now sits on the same paper background (including the fine-line security pattern, previously only on the playing/results screens) and uses the same card treatment (`--card-bg`, `--paper-border`, `--radius`, `--shadow`) as the question card. The category/direction/answer-style/region/length choices now render with the exact same `.option-button` class and states (`selected`/`muted`/hover/focus) used by the in-game multiple-choice options, instead of a separate `.choice-pill` style — a thin `.choice-pill` modifier only adjusts layout (auto-width, wraps in a row) rather than visuals. The Start button is a `.primary-button`, the same class the in-game Next button uses.

**Removed the stamp animation; switched to color + icon feedback.** Deleted `StampOverlay.tsx`/`.css` (component, keyframes, and the "CORRECT"/"INCORRECT" text) entirely and its usage in `GameScreen`. Replaced it with:
- **Multiple choice (text):** the chosen option turns green (correct) or red (wrong, with the correct option also turning green); unanswered wrong options get a `muted` class (reduced opacity) so the eye goes to what matters. A check/cross icon renders inside the colored option, so the feedback isn't color-only.
- **Multiple choice (flags):** same green/red border + a soft tinted background on the button itself — the `<img>` has no filter/opacity/recolor applied to it directly, so the flag stays exactly as rendered. A small circular check/cross badge sits in a dedicated top padding strip above the flag image (padding was increased specifically so the badge never overlaps the image at narrow widths).
- **Type-in:** the input border/background turns green or red (`.type-in-input.correct`/`.wrong`) with a matching check/cross icon inside the field; the correct spelling is shown below in green text when wrong, and also shown (in green) when a typo was accepted.
- Added a visually-hidden `aria-live="polite"` status region in `GameScreen` that announces exactly "Correct" or "Incorrect, the answer is `<answer>`" — this is new; previously the stamp text was `aria-hidden` and there was no live-region announcement at all.
- Color transitions are a quick 0.15s fade (`border-color`/`background-color`/`color`), and the existing global `prefers-reduced-motion` rule in `index.css` (which zeroes all animation/transition durations) covers these automatically — no special-casing needed.
- The `--correct`/`--wrong` (and `-bg`) tokens were already defined with contrast in mind from the original build (≈5–8.6:1 text-on-background in both themes) and are reused as-is for the new input/icon states.
- Left the results screen's decorative circular seal and the "every stamp collected" flavor text alone — that's an unrelated passport-metaphor detail (collecting entry stamps when you visit a country), not the removed correct/incorrect component; renamed its CSS class from `results-stamp` to `result-emblem` purely to avoid the word being confusing in a future search.

## Data decisions

### Getting to exactly 193

Primary source: the `world-countries` npm package, filtered to `unMember === true`. That filter alone returns **194**, not 193 — it flags Vatican City (`VA`) as a UN member, which is wrong: the Holy See is a UN **observer state**, not a member. Excluding `VA` lands on exactly 193 UN member states, matching the spec.

### Capitals: cross-check result

Cross-checked every capital against a second source (`countries-list`). **Result: zero disagreements** between the two sources across all 193 countries — `scripts/generate-data.ts` logs this check and would print any mismatches if a future rerun found one (e.g. if a dataset is updated upstream).

### Multi-capital countries

Neither source dataset models more than one capital except South Africa. The spec explicitly calls out several more real-world dual/multi-capital countries, so I hand-added the second capital for each, with the primary listed first (the one more commonly taught as "the" capital):

- **South Africa**: Pretoria (administrative, primary) / Bloemfontein (judicial) / Cape Town (legislative) — from source data directly.
- **Bolivia**: Sucre (constitutional capital, primary) / La Paz (seat of government).
- **Eswatini**: Mbabane (administrative, primary) / Lobamba (royal and legislative).
- **Netherlands**: Amsterdam (constitutional capital, primary) / The Hague (seat of government).
- **Sri Lanka**: Colombo (primary — this is what's actually taught in most general-knowledge contexts and what players will type) / Sri Jayawardenepura Kotte (official administrative capital). **Worth double-checking**: if you want the *official* name primary instead, swap the order in `OVERRIDES.LK` in `scripts/generate-data.ts` and rerun `npm run generate-data`.
- **Malaysia**: Kuala Lumpur (primary) / Putrajaya (administrative/federal seat).

I deliberately did **not** add a second capital for Benin (Porto-Novo official / Cotonou seat of government), Tanzania (Dodoma official / Dar es Salaam former capital), or Ivory Coast (Yamoussoukro official / Abidjan largest city, de facto seat) — these are "largest city is not the official capital" situations rather than two cities both holding genuine constitutional/legal capital status like the six above. This is a judgment call; if you'd rather be generous and accept the de facto city too, they're easy to add to `OVERRIDES` in `scripts/generate-data.ts`.

### Continent assignment for transcontinental countries

`world-countries`' own `region`/`subregion` fields were used directly (Americas split into North vs. South America by subregion — Central America and Caribbean grouped into North America per the spec). For the 8 transcontinental countries the spec called out, the source data's own classification already matched the convention I'd have chosen, so no manual override was needed:

- Russia → Europe
- Türkiye (Turkey) → Asia
- Cyprus → Europe
- Georgia → Asia
- Armenia → Asia
- Azerbaijan → Asia
- Kazakhstan → Asia
- Egypt → Africa

### Display name vs. alias choices (judgment calls)

A few countries have more than one defensible "primary" name. I generally chose the current official/UN short name as primary and the older/more colloquial form as the alias (both are always accepted when typing):

- Czechia (primary) / Czech Republic (alias)
- Cabo Verde (primary) / Cape Verde (alias) — UN renamed this in 2013
- Türkiye (primary) / Turkey (alias) — UN registered this in 2022
- Eswatini (primary) / Swaziland (alias)
- Timor-Leste (primary) / East Timor (alias)
- North Macedonia (primary) / Macedonia (alias)
- "Democratic Republic of the Congo" (primary, spelled out in full per the spec's explicit instruction to keep the two Congos distinguishable) / DR Congo, DRC, Congo-Kinshasa, Zaire (aliases)
- "Republic of the Congo" (primary) / Congo-Brazzaville (alias) — bare "Congo" is deliberately **never** aliased to either, since it's ambiguous between the two.

Aliases were hand-authored (not auto-generated) specifically to avoid collisions — e.g. "Guinea" is never an alias pointing at Guinea-Bissau, "Niger" never points at Nigeria, "Dominica" never points at the Dominican Republic. Typo-tolerance has its own collision guard on top of this (see below), so both layers protect against those mix-ups.

### Flags

Used `flag-icons`' 4x3 SVGs (MIT licensed), copied verbatim into `public/flags/<code>.svg` via `scripts/copy-flags.ts` so the app works fully offline — no CDN dependency at runtime.

**How the detailed-flag spot-check was done**: I don't have a browser available in this environment, so I couldn't visually render the flags. Instead I checked file size and `<path>` element count for the flags called out in the spec (Spain, Mexico, Portugal, Brazil, Paraguay, Moldova, Ecuador, Dominican Republic, Saudi Arabia, Eritrea, Cyprus, Bhutan):

| Flag | Size | `<path>` elements |
|---|---|---|
| Spain | 81 KB | 542 |
| Mexico | 85 KB | 356 |
| Portugal | 8 KB | 29 |
| Brazil | 7 KB | 25 |
| Paraguay | 16 KB | 148 |
| Moldova | 11 KB | 54 |
| Ecuador | 29 KB | 118 |
| Dominican Republic | 40 KB | 85 |
| Saudi Arabia | 10 KB | 17 |
| Eritrea | 3 KB | 4 |
| Cyprus | 5 KB | 3 |
| Bhutan | 25 KB | 77 |

Spain and Mexico in particular have large, multi-hundred-path coats of arms — consistent with the detailed emblem versions, not a simplified set. Eritrea and Cyprus are legitimately simple flag designs (a few solid shapes), so their small size/path-count is expected, not a sign of truncation. **Please double-check visually once you run it locally** — open the setup screen, pick Flags, and glance through a round to confirm the emblems render crisply at the sizes used in the UI.

### Validator

`scripts/validate-data.ts` checks: exactly 193 entries, unique codes, every entry has ≥1 capital, every flag file exists and is non-trivial (>100 bytes, contains `<svg`), every continent is one of the six, and no name/alias string is claimed by two different countries. All checks pass (`npm run validate-data`).

## Full country list

<details>
<summary>All 193 countries by continent, with capitals and accepted aliases (click to expand)</summary>

### Africa (54)

| Country | Capital(s) | Code |
|---|---|---|
| Algeria | Algiers | DZ |
| Angola | Luanda | AO |
| Benin | Porto-Novo | BJ |
| Botswana | Gaborone | BW |
| Burkina Faso | Ouagadougou | BF |
| Burundi | Gitega | BI |
| Cabo Verde (Cape Verde) | Praia | CV |
| Cameroon | Yaoundé | CM |
| Central African Republic (CAR) | Bangui | CF |
| Chad | N'Djamena | TD |
| Comoros | Moroni | KM |
| Democratic Republic of the Congo (DR Congo, DRC, Congo-Kinshasa, Zaire) | Kinshasa | CD |
| Djibouti | Djibouti | DJ |
| Egypt | Cairo | EG |
| Equatorial Guinea | Malabo | GQ |
| Eritrea | Asmara | ER |
| Eswatini (Swaziland) | Mbabane / Lobamba | SZ |
| Ethiopia | Addis Ababa | ET |
| Gabon | Libreville | GA |
| Gambia (The Gambia) | Banjul | GM |
| Ghana | Accra | GH |
| Guinea | Conakry | GN |
| Guinea-Bissau | Bissau | GW |
| Ivory Coast (Côte d'Ivoire, Cote d'Ivoire) | Yamoussoukro | CI |
| Kenya | Nairobi | KE |
| Lesotho | Maseru | LS |
| Liberia | Monrovia | LR |
| Libya | Tripoli | LY |
| Madagascar | Antananarivo | MG |
| Malawi | Lilongwe | MW |
| Mali | Bamako | ML |
| Mauritania | Nouakchott | MR |
| Mauritius | Port Louis | MU |
| Morocco | Rabat | MA |
| Mozambique | Maputo | MZ |
| Namibia | Windhoek | NA |
| Niger | Niamey | NE |
| Nigeria | Abuja | NG |
| Republic of the Congo (Congo-Brazzaville) | Brazzaville | CG |
| Rwanda | Kigali | RW |
| São Tomé and Príncipe (Sao Tome and Principe) | São Tomé | ST |
| Senegal | Dakar | SN |
| Seychelles | Victoria | SC |
| Sierra Leone | Freetown | SL |
| Somalia | Mogadishu | SO |
| South Africa | Pretoria / Bloemfontein / Cape Town | ZA |
| South Sudan | Juba | SS |
| Sudan | Khartoum | SD |
| Tanzania (United Republic of Tanzania) | Dodoma | TZ |
| Togo | Lomé | TG |
| Tunisia | Tunis | TN |
| Uganda | Kampala | UG |
| Zambia | Lusaka | ZM |
| Zimbabwe | Harare | ZW |

### Asia (46)

| Country | Capital(s) | Code |
|---|---|---|
| Afghanistan | Kabul | AF |
| Armenia | Yerevan | AM |
| Azerbaijan | Baku | AZ |
| Bahrain | Manama | BH |
| Bangladesh | Dhaka | BD |
| Bhutan | Thimphu | BT |
| Brunei (Brunei Darussalam) | Bandar Seri Begawan | BN |
| Cambodia | Phnom Penh | KH |
| China (People's Republic of China, PRC) | Beijing | CN |
| Georgia | Tbilisi | GE |
| India (Bharat) | New Delhi | IN |
| Indonesia | Jakarta | ID |
| Iran (Islamic Republic of Iran) | Tehran | IR |
| Iraq | Baghdad | IQ |
| Israel | Jerusalem | IL |
| Japan | Tokyo | JP |
| Jordan | Amman | JO |
| Kazakhstan | Astana | KZ |
| Kuwait | Kuwait City | KW |
| Kyrgyzstan | Bishkek | KG |
| Laos (Lao PDR) | Vientiane | LA |
| Lebanon | Beirut | LB |
| Malaysia | Kuala Lumpur / Putrajaya | MY |
| Maldives | Malé | MV |
| Mongolia | Ulan Bator | MN |
| Myanmar (Burma) | Naypyidaw | MM |
| Nepal | Kathmandu | NP |
| North Korea (DPRK, Democratic People's Republic of Korea) | Pyongyang | KP |
| Oman | Muscat | OM |
| Pakistan | Islamabad | PK |
| Philippines | Manila | PH |
| Qatar | Doha | QA |
| Saudi Arabia | Riyadh | SA |
| Singapore | Singapore | SG |
| South Korea (Korea, Republic of Korea) | Seoul | KR |
| Sri Lanka (Ceylon) | Colombo / Sri Jayawardenepura Kotte | LK |
| Syria (Syrian Arab Republic) | Damascus | SY |
| Tajikistan | Dushanbe | TJ |
| Thailand (Siam) | Bangkok | TH |
| Timor-Leste (East Timor) | Dili | TL |
| Türkiye (Turkey) | Ankara | TR |
| Turkmenistan | Ashgabat | TM |
| United Arab Emirates (UAE) | Abu Dhabi | AE |
| Uzbekistan | Tashkent | UZ |
| Vietnam (Viet Nam) | Hanoi | VN |
| Yemen | Sana'a | YE |

### Europe (44)

| Country | Capital(s) | Code |
|---|---|---|
| Albania | Tirana | AL |
| Andorra | Andorra la Vella | AD |
| Austria | Vienna | AT |
| Belarus | Minsk | BY |
| Belgium | Brussels | BE |
| Bosnia and Herzegovina (Bosnia) | Sarajevo | BA |
| Bulgaria | Sofia | BG |
| Croatia | Zagreb | HR |
| Cyprus | Nicosia | CY |
| Czechia (Czech Republic) | Prague | CZ |
| Denmark | Copenhagen | DK |
| Estonia | Tallinn | EE |
| Finland | Helsinki | FI |
| France | Paris | FR |
| Germany | Berlin | DE |
| Greece (Hellenic Republic) | Athens | GR |
| Hungary | Budapest | HU |
| Iceland | Reykjavik | IS |
| Ireland (Republic of Ireland, Eire) | Dublin | IE |
| Italy | Rome | IT |
| Latvia | Riga | LV |
| Liechtenstein | Vaduz | LI |
| Lithuania | Vilnius | LT |
| Luxembourg | Luxembourg | LU |
| Malta | Valletta | MT |
| Moldova (Republic of Moldova) | Chișinău | MD |
| Monaco | Monaco | MC |
| Montenegro | Podgorica | ME |
| Netherlands (Holland) | Amsterdam / The Hague | NL |
| North Macedonia (Macedonia) | Skopje | MK |
| Norway | Oslo | NO |
| Poland | Warsaw | PL |
| Portugal | Lisbon | PT |
| Romania | Bucharest | RO |
| Russia (Russian Federation) | Moscow | RU |
| San Marino | City of San Marino | SM |
| Serbia | Belgrade | RS |
| Slovakia | Bratislava | SK |
| Slovenia | Ljubljana | SI |
| Spain | Madrid | ES |
| Sweden | Stockholm | SE |
| Switzerland (Swiss Confederation) | Bern | CH |
| Ukraine | Kyiv | UA |
| United Kingdom (UK, Britain, Great Britain) | London | GB |

### North America (23)

| Country | Capital(s) | Code |
|---|---|---|
| Antigua and Barbuda | Saint John's | AG |
| Bahamas (The Bahamas) | Nassau | BS |
| Barbados | Bridgetown | BB |
| Belize | Belmopan | BZ |
| Canada | Ottawa | CA |
| Costa Rica | San José | CR |
| Cuba | Havana | CU |
| Dominica | Roseau | DM |
| Dominican Republic | Santo Domingo | DO |
| El Salvador | San Salvador | SV |
| Grenada | St. George's | GD |
| Guatemala | Guatemala City | GT |
| Haiti | Port-au-Prince | HT |
| Honduras | Tegucigalpa | HN |
| Jamaica | Kingston | JM |
| Mexico | Mexico City | MX |
| Nicaragua | Managua | NI |
| Panama | Panama City | PA |
| Saint Kitts and Nevis (St Kitts and Nevis, St. Kitts and Nevis) | Basseterre | KN |
| Saint Lucia (St Lucia, St. Lucia) | Castries | LC |
| Saint Vincent and the Grenadines (St Vincent and the Grenadines, St. Vincent and the Grenadines) | Kingstown | VC |
| Trinidad and Tobago | Port of Spain | TT |
| United States (USA, US, United States of America, America) | Washington D.C. | US |

### South America (12)

| Country | Capital(s) | Code |
|---|---|---|
| Argentina | Buenos Aires | AR |
| Bolivia (Plurinational State of Bolivia) | Sucre / La Paz | BO |
| Brazil | Brasília | BR |
| Chile | Santiago | CL |
| Colombia | Bogotá | CO |
| Ecuador | Quito | EC |
| Guyana | Georgetown | GY |
| Paraguay | Asunción | PY |
| Peru | Lima | PE |
| Suriname | Paramaribo | SR |
| Uruguay | Montevideo | UY |
| Venezuela | Caracas | VE |

### Oceania (14)

| Country | Capital(s) | Code |
|---|---|---|
| Australia | Canberra | AU |
| Fiji | Suva | FJ |
| Kiribati | South Tarawa | KI |
| Marshall Islands | Majuro | MH |
| Micronesia (Federated States of Micronesia) | Palikir | FM |
| Nauru | Yaren | NR |
| New Zealand | Wellington | NZ |
| Palau | Ngerulmud | PW |
| Papua New Guinea (PNG) | Port Moresby | PG |
| Samoa (Western Samoa) | Apia | WS |
| Solomon Islands | Honiara | SB |
| Tonga | Nuku'alofa | TO |
| Tuvalu | Funafuti | TV |
| Vanuatu | Port Vila | VU |

</details>

## Game logic design notes

- **Answer matching** (`src/game/answerMatching.ts`): normalizes (NFD-strip accents, lowercase, strip punctuation, collapse whitespace), checks exact match first, then Levenshtein distance within a length-based budget (0 for <5 letters, 1 for 5–9, 2 for 10+). The look-alike guard is generic, not hardcoded to specific country pairs: a typo is only accepted if it's within tolerance of exactly one country's answer set across the *entire* dataset. This is what keeps "Niger" from accepting a near-miss of "Nigeria," etc. — tested explicitly for the three pairs named in the spec plus a couple of general typo/alias cases.
- **Distractors** (`src/game/distractors.ts`): prefers same-continent wrong options, with a small hand-curated flag-lookalike table (Chad/Romania, Indonesia/Monaco, Ireland/Ivory Coast, plus a few more real lookalikes: Australia/New Zealand, Netherlands/Luxembourg, Venezuela/Ecuador/Colombia, Senegal/Mali) used only for the Flags category. Falls back to the wider pool if a continent/pool is too small — this is pool-size-aware, not hardcoded to specific continents.
- **Rounds** (`src/game/round.ts`): a round's country sequence is a single shuffled slice of the filtered pool, so "no repeats" is true by construction, not by a runtime check.
- All of the above are pure, dependency-injectable (an `rng` parameter) functions, unit-tested with a seeded PRNG for determinism — see `src/game/*.test.ts`.

## What I verified

- ✅ `npm run validate-data` — 193 countries, 0 errors.
- ✅ `npm run test` — 26 tests pass (answer matching incl. the three named look-alike pairs, accents/case, multi-capital, aliases, typo tolerance accept/reject, distractor uniqueness/continent preference, round no-repeats/continent-filter/all-length, round state scoring).
- ✅ `npx tsc -b` — strict mode, zero errors.
- ✅ `npm run build` — succeeds, including from a **fresh clone simulation** (deleted `node_modules` and `dist`, ran `npm install` then `npm run build` with nothing else).
- ✅ `npm run dev` — started the dev server and confirmed the HTML, all component/game TypeScript modules, the favicon, and sample flag SVGs all serve/transform without error (200s, no compile errors in the Vite log).
- ✅ `npx oxlint` — clean.
- ✅ `git init` run; confirmed via `git status` and a dry-run `git add -n -A` that `node_modules/` and `dist/` are excluded while `src/data/countries.json` and `public/flags/*.svg` are included.

**UI refinement pass, additionally verified:**
- ✅ `src/game/` confirmed untouched (file mtimes predate this pass; `npm run test` — same 26 tests, unchanged, all pass).
- ✅ `npx tsc -b`, `npx oxlint`, `npm run build` all clean after the UI changes.
- ✅ `npm run dev` — confirmed every touched component file (`SetupScreen`, `GameScreen`, `ResultsScreen`, `MultipleChoiceOptions`, `TypeInAnswer`, the new `icons.tsx`) transforms without error.
- ✅ Grepped the whole codebase for "stamp" and the old `--cover-*` tokens — only the unrelated "every stamp collected" flavor text remains (see above); no leftover component, CSS, keyframes, or token references.

## What I could NOT verify — please double-check by hand

- **No browser available in this environment, still true for this pass.** I could not visually confirm: the unified paper look on the setup screen, the green/red option and input states in both light and dark mode, that the flag-option check/cross badge never overlaps the flag image on a narrow phone width (I sized its padding generously to avoid this, but haven't seen it rendered), and that the mobile keyboard doesn't cover the type-in field now that it has an inline status icon. Please run `npm run dev` and look at: the setup screen (should now look like the same app as the question screens, no navy/gold anywhere), a multiple-choice round in both Capitals and Flags (check the green/red/muted states and icons), a type-in round including at least one intentional typo and one deliberately wrong answer, and the whole flow once in dark mode (OS-level dark mode) and once on a narrow phone-width viewport.
- **Capital spelling edge cases**: a few capitals have accents or multi-word forms (Mexico City, São Tomé, N'Djamena, Chișinău) — the typed-answer matching normalizes accents/punctuation so e.g. "sao tome" or "n djamena" should be accepted, but it's worth typing a couple yourself to confirm the feel is right.
- **Alias completeness**: I covered the aliases named in the spec plus the common short forms I judged most likely to come up (USA/UK/UAE, "Korea" for South Korea, etc.) — but alias lists are inherently a matter of taste. If players hit a name you think should be accepted and isn't, add it to the relevant entry in `OVERRIDES` in `scripts/generate-data.ts` and rerun `npm run generate-data` (note: rerunning regenerates the whole file from the npm sources + overrides, so don't hand-edit `src/data/countries.json` directly or your edit will be lost on the next regeneration).
- **Git**: repo initialized, nothing committed or pushed, per instructions.
