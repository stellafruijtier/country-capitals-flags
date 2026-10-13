import { useEffect, useRef } from "react";
import { typeInLabel } from "../game/prompts";
import type { Direction } from "../game/types";
import { CheckIcon, CrossIcon } from "./icons";
import "./TypeInAnswer.css";

interface Props {
  direction: Direction;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  questionKey: string;
  status: "correct" | "wrong" | null;
}

export function TypeInAnswer({
  direction,
  value,
  onChange,
  onSubmit,
  disabled,
  questionKey,
  status,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [questionKey, disabled]);

  const label = typeInLabel(direction);

  return (
    <form
      className="type-in-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <label htmlFor="answer-input" className="type-in-label">
        {label}
      </label>
      <div className="type-in-field">
        <input
          id="answer-input"
          ref={inputRef}
          type="text"
          className={`type-in-input ${status ?? ""}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Type the ${label.toLowerCase()}…`}
        />
        {status === "correct" && <CheckIcon className="type-in-status-icon correct" />}
        {status === "wrong" && <CrossIcon className="type-in-status-icon wrong" />}
      </div>
    </form>
  );
}
