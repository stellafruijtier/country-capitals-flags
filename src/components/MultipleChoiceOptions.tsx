import { optionLabel } from "../game/prompts";
import type { CountryEntry, Direction } from "../game/types";
import { FlagImage } from "./FlagImage";
import { CheckIcon, CrossIcon } from "./icons";
import "./MultipleChoiceOptions.css";

interface Props {
  options: CountryEntry[];
  direction: Direction;
  correctCode: string | null;
  selectedCode: string | null;
  disabled: boolean;
  onSelect: (code: string) => void;
}

type OptionState = "" | "selected" | "correct" | "wrong" | "muted";

export function MultipleChoiceOptions({
  options,
  direction,
  correctCode,
  selectedCode,
  disabled,
  onSelect,
}: Props) {
  const showFlags = direction === "country-to-flag";
  const answered = disabled && correctCode !== null;

  function stateFor(code: string): OptionState {
    if (!answered) return selectedCode === code ? "selected" : "";
    if (code === correctCode) return "correct";
    if (code === selectedCode) return "wrong";
    return "muted";
  }

  return (
    <div className={`options-grid ${showFlags ? "options-grid--flags" : "options-grid--text"}`}>
      {options.map((option, index) => {
        const state = stateFor(option.code);
        return (
          <button
            key={option.code}
            type="button"
            className={`option-button ${state}`}
            disabled={disabled}
            onClick={() => onSelect(option.code)}
            aria-label={showFlags ? `Option ${index + 1}` : undefined}
          >
            <span className="option-key" aria-hidden="true">
              {index + 1}
            </span>
            {showFlags ? (
              <FlagImage src={option.flag} alt="" size="medium" />
            ) : (
              <span className="option-label">{optionLabel(direction, option)}</span>
            )}
            {state === "correct" && <CheckIcon className="option-status-icon" />}
            {state === "wrong" && <CrossIcon className="option-status-icon" />}
          </button>
        );
      })}
    </div>
  );
}
