"use client";

import { useEffect, useState } from "react";
import type { LetterStatus } from "@/types";
import { getTileColors } from "@/lib/color-blind-colors";

interface LetterTileProps {
  letter?: string;
  status?: LetterStatus | "empty" | "revealed";
  delay?: number;
  isRevealing?: boolean;
  isBouncing?: boolean;
  bounceDelay?: number;
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
  isBouncing = false,
  bounceDelay = 0,
  size = "md",
  colorBlind = false,
}: LetterTileProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      setIsFlipped(false);
      const timer = setTimeout(() => setIsFlipped(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, delay]);

  const statusColors = getStatusColors(colorBlind);
  const colors = statusColors[status] || statusColors.empty;
  const sizeClasses =
    size === "sm"
      ? "w-[30px] h-[38px] text-sm sm:w-[34px] sm:h-[42px]"
      : "w-[32px] h-[40px] text-base sm:w-[40px] sm:h-[50px] sm:text-xl";

  // Should we show the 3D flip animation?
  const shouldAnimate = isRevealing && status !== "empty";

  if (shouldAnimate) {
    // Guess tiles (correct/present/absent): show letter in gray before flip
    // Word display tiles (revealed): show blank before flip
    const isGuessReveal = status === "correct" || status === "present" || status === "absent";
    const frontBorder = isGuessReveal ? "#3a3a3a" : "#2a2a2a";
    const frontBg = isGuessReveal ? "transparent" : "transparent";
    const backColors = colors;
    const glowColor = backColors.glow || "transparent";

    return (
      <div className={`${sizeClasses} select-none`} style={{ perspective: "1000px" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateX(0deg)" : "rotateX(90deg)",
            transition: `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`,
          }}
        >
          {/* Front face: before flip */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              border: "2px solid",
              borderColor: frontBorder,
              backgroundColor: frontBg,
              color: "#e8e8e8",
              fontWeight: "bold",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "var(--bg-tile-empty)",
            }}
          >
            {isGuessReveal ? letter?.toUpperCase() : ""}
          </div>
          {/* Back face: revealed state */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              border: "2px solid",
              borderColor: backColors.border,
              backgroundColor: backColors.bg,
              color: "#fff",
              fontWeight: "bold",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow:
                glowColor !== "transparent"
                  ? `0 0 12px ${glowColor}, inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)`
                  : "inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {letter?.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  // Static tile (no flip animation) with optional win bounce
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
            ? `0 0 12px ${statusColors.correct.glow}`
            : status === "present"
              ? `0 0 12px ${statusColors.present.glow}`
              : "none") + ", inset 0 1px 2px rgba(255, 255, 255, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(8px)",
        background: colors.bg === "transparent" ? "var(--bg-tile-empty)" : colors.bg,
        animation: isBouncing ? "winBounce 0.6s ease" : undefined,
        animationDelay: isBouncing ? `${bounceDelay}ms` : undefined,
        animationFillMode: isBouncing ? "both" : undefined,
      }}
    >
      {letter?.toUpperCase()}
    </div>
  );
}
