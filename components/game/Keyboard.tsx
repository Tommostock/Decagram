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
  present: "#cc8d00",
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
    <div className="w-full mx-auto space-y-2 px-1">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1.5 justify-center">
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
              borderColor = "#cc8d00";
            } else if (isAbsent) {
              // Guessed letter confirmed not in word - dark grey
              bgColor = "var(--bg-key)";
              opacity = 0.5;
              borderColor = "var(--border-glass)";
            } else {
              bgColor = "var(--bg-key)";
              opacity = 1;
              borderColor = "var(--border-light)";
            }

            const isActive = isRevealed || status === "correct" || status === "present";
            const isInteractive = !isAbsent;

            return (
              <div key={key} className={`relative ${isSpecial ? "flex-[1.4]" : "flex-1"}`}>
                <button
                  onClick={() => handleClick(key)}
                  className={`glass-button w-full h-12 text-sm rounded-lg font-semibold transition-all duration-100 select-none relative
                    ${isActive ? "active" : ""}
                    ${isInteractive ? "hover:scale-105 hover:brightness-110 active:scale-95 active:brightness-75" : ""}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    opacity: opacity,
                    color:
                      isRevealed || status === "correct" || status === "present"
                        ? "#fff"
                        : status === "absent"
                          ? "var(--text-dim)"
                          : "var(--text-key)",
                    border: `${isRevealed || status ? "2px" : "1px"} solid ${borderColor}`,
                    backdropFilter: "blur(12px)",
                    boxShadow: isRevealed
                      ? `inset 0 0 8px ${statusColors.correct}`
                      : status === "present"
                        ? `0 0 12px rgba(204, 141, 0, 0.6)`
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
