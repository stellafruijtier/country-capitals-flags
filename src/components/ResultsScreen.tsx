import type { CountryEntry } from "../game/types";
import { FlagImage } from "./FlagImage";
import "./ResultsScreen.css";

interface Props {
  score: number;
  total: number;
  misses: CountryEntry[];
  onReplayMisses: () => void;
  onNewRound: () => void;
}

export function ResultsScreen({ score, total, misses, onReplayMisses, onNewRound }: Props) {
  return (
    <div className="results-screen">
      <div className="result-emblem" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="38" />
        </svg>
      </div>
      <h1 className="results-score">
        {score} / {total}
      </h1>
      <p className="results-subtitle">
        {misses.length === 0
          ? "A clean passport — every stamp collected."
          : `${misses.length} ${misses.length === 1 ? "country" : "countries"} to review`}
      </p>

      {misses.length > 0 && (
        <ul className="misses-list">
          {misses.map((country) => (
            <li key={country.code} className="miss-item">
              <FlagImage src={country.flag} alt="" size="medium" />
              <div className="miss-text">
                <span className="miss-name">{country.name}</span>
                <span className="miss-capital">{country.capitals.join(" / ")}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="results-actions">
        {misses.length > 0 && (
          <button type="button" className="primary-button" onClick={onReplayMisses}>
            Replay my misses
          </button>
        )}
        <button type="button" className="secondary-button" onClick={onNewRound}>
          New round
        </button>
      </div>
    </div>
  );
}
