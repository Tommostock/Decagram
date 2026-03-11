"use client";

import { WORD_LENGTH } from "@/lib/constants";

interface GuessInputProps {
  currentInput: string;
  shaking: boolean;
  onLetterClick?: (position: number) => void;
  selectedPosition?: number;
}

export function GuessInput({ currentInput, shaking, onLetterClick, selectedPosition }: GuessInputProps) {
  return (
    <div
      className={`flex justify-center gap-1 sm:gap-1.5 ${
        shaking ? "animate-[shake_0.5s_ease-in-out]" : ""
      }`}
    >
      {Array.from({ length: WORD_LENGTH }).map((_, i) => {
        const letter = currentInput[i];
        const isCursor = i === currentInput.length;
        const isSelected = i === selectedPosition;

        return (
          <div
            key={i}
            onClick={() => {
              if (letter && onLetterClick) {
                onLetterClick(i);
              }
            }}
            className={`w-[30px] h-[38px] sm:w-[34px] sm:h-[42px] flex items-center justify-center rounded-lg border-2 text-sm font-bold transition-all duration-100 select-none ${
              letter ? "cursor-pointer hover:opacity-75" : ""
            }`}
            style={{
              backgroundColor: letter ? (isSelected ? "rgba(60, 60, 60, 1)" : "rgba(40, 40, 40, 0.8)") : "transparent",
              borderColor: isSelected
                ? "#f5c842"
                : isCursor
                  ? "#f5c842"
                  : letter
                    ? "rgba(255,255,255,0.15)"
                    : "#2a2a2a",
              color: "#e8e8e8",
              boxShadow: isSelected || isCursor ? "0 0 8px rgba(245, 200, 66, 0.2)" : "none",
            }}
          >
            {letter?.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}
