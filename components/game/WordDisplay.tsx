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
        const correctGuessLetter = correctGuessMap.get(i);
        const isNewlyCorrect = newCorrectPositions.has(i);

        // Priority: initially revealed > correctly guessed > reveal-all > empty
        const isNewlyRevealed = revealAll && !isInitialReveal && !correctGuessLetter;
        const letter = isInitialReveal
          ? word[i]
          : correctGuessLetter ?? (revealAll ? word[i] : undefined);

        const status: "revealed" | "correct" | "empty" = isInitialReveal
          ? "revealed"
          : correctGuessLetter
            ? "correct"
            : isNewlyRevealed
              ? "revealed"
              : "empty";

        // Animate: initial reveal, reveal-answer, or newly correct from a guess
        const shouldAnimate =
          (isRevealing && isInitialReveal) ||
          (isNewlyRevealed && isRevealingAnswer) ||
          (isNewlyCorrect && isRevealingNewCorrect);

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
