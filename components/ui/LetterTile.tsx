"use client";

import { useEffect, useState } from "react";
import type { LetterStatus } from "@/types";

interface LetterTileProps {
  letter?: string;
  status?: LetterStatus | "empty" | "revealed";
  delay?: number;
  isRevealing?: boolean;
  size?: "sm" | "md";
}

const statusColors: Record<string, { bg: string; border: string }> = {
  correct: { bg: "#22c55e", border: "#16a34a" },
  present: { bg: "#eab308", border: "#ca8a04" },
  absent: { bg: "#374151", border: "#4b5563" },
  unknown: { bg: "transparent", border: "#3a3a3a" },
  empty: { bg: "transparent", border: "#2a2a2a" },
  revealed: { bg: "rgba(245, 200, 66, 0.15)", border: "#f5c842" },
};

export function LetterTile({
  letter,
  status = "empty",
  delay = 0,
  isRevealing = false,
  size = "md",
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
              color: status === "revealed" ? "#f5c842" : "#fff",
            }}
          >
            {letter?.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-lg border-2 font-bold transition-all duration-200 select-none
        ${status === "correct" ? "animate-heartbeat" : ""}
      `}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color:
          status === "revealed"
            ? "#f5c842"
            : status === "empty" || status === "unknown"
              ? "#e8e8e8"
              : "#fff",
        transform: letter && !flipped ? "scale(1)" : undefined,
        boxShadow: status === "correct" ? "0 0 12px rgba(34, 197, 94, 0.5)" : "none",
      }}
    >
      {letter?.toUpperCase()}
    </div>
  );
}
