"use client";

interface PauseMenuProps {
  onResume: () => void;
  onStartNewGame: () => void;
  onRevealAnswer: () => void;
  isGameOver?: boolean;
}

export function PauseMenu({ onResume, onStartNewGame, onRevealAnswer, isGameOver = false }: PauseMenuProps) {
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
              background: "var(--bg-subtle)",
              color: "var(--text-dim)",
              border: "1px solid var(--border-glass)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-key)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-subtle)";
              e.currentTarget.style.color = "var(--text-dim)";
            }}
          >
            Reveal Answer
          </button>
        )}
      </div>
    </div>
  );
}
