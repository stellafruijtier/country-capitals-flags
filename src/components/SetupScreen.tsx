import type { GameSettings, Region, RoundLength } from "../game/types";
import "./SetupScreen.css";

const CONTINENTS: Region[] = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
];

const REGIONS: Region[] = ["World", ...CONTINENTS];
const LENGTHS: RoundLength[] = [10, 20, "all"];

interface Props {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
}

export function SetupScreen({ settings, onChange, onStart }: Props) {
  function setCategory(category: GameSettings["category"]) {
    const direction = category === "capitals" ? "country-to-capital" : "flag-to-country";
    onChange({ ...settings, category, direction });
  }

  function setDirection(direction: GameSettings["direction"]) {
    const answerStyle = direction === "country-to-flag" ? "multiple-choice" : settings.answerStyle;
    onChange({ ...settings, direction, answerStyle });
  }

  function setAnswerStyle(answerStyle: GameSettings["answerStyle"]) {
    onChange({ ...settings, answerStyle });
  }

  const typeInDisabled = settings.direction === "country-to-flag";

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <h1 className="setup-title">World Passport</h1>
        <p className="setup-subtitle">Learn every capital and flag on Earth</p>
      </header>

      <div className="setup-card">
        <fieldset className="field-group">
          <legend>Category</legend>
          <div className="pill-row">
            <ChoicePill
              label="Capitals"
              selected={settings.category === "capitals"}
              onSelect={() => setCategory("capitals")}
            />
            <ChoicePill
              label="Flags"
              selected={settings.category === "flags"}
              onSelect={() => setCategory("flags")}
            />
          </div>
        </fieldset>

        <fieldset className="field-group">
          <legend>Direction</legend>
          <div className="pill-row">
            {settings.category === "capitals" ? (
              <>
                <ChoicePill
                  label="Country → Capital"
                  selected={settings.direction === "country-to-capital"}
                  onSelect={() => setDirection("country-to-capital")}
                />
                <ChoicePill
                  label="Capital → Country"
                  selected={settings.direction === "capital-to-country"}
                  onSelect={() => setDirection("capital-to-country")}
                />
              </>
            ) : (
              <>
                <ChoicePill
                  label="Flag → Country"
                  selected={settings.direction === "flag-to-country"}
                  onSelect={() => setDirection("flag-to-country")}
                />
                <ChoicePill
                  label="Country → Flag"
                  selected={settings.direction === "country-to-flag"}
                  onSelect={() => setDirection("country-to-flag")}
                />
              </>
            )}
          </div>
        </fieldset>

        <fieldset className="field-group">
          <legend>Answer style</legend>
          <div className="pill-row">
            <ChoicePill
              label="Multiple choice"
              selected={settings.answerStyle === "multiple-choice"}
              onSelect={() => setAnswerStyle("multiple-choice")}
            />
            <ChoicePill
              label="Type-in"
              selected={settings.answerStyle === "type-in"}
              onSelect={() => setAnswerStyle("type-in")}
              disabled={typeInDisabled}
            />
          </div>
          {typeInDisabled && (
            <p className="field-note">Type-in is disabled here — you can't type a flag.</p>
          )}
        </fieldset>

        <fieldset className="field-group">
          <legend>Region</legend>
          <div className="pill-row pill-row--wrap">
            {REGIONS.map((region) => (
              <ChoicePill
                key={region}
                label={region}
                selected={settings.region === region}
                onSelect={() => onChange({ ...settings, region })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="field-group">
          <legend>Round length</legend>
          <div className="pill-row">
            {LENGTHS.map((length) => (
              <ChoicePill
                key={String(length)}
                label={length === "all" ? "All" : String(length)}
                selected={settings.length === length}
                onSelect={() => onChange({ ...settings, length })}
              />
            ))}
          </div>
        </fieldset>

        <button type="button" className="primary-button start-button" onClick={onStart}>
          Start
        </button>
      </div>
    </div>
  );
}

function ChoicePill({
  label,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const stateClass = disabled ? "muted" : selected ? "selected" : "";
  return (
    <button
      type="button"
      className={`option-button choice-pill ${stateClass}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
