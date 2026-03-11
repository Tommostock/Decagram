"use client";

import { useEffect, useState, useCallback } from "react";
import type { Guess, DailyStats } from "@/types";
import { GoldenButton } from "@/components/ui/GoldenButton";
import { CountdownTimer } from "./CountdownTimer";
import { generateShareText, copyToClipboard } from "@/lib/share";

interface ResultModalProps {
  won: boolean;
  dailyWord: string;
  dateKey: string;
  guesses: Guess[];
  maxGuesses: number;
  stats: DailyStats;
  onPlayAgain?: () => void;
  onClose?: () => void;
}

export function ResultModal({
  won,
  dailyWord,
  dateKey,
  guesses,
  maxGuesses,
  stats,
  onPlayAgain,
  onClose,
}: ResultModalProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(async () => {
    const text = generateShareText(dateKey, guesses, won, maxGuesses);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [dateKey, guesses, won, maxGuesses]);

  const winPct =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDist = Math.max(...stats.guessDistribution, 1);

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-white/[0.06] p-6 space-y-5 transition-all duration-500 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`}
        style={{
          background: "var(--bg-glass-dense)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Title */}
        <div className="relative text-center">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-0 top-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-header-btn)",
                border: "1px solid var(--border-glass)",
              }}
              aria-label="Close"
            >
              <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <p className="text-2xl font-bold mb-1">
            {won ? "Brilliant!" : "So Close!"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {won
              ? `Solved in ${guesses.length} guess${guesses.length > 1 ? "es" : ""}`
              : "Better luck tomorrow"}
          </p>
        </div>

        {/* Answer reveal (on lose) */}
        {!won && (
          <div className="text-center">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-1">
              The word was
            </p>
            <p
              className="text-xl font-bold tracking-widest"
              style={{ color: "#f5c842" }}
            >
              {dailyWord}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold">{stats.gamesPlayed}</p>
            <p className="text-[10px] text-[var(--text-dim)] uppercase">Played</p>
          </div>
          <div>
            <p className="text-xl font-bold">{winPct}</p>
            <p className="text-[10px] text-[var(--text-dim)] uppercase">Win %</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.currentStreak}</p>
            <p className="text-[10px] text-[var(--text-dim)] uppercase">Streak</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.maxStreak}</p>
            <p className="text-[10px] text-[var(--text-dim)] uppercase">Max</p>
          </div>
        </div>

        {/* Guess distribution */}
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-2">
            Guess Distribution
          </p>
          {stats.guessDistribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold w-3">{i + 1}</span>
              <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: "var(--bg-dist-bar)" }}>
                <div
                  className="h-full rounded flex items-center justify-end px-1.5 text-[10px] font-bold transition-all duration-700"
                  style={{
                    width: `${Math.max((count / maxDist) * 100, count > 0 ? 12 : 4)}%`,
                    background:
                      won && guesses.length === i + 1
                        ? "#14b8a6"
                        : "var(--bg-key)",
                    color: "#fff",
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
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
              Play Again
            </button>
          )}
          <div className="flex-1">
            <GoldenButton onClick={handleShare} size="lg">
              {copied ? "Copied!" : "Share Result"}
            </GoldenButton>
          </div>
        </div>
      </div>
    </div>
  );
}
