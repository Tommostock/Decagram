"use client";

import { LetterTile } from "@/components/ui/LetterTile";
import { WORD_LENGTH } from "@/lib/constants";
import type { Guess } from "@/types";

interface WordDisplayProps {
  word: string;
  revealedPositions: number[];
  isRevealing: boolean;
  guesses?: Guess[];
  revealAll?: boolean;
  isRevealingAnswer?: boolean;
  isRevealingNewCorrect?: boolean;
  newCorrectPositions?: Set<number>;
  pendingCorrectPositions?: Set<number>;
  colorBlind?: boolean;
}

export function WordDisplay({
  word,
  revealedPositions,
  isRevealing,
  guesses = [],
  revealAll = false,
  isRevealingAnswer = false,
  isRevealingNewCorrect = false,
  newCorrectPositions = new Set(),
  pendingCorrectPositions = new Set(),
  colorBlind = false,
}: WordDisplayProps) {
  const revealedSet = new Set(revealedPositions);

  // Build a map of position → letter for correctly guessed positions
  const correctGuessMap = new Map<number, string>();
  for (const guess of guesses) {
    guess.results.forEach((result, idx) => {
      if (result.status === "correct") {
        correctGuessMap.set(idx, result.letter);
      }
    });
  }

  return (
    <div className="flex justify-center gap-1 sm:gap-1.5">
      {Array.from({ length: WORD_LENGTH }).map((_, i) => {
        const isInitialReveal = revealedSet.has(i);
        const isPending = pendingCorrectPositions.has(i);
        const isBeingRevealedNow = isRevealingNewCorrect && newCorrectPositions.has(i);

        // Suppress correctly guessed letters that are still pending their word-display
        // animation — treat them as empty until the flip fires
        const correctGuessLetter = (!isPending && !isBeingRevealedNow)
          ? correctGuessMap.get(i)
          : undefined;

        const isNewlyRevealed = revealAll && !isInitialReveal && !correctGuessMap.get(i);

        // For positions being revealed now: pull letter directly from word
        const letter = isInitialReveal
          ? word[i]
          : isBeingRevealedNow
            ? word[i]
            : correctGuessLetter ?? (revealAll ? word[i] : undefined);

        const status: "revealed" | "correct" | "empty" = isInitialReveal
          ? "revealed"
          : (correctGuessLetter || isBeingRevealedNow)
            ? "correct"
            : isNewlyRevealed
              ? "revealed"
              : "empty";

        const shouldAnimate =
          (isRevealing && isInitialReveal) ||
          (isNewlyRevealed && isRevealingAnswer) ||
          isBeingRevealedNow;

        return (
          <LetterTile
            key={i}
            letter={letter}
            status={status}
            delay={i * 150}
            isRevealing={shouldAnimate}
            colorBlind={colorBlind}
          />
        );
      })}
    </div>
  );
}
