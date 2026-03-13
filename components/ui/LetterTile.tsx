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
  const [flipped, setFlipped] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      const flipTimer = setTimeout(() => setFlipped(true), delay);
      const showTimer = setTimeout(() => setShowBack(true), delay + 300);
      return () => {
        clearTimeout(flipTimer);
        clearTimeout(showTimer);
      };
    }
  }, [isRevealing, delay]);

  const statusColors = getStatusColors(colorBlind);
  const colors = statusColors[status] || statusColors.empty;
  const sizeClasses =
    size === "sm"
      ? "w-[30px] h-[38px] text-sm sm:w-[34px] sm:h-[42px]"
      : "w-[32px] h-[40px] text-base sm:w-[40px] sm:h-[50px] sm:text-xl";

  if (isRevealing) {
    const frontColors = statusColors.empty;
    const backColors = colors;

    return (
      <div className={`${sizeClasses} select-none`} style={{ perspective: "600px" }}>
        <div
          className="w-full h-full relative transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg border-2 font-bold backface-hidden"
            style={{
              backgroundColor: frontColors.bg,
              borderColor: frontColors.border,
              backfaceVisibility: "hidden",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg border-2 font-bold"
            style={{
              backgroundColor: backColors.bg,
              borderColor: backColors.border,
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              color: "#fff",
              boxShadow: (status === "present" ? `0 0 12px ${statusColors.present.glow}` : status === "correct" || status === "revealed" ? `0 0 12px ${statusColors.correct.glow}` : "none") + ", inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {letter?.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = status === "correct";
  const isRevealed = status === "revealed";

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses} flex items-center justify-center rounded-lg border-2 font-bold transition-all duration-200 select-none
          ${isCorrect ? "animate-heartbeat" : ""}
        `}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color:
            status === "empty" || status === "unknown"
              ? "#e8e8e8"
              : "#fff",
          transform: letter && !flipped ? "scale(1)" : undefined,
          boxShadow:
            (isCorrect || isRevealed ? `0 0 12px ${statusColors.correct.glow}` : status === "present" ? `0 0 12px ${statusColors.present.glow}` : "none") +
            ", inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)",
          background: colors.bg === "transparent"
            ? "var(--bg-tile-empty)"
            : colors.bg,
        }}
      >
        {letter?.toUpperCase()}
      </div>
    </div>
  );
}
