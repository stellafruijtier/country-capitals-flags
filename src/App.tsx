import { useState } from "react";
import "./App.css";
import { GameScreen } from "./components/GameScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { SetupScreen } from "./components/SetupScreen";
import { COUNTRIES } from "./data";
import { buildRoundCountries, type RoundState } from "./game/round";
import type { CountryEntry, GameSettings } from "./game/types";

type Screen = "setup" | "playing" | "results";

const DEFAULT_SETTINGS: GameSettings = {
  category: "capitals",
  direction: "country-to-capital",
  answerStyle: "multiple-choice",
  region: "World",
  length: 10,
};

function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roundCountries, setRoundCountries] = useState<CountryEntry[]>([]);
  const [lastResult, setLastResult] = useState<RoundState | null>(null);

  function startRound(countries: CountryEntry[]) {
    setRoundCountries(countries);
    setScreen("playing");
  }

  function handleStart() {
    startRound(buildRoundCountries(COUNTRIES, settings.region, settings.length));
  }

  function handleFinish(finalState: RoundState) {
    setLastResult(finalState);
    setScreen("results");
  }

  function handleReplayMisses() {
    if (!lastResult) return;
    startRound(lastResult.misses);
  }

  function handleNewRound() {
    setScreen("setup");
  }

  return (
    <main className={`app app--${screen}`}>
      {screen === "setup" && (
        <SetupScreen settings={settings} onChange={setSettings} onStart={handleStart} />
      )}
      {screen === "playing" && (
        <GameScreen settings={settings} roundCountries={roundCountries} onFinish={handleFinish} />
      )}
      {screen === "results" && lastResult && (
        <ResultsScreen
          score={lastResult.score}
          total={lastResult.countries.length}
          misses={lastResult.misses}
          onReplayMisses={handleReplayMisses}
          onNewRound={handleNewRound}
        />
      )}
    </main>
  );
}

export default App;
