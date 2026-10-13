# World Passport — Capitals & Flags

A fast, offline quiz game for learning every UN member state's capital and flag. Multiple choice or type-in, by continent or the whole world. No backend, no accounts, no saved progress — every visit starts fresh.

## Stack

Vite + React + TypeScript (strict mode), plain CSS, Vitest for unit tests. No UI framework, no backend, no environment variables.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL (typically http://localhost:5173).

## Testing

```bash
npm run test          # run the game-logic unit tests once
npm run test:watch    # watch mode
```

Game logic (question generation, distractor selection, answer matching, round state) lives in `src/game/` as pure, framework-free functions with Vitest coverage in `src/game/*.test.ts`.

## Building

```bash
npm run build          # tsc -b && vite build -> dist/
npm run preview        # serve the production build locally
```

## Data pipeline (only needed if you regenerate the dataset)

`src/data/countries.json` and `public/flags/*.svg` are committed to the repo and used directly by the app — you do **not** need to run these scripts to build or run the app. They exist so the dataset can be regenerated or re-validated:

```bash
npm run generate-data   # rebuild src/data/countries.json from npm datasets
npm run copy-flags      # copy flag-icons SVGs into public/flags/
npm run validate-data   # check the dataset for the invariants the app relies on
```

See `NOTES.md` for the decisions made while building the dataset (continent conventions for transcontinental countries, capital disagreements and how they were resolved, alias choices, etc.).

Flags are the detailed 4x3 SVGs from the [`flag-icons`](https://github.com/lipis/flag-icons) package (MIT licensed), copied locally so the app works fully offline.

## Deploy (Vercel)

This is a static site with no backend and no environment variables.

1. Push this repository to GitHub.
2. In Vercel, "Add New... → Project" and import the GitHub repo.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. No environment variables needed. Deploy.
