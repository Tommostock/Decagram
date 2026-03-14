"use client";

import { useEffect, useState } from "react";
import type { LetterStatus } from "@/types";
import { getTileColors } from "@/lib/color-blind-colors";

interface LetterTileProps {
  letter?: string;
  status?: LetterStatus | "empty" | "revealed";
  delay?: number;
  isRevealing?: boolean;
  size?: "sm" | "md";
  colorBlind?: boolean;
}

function getStatusColors(colorBlind: boolean): Record<string, { bg: string; border: string; glow?: string }> {
  const tile = getTileColors(colorBlind);
  return {
    correct: { bg: tile.correct.bg, border: tile.correct.border, glow: tile.correct.glow },
    present: { bg: tile.present.bg, border: tile.present.border, glow: tile.present.glow },
    absent: { bg: tile.absent.bg, border: tile.absent.border },
    unknown: { bg: "transparent", border: "#3a3a3a" },
    empty: { bg: "transparent", border: "#2a2a2a" },
    revealed: { bg: tile.correct.bg, border: tile.correct.border, glow: tile.correct.glow },
  };
}

export function LetterTile({
  letter,
  status = "empty",
  delay = 0,
  isRevealing = false,
  size = "md",
  colorBlind = false,
}: LetterTileProps) {
  const [flipping, setFlipping] = useState(false);
  const [showColor, setShowColor] = useState(false);

  useEffect(() => {
    if (!isRevealing) return;

    // Start the CSS flip animation after the stagger delay
    const t1 = setTimeout(() => setFlipping(true), delay);
    // Swap colors at the midpoint (250ms into the 500ms animation) when tile is edge-on
    const t2 = setTimeout(() => setShowColor(true), delay + 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isRevealing, delay]);

  const statusColors = getStatusColors(colorBlind);
  const colors = statusColors[status] || statusColors.empty;
  const emptyColors = statusColors.empty;

  const sizeClasses =
    size === "sm"
      ? "w-[30px] h-[38px] text-sm sm:w-[34px] sm:h-[42px]"
      : "w-[32px] h-[40px] text-base sm:w-[40px] sm:h-[50px] sm:text-xl";

  if (isRevealing || flipping) {
    const bg = showColor ? colors.bg : emptyColors.bg;
    const border = showColor ? colors.border : emptyColors.border;
    const textColor = showColor ? "#fff" : "#e8e8e8";

    const glow = showColor
      ? status === "present"
        ? `0 0 10px ${statusColors.present.glow}`
        : status === "correct" || status === "revealed"
          ? `0 0 10px ${statusColors.correct.glow}`
          : "none"
      : "none";

    return (
      <div className={`${sizeClasses} select-none`} style={{ perspective: "600px" }}>
        <div
          className={flipping ? "tile-flip" : ""}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.5rem",
            border: "2px solid",
            borderColor: border,
            backgroundColor: bg === "transparent" ? "var(--bg-tile-empty)" : bg,
            color: textColor,
            fontWeight: "bold",
            boxShadow:
              glow +
              (glow !== "none" ? ", " : "") +
              "inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
          }}
        >
          {letter?.toUpperCase()}
        </div>
      </div>
    );
  }

  // Static tile (not revealing)
  const isCorrect = status === "correct";
  const isRevealed = status === "revealed";

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-lg border-2 font-bold select-none`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: status === "empty" || status === "unknown" ? "#e8e8e8" : "#fff",
        boxShadow:
          (isCorrect || isRevealed
            ? `0 0 10px ${statusColors.correct.glow}`
            : status === "present"
              ? `0 0 10px ${statusColors.present.glow}`
              : "none") + ", inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(8px)",
        background: colors.bg === "transparent" ? "var(--bg-tile-empty)" : colors.bg,
      }}
    >
      {letter?.toUpperCase()}
    </div>
  );
}
