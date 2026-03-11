"use client";

import type { LetterStatus } from "@/types";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyboardStatus: Record<string, LetterStatus>;
  revealedLetters?: string[];
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

const statusColors: Record<string, string> = {
  correct: "#22c55e",
  present: "#eab308",
  absent: "#2a2a2a",
};

export function Keyboard({
  onKeyPress,
  onEnter,
  onBackspace,
  keyboardStatus,
  revealedLetters = [],
}: KeyboardProps) {
  const handleClick = (key: string) => {
    if (key === "ENTER") onEnter();
    else if (key === "DEL") onBackspace();
    else onKeyPress(key);
  };

  return (
    <div className="w-full sm:max-w-lg sm:mx-auto space-y-[3px] sm:space-y-1.5">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-[3px] sm:justify-center sm:gap-1">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "DEL";
            const status = keyboardStatus[key];
            const isRevealed = revealedLetters.includes(key);
            const isAbsent = status === "absent";

            let bgColor: string;
            let opacity: number;
            let borderColor: string;

            // Revealed letters (initially selected) take priority — they're confirmed in the word
            if (isRevealed || status === "correct") {
              bgColor = statusColors.correct;
              opacity = 1;
              borderColor = "#22c55e";
            } else if (status === "present") {
              bgColor = statusColors.present;
              opacity = 1;
              borderColor = "#eab308";
            } else if (isAbsent) {
              // Guessed letter confirmed not in word - dark grey
              bgColor = "rgba(50, 50, 50, 0.8)";
              opacity = 0.5;
              borderColor = "rgba(255,255,255,0.05)";
            } else {
              bgColor = "rgba(50, 50, 50, 0.8)";
              opacity = 1;
              borderColor = "rgba(255,255,255,0.1)";
            }

            const isActive = isRevealed || status === "correct" || status === "present";
            const isInteractive = !isAbsent;

            return (
              <div key={key} className={`relative ${isSpecial ? "flex-[1.5] sm:flex-none" : "flex-1 sm:flex-none"}`}>
                <button
                  onClick={() => handleClick(key)}
                  className={`glass-button w-full
                    ${isSpecial ? "sm:w-auto sm:px-4 text-[11px] sm:text-xs" : "sm:w-[36px] text-[16px] sm:text-base"}
                    h-[44px] sm:h-[52px] rounded-md font-semibold transition-all duration-100 select-none relative
                    ${isActive ? "active" : ""}
                    ${isInteractive ? "hover:scale-110 hover:brightness-110 active:scale-90 active:brightness-75" : ""}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    opacity: opacity,
                    color:
                      isRevealed || status === "correct" || status === "present"
                        ? "#fff"
                        : status === "absent"
                          ? "#888"
                          : "#d0d0d0",
                    border: `${isRevealed || status ? "2px" : "1px"} solid ${borderColor}`,
                    backdropFilter: "blur(12px)",
                    boxShadow: isRevealed
                      ? `inset 0 0 8px ${statusColors.correct}`
                      : status
                        ? `inset 0 0 8px ${statusColors[status]}`
                        : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {key === "DEL" ? "\u232B" : key}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
