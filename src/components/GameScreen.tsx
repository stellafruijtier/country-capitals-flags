import { useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "../data";
import { matchAnswer, type MatchResult } from "../game/answerMatching";
import { promptText } from "../game/prompts";
import { buildQuestion } from "../game/questionGenerator";
import {
  createRound,
  currentCountry,
  isRoundComplete,
  submitAnswer,
  type RoundState,
} from "../game/round";
import type { CountryEntry, GameSettings } from "../game/types";
import { FlagImage } from "./FlagImage";
import "./GameScreen.css";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { ProgressBar } from "./ProgressBar";
import { TypeInAnswer } from "./TypeInAnswer";

type Phase = "answering" | "feedback";

interface Props {
  settings: GameSettings;
  roundCountries: CountryEntry[];
  onFinish: (finalState: RoundState) => void;
}

export function GameScreen({ settings, roundCountries, onFinish }: Props) {
  const [roundState, setRoundState] = useState<RoundState>(() => createRound(roundCountries));
  const [phase, setPhase] = useState<Phase>("answering");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

  const country = currentCountry(roundState);

  const question = useMemo(() => {
    if (!country) return null;
    return buildQuestion(country, COUNTRIES, settings.category, settings.direction, settings.answerStyle);
  }, [country, settings.category, settings.direction, settings.answerStyle]);

  useEffect(() => {
    if (isRoundComplete(roundState)) onFinish(roundState);
  }, [roundState, onFinish]);

  function finishQuestion(correct: boolean, result: MatchResult | null = null) {
    setWasCorrect(correct);
    setMatchResult(result);
    setPhase("feedback");
  }

  function handleMCSelect(code: string) {
    if (phase !== "answering" || !question) return;
    setSelectedCode(code);
    finishQuestion(code === question.country.code);
  }

  function handleTypeInSubmit() {
    if (phase !== "answering" || !question || !typedValue.trim()) return;
    const target = settings.direction === "country-to-capital" ? "capital" : "country";
    const result = matchAnswer(typedValue, question.country.code, target, COUNTRIES);
    finishQuestion(result.correct, result);
  }

  function handleReveal() {
    if (phase !== "answering") return;
    finishQuestion(false);
  }

  function handleNext() {
    if (!question) return;
    setRoundState((prev) => submitAnswer(prev, wasCorrect));
    setPhase("answering");
    setSelectedCode(null);
    setTypedValue("");
    setMatchResult(null);
    setWasCorrect(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase === "feedback") {
        if (e.key === "Enter") {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      if (question?.answerStyle === "multiple-choice" && ["1", "2", "3", "4"].includes(e.key)) {
        const option = question.options[Number(e.key) - 1];
        if (option) handleMCSelect(option.code);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question, wasCorrect]);

  if (!question || !country) return null;

  const total = roundState.countries.length;
  const correctAnswerText =
    settings.direction === "country-to-capital"
      ? question.country.capitals.join(" / ")
      : question.country.name;

  const announcement =
    phase === "feedback" ? (wasCorrect ? "Correct" : `Incorrect, the answer is ${correctAnswerText}`) : "";

  return (
    <div className="game-screen">
      <ProgressBar current={roundState.currentIndex} total={total} streak={roundState.streak} />

      <div className="question-card">
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <p className="question-prompt">{promptText(settings.direction, question.country)}</p>

        {settings.direction === "flag-to-country" && (
          <FlagImage src={question.country.flag} alt="National flag" size="large" />
        )}

        {question.answerStyle === "multiple-choice" ? (
          <MultipleChoiceOptions
            options={question.options}
            direction={settings.direction}
            correctCode={phase === "feedback" ? question.country.code : null}
            selectedCode={selectedCode}
            disabled={phase === "feedback"}
            onSelect={handleMCSelect}
          />
        ) : (
          <>
            <TypeInAnswer
              direction={settings.direction}
              value={typedValue}
              onChange={setTypedValue}
              onSubmit={handleTypeInSubmit}
              disabled={phase === "feedback"}
              questionKey={question.country.code}
              status={phase === "feedback" ? (wasCorrect ? "correct" : "wrong") : null}
            />
            {phase === "answering" && (
              <div className="type-in-actions">
                <button type="button" className="text-button" onClick={handleReveal}>
                  Show answer
                </button>
                <button type="button" className="text-button" onClick={handleReveal}>
                  Skip
                </button>
              </div>
            )}
            {phase === "feedback" && (
              <div className="feedback-panel">
                {!wasCorrect && (
                  <p className="feedback-answer">
                    Correct answer: <strong>{correctAnswerText}</strong>
                  </p>
                )}
                {wasCorrect && matchResult?.matchedVia === "typo" && (
                  <p className="feedback-answer">
                    Accepted — correctly spelled: <strong>{correctAnswerText}</strong>
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {phase === "feedback" && (
          <button type="button" className="primary-button next-button" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
