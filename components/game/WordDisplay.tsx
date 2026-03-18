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

  // Build a map of position → letter for correctly guessed positions,
  // excluding positions currently being animated
  const correctGuessMap = new Map<number, string>();
  for (const guess of guesses) {
    guess.results.forEach((result, idx) => {
      if (result.status === "correct") {
        // During animation, skip positions being revealed (they animate from empty)
        if (isRevealingNewCorrect && newCorrectPositions.has(idx)) return;
        correctGuessMap.set(idx, result.letter);
      }
    });
  }

  return (
    <div className="flex justify-center gap-1 sm:gap-1.5">
      {Array.from({ length: WORD_LENGTH }).map((_, i) => {
        const isInitialReveal = revealedSet.has(i);
        const isBeingRevealedNow = isRevealingNewCorrect && newCorrectPositions.has(i);
        const correctGuessLetter = correctGuessMap.get(i);

        const isNewlyRevealed = revealAll && !isInitialReveal && !correctGuessMap.get(i) && !isBeingRevealedNow;

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

        // Newly correct positions use guess-row timing (i * 100ms) to sync;
        // initial reveal and reveal-answer use word-display timing (i * 150ms)
        const delay = isBeingRevealedNow ? i * 100 : i * 150;

        return (
          <LetterTile
            key={i}
            letter={letter}
            status={status}
            delay={delay}
            isRevealing={shouldAnimate}
            hideLetterBeforeFlip
            colorBlind={colorBlind}
          />
        );
      })}
    </div>
  );
}
