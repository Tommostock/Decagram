"use client";

import type { LetterStatus } from "@/types";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyboardStatus: Record<string, LetterStatus>;
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
}: KeyboardProps) {
  const handleClick = (key: string) => {
    if (key === "ENTER") onEnter();
    else if (key === "DEL") onBackspace();
    else onKeyPress(key);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-1.5">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "DEL";
            const status = keyboardStatus[key];
            const bgColor = status ? statusColors[status] : "rgba(50, 50, 50, 0.8)";

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={`
                  ${isSpecial ? "px-2.5 sm:px-4 text-[10px] sm:text-xs" : "w-[30px] sm:w-[36px] text-sm sm:text-base"}
                  h-[42px] sm:h-[50px] rounded-md font-semibold transition-all duration-100
                  active:scale-95 active:brightness-75 select-none
                `}
                style={{
                  backgroundColor: bgColor,
                  color:
                    status === "correct" || status === "present"
                      ? "#fff"
                      : "#d0d0d0",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {key === "DEL" ? "\u232B" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
