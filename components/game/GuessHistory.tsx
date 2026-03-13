"use client";

import { LetterTile } from "@/components/ui/LetterTile";
import type { Guess } from "@/types";

interface GuessHistoryProps {
  guesses: Guess[];
  revealingIndex: number | null;
  colorBlind?: boolean;
}

export function GuessHistory({ guesses, revealingIndex, colorBlind = false }: GuessHistoryProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="space-y-2">
      {guesses.map((guess, guessIdx) => (
        <div
          key={guessIdx}
          className="flex justify-center gap-1 sm:gap-1.5 animate-slideUp"
          style={{ animationDelay: `${guessIdx * 100}ms` }}
        >
          {guess.results.map((result, letterIdx) => (
            <LetterTile
              key={letterIdx}
              letter={result.letter}
              status={revealingIndex === guessIdx ? "unknown" : result.status}
              delay={letterIdx * 100}
              isRevealing={revealingIndex === guessIdx}
              size="sm"
              colorBlind={colorBlind}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
