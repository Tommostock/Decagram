"use client";

import { LetterTile } from "@/components/ui/LetterTile";
import { WORD_LENGTH } from "@/lib/constants";

interface WordDisplayProps {
  word: string;
  revealedPositions: number[];
  isRevealing: boolean;
}

export function WordDisplay({
  word,
  revealedPositions,
  isRevealing,
}: WordDisplayProps) {
  const revealedSet = new Set(revealedPositions);

  return (
    <div className="flex justify-center gap-1 sm:gap-1.5">
      {Array.from({ length: WORD_LENGTH }).map((_, i) => {
        const isRevealed = revealedSet.has(i);
        const letter = isRevealed ? word[i] : undefined;

        return (
          <LetterTile
            key={i}
            letter={letter}
            status={isRevealed ? "revealed" : "empty"}
            delay={i * 150}
            isRevealing={isRevealing && isRevealed}
          />
        );
      })}
    </div>
  );
}
