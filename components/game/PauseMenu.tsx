"use client";

import { useState } from "react";
import AchievementsPanel from "./AchievementsPanel";

interface PauseMenuProps {
  onResume: () => void;
  onStartNewGame: () => void;
  onRevealAnswer: () => void;
  isGameOver?: boolean;
  colorBlindMode?: boolean;
  onToggleColorBlind?: () => void;
  unlockedAchievements?: string[];
}

export function PauseMenu({ onResume, onStartNewGame, onRevealAnswer, isGameOver = false, colorBlindMode = false, onToggleColorBlind, unlockedAchievements = [] }: PauseMenuProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-white/[0.08] p-6 space-y-3"
        style={{
          background: "var(--bg-glass-dense)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Title */}
        <div className="text-center pb-2">
          <p
            className="text-lg font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, #f5c842 0%, #d4a527 50%, #b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isGameOver ? "MENU" : "PAUSED"}
          </p>
        </div>

        {/* Resume — only during active game */}
        {!isGameOver && (
          <button
            onClick={onResume}
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
              color: "#0a0a0a",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f7d060 0%, #e0b030 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)";
            }}
          >
            Resume
          </button>
        )}

        {/* Start New Game */}
        <button
          onClick={onStartNewGame}
          className="w-full px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95"
          style={{
            background: "var(--bg-key)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-key-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-key)";
          }}
        >
          Start New Game
        </button>

        {/* Reveal Answer — only during active game */}
        {!isGameOver && (
          <button
            onClick={onRevealAnswer}
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95"
            style={{
              background: "var(--bg-key)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-key-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-key)";
            }}
          >
            Reveal Answer
          </button>
        )}

        {/* Colour-blind toggle */}
        {onToggleColorBlind && (
          <button
            onClick={onToggleColorBlind}
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95 flex items-center justify-between"
            style={{
              background: "var(--bg-key)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-key-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-key)";
            }}
          >
            <span>Colour-Blind Mode</span>
            <span
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: colorBlindMode ? "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)" : "#333",
                display: "inline-flex",
                alignItems: "center",
                padding: "0 2px",
                transition: "background 0.2s ease",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transform: colorBlindMode ? "translateX(18px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                }}
              />
            </span>
          </button>
        )}

        {/* Achievements */}
        <button
          onClick={() => setShowAchievements((v) => !v)}
          className="w-full px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95"
          style={{
            background: "var(--bg-key)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-key-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-key)";
          }}
        >
          🏆 Achievements
        </button>

        {showAchievements && (
          <div className="mt-1">
            <AchievementsPanel unlockedIds={unlockedAchievements} />
          </div>
        )}
      </div>
    </div>
  );
}
