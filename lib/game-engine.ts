import type { GameState, Guess, LetterResult, LetterStatus } from "@/types";
import { MAX_GUESSES } from "./constants";

export function createInitialState(dailyWord: string, dateKey: string): GameState {
  return {
    phase: "LETTER_SELECTION",
    dailyWord,
    dateKey,
    selectedConsonants: [],
    selectedVowel: "",
    revealedPositions: [],
    guesses: [],
    currentInput: "",
    keyboardStatus: {},
    maxGuesses: MAX_GUESSES,
  };
}

export function calculateRevealedPositions(
  word: string,
  consonants: string[],
  vowel: string
): number[] {
  const selected = new Set(
    [...consonants, vowel].map((l) => l.toUpperCase())
  );
  const positions: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (selected.has(word[i].toUpperCase())) {
      positions.push(i);
    }
  }
  return positions;
}

export function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const results: LetterResult[] = g.map((letter) => ({
    letter,
    status: "absent" as LetterStatus,
  }));
  const answerUsed = new Array(a.length).fill(false);

  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      results[i].status = "correct";
      answerUsed[i] = true;
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (results[i].status === "correct") continue;
    for (let j = 0; j < a.length; j++) {
      if (!answerUsed[j] && g[i] === a[j]) {
        results[i].status = "present";
        answerUsed[j] = true;
        break;
      }
    }
  }

  return results;
}

export function updateKeyboardStatus(
  current: Record<string, LetterStatus>,
  guessResults: LetterResult[]
): Record<string, LetterStatus> {
  const updated = { ...current };
  const priority: Record<LetterStatus, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    unknown: 0,
  };

  for (const { letter, status } of guessResults) {
    const existing = updated[letter] || "unknown";
    if (priority[status] > priority[existing]) {
      updated[letter] = status;
    }
  }

  return updated;
}

export function makeGuess(
  state: GameState,
  word: string
): { guess: Guess; newPhase: GameState["phase"] } {
  const results = evaluateGuess(word, state.dailyWord);
  const guess: Guess = { word: word.toUpperCase(), results };
  const isCorrect = results.every((r) => r.status === "correct");
  const guessCount = state.guesses.length + 1;

  let newPhase: GameState["phase"] = "GUESSING";
  if (isCorrect) newPhase = "WIN";
  else if (guessCount >= state.maxGuesses) newPhase = "LOSE";

  return { guess, newPhase };
}
