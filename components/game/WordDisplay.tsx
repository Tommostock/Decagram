"use client";

import { LetterTile } from "@/components/ui/LetterTile";
import { WORD_LENGTH } from "@/lib/constants";
import type { Guess } from "@/types";

interface WordDisplayProps {
  word: string;
  revealedPositions: number[];
  isRevealing: boolean;
  guesses?: Guess[];
}

export function WordDisplay({
  word,
  revealedPositions,
  isRevealing,
  guesses = [],
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

        // Priority: initially revealed > correctly guessed > empty
        const letter = isInitialReveal
          ? word[i]
          : correctGuessLetter ?? undefined;

        const status: "revealed" | "correct" | "empty" = isInitialReveal
          ? "revealed"
          : correctGuessLetter
            ? "correct"
            : "empty";

        return (
          <LetterTile
            key={i}
            letter={letter}
            status={status}
            delay={i * 150}
            isRevealing={isRevealing && isInitialReveal}
          />
        );
      })}
    </div>
  );
}
