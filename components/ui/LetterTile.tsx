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
  const [phase, setPhase] = useState<"idle" | "shrink" | "grow">("idle");

  useEffect(() => {
    if (isRevealing) {
      setPhase("idle");
      const t1 = setTimeout(() => setPhase("shrink"), delay);
      const t2 = setTimeout(() => setPhase("grow"), delay + 187);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isRevealing, delay]);

  const statusColors = getStatusColors(colorBlind);
  const colors = statusColors[status] || statusColors.empty;
  const sizeClasses =
    size === "sm"
      ? "w-[30px] h-[38px] text-sm sm:w-[34px] sm:h-[42px]"
      : "w-[32px] h-[40px] text-base sm:w-[40px] sm:h-[50px] sm:text-xl";

  const showResult = phase === "grow";
  const isCorrect = status === "correct";
  const isRevealed = status === "revealed";

  let bgColor: string;
  let borderColor: string;
  let textColor: string;
  let glowShadow: string;
  let displayLetter: string | undefined;

  if (isRevealing && !showResult) {
    bgColor = "var(--bg-tile-empty)";
    borderColor = "#2a2a2a";
    textColor = "#e8e8e8";
    glowShadow = "none";
    displayLetter = undefined;
  } else {
    bgColor = colors.bg === "transparent" ? "var(--bg-tile-empty)" : colors.bg;
    borderColor = colors.border;
    textColor = status === "empty" || status === "unknown" ? "#e8e8e8" : "#fff";
    glowShadow = (isCorrect || isRevealed)
      ? `0 0 12px ${statusColors.correct.glow}`
      : status === "present"
        ? `0 0 12px ${statusColors.present.glow}`
        : "none";
    displayLetter = letter;
  }

  const boxShadow = `${glowShadow}, inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)`;

  // CSS animation — use longhand properties to avoid React shorthand/longhand conflict
  let animationName: string | undefined;
  let animationDuration: string | undefined;
  let animationTimingFunction: string | undefined;
  let animationFillMode: string | undefined;

  if (phase === "shrink") {
    animationName = "tileRevealShrink";
    animationDuration = "187ms";
    animationTimingFunction = "ease-in";
    animationFillMode = "forwards";
  } else if (phase === "grow") {
    animationName = "tileRevealGrow";
    animationDuration = "187ms";
    animationTimingFunction = "ease-out";
    animationFillMode = "forwards";
  }

  return (
    <div className={`${sizeClasses} select-none`}>
      <div
        className="w-full h-full flex items-center justify-center rounded-lg border-2 font-bold select-none"
        style={{
          backgroundColor: bgColor,
          borderColor,
          color: textColor,
          boxShadow,
          backdropFilter: "blur(8px)",
          animationName,
          animationDuration,
          animationTimingFunction,
          animationFillMode,
        }}
      >
        {displayLetter?.toUpperCase()}
      </div>
    </div>
  );
}
