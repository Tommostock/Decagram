"use client";

import { useState, useEffect } from "react";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  text: string;
  visual: React.ReactNode;
}

const tileBase: React.CSSProperties = {
  width: 32,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  color: "#fff",
  border: "2px solid",
  userSelect: "none",
};

const goldTile: React.CSSProperties = {
  ...tileBase,
  background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
  borderColor: "#d4a527",
  color: "#0a0a0a",
  boxShadow: "0 0 10px rgba(245, 200, 66, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)",
};

const blankTile: React.CSSProperties = {
  ...tileBase,
  background: "rgba(255,255,255,0.04)",
  borderColor: "#2a2a2a",
  color: "#555",
};

const revealedTile: React.CSSProperties = {
  ...tileBase,
  background: "#22c55e",
  borderColor: "#16a34a",
  boxShadow: "0 0 10px rgba(34,197,94,0.4), inset 0 1px 2px rgba(255,255,255,0.25)",
};

function LetterPickerVisual() {
  const letters = [
    { letter: "T", style: goldTile },
    { letter: "L", style: goldTile },
    { letter: "N", style: goldTile },
    { letter: "G", style: goldTile },
    { letter: "A", style: { ...goldTile, boxShadow: "0 0 12px rgba(245,200,66,0.5), inset 0 1px 2px rgba(255,255,255,0.3)" } },
  ];

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {letters.map(({ letter, style }, i) => (
        <div key={i} style={style}>
          {letter}
        </div>
      ))}
    </div>
  );
}

function WordRevealVisual() {
  const tiles = [
    { letter: "_", revealed: false },
    { letter: "_", revealed: false },
    { letter: "N", revealed: true },
    { letter: "_", revealed: false },
    { letter: "E", revealed: true },
    { letter: "_", revealed: false },
    { letter: "_", revealed: false },
    { letter: "_", revealed: false },
    { letter: "N", revealed: true },
    { letter: "G", revealed: true },
  ];

  return (
    <div style={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "nowrap" }}>
      {tiles.map(({ letter, revealed }, i) => (
        <div key={i} style={{ ...(revealed ? revealedTile : blankTile), width: 26, height: 34, fontSize: 12 }}>
          {revealed ? letter : ""}
        </div>
      ))}
    </div>
  );
}

function GuessResultVisual() {
  const examples = [
    { letter: "N", bg: "#22c55e", border: "#16a34a", label: "Correct", glow: "rgba(34,197,94,0.4)" },
    { letter: "A", bg: "#cc8d00", border: "#8b6009", label: "Wrong spot", glow: "rgba(204,141,0,0.4)" },
    { letter: "X", bg: "#374151", border: "#4b5563", label: "Not in word", glow: "none" },
  ];

  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
      {examples.map(({ letter, bg, border, label, glow }, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              ...tileBase,
              background: bg,
              borderColor: border,
              boxShadow: glow !== "none"
                ? `0 0 10px ${glow}, inset 0 1px 2px rgba(255,255,255,0.25)`
                : "inset 0 1px 2px rgba(255,255,255,0.25)",
            }}
          >
            {letter}
          </div>
          <span style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function HintVisual() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "rgba(245,200,66,0.1)",
          border: "1px solid rgba(245,200,66,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6" stroke="#f5c842" strokeWidth="1.5" />
          <path d="M7 6v4" stroke="#f5c842" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="4" r="0.75" fill="#f5c842" />
        </svg>
      </div>
    </div>
  );
}

const steps: TutorialStep[] = [
  {
    title: "Choose Your Letters",
    text: "Pick 4 consonants and 1 vowel. These letters will be revealed in the hidden word to give you a head start.",
    visual: <LetterPickerVisual />,
  },
  {
    title: "Reveal the Word",
    text: "Your chosen letters are revealed in the 10-letter word. Use these clues to figure out what the word is.",
    visual: <WordRevealVisual />,
  },
  {
    title: "Make Your Guess",
    text: "Type a 10-letter word and press ENTER. You get 3 guesses. Green means correct position, orange means right letter wrong position.",
    visual: <GuessResultVisual />,
  },
  {
    title: "Hints & More",
    text: "Stuck? Use the hint button for a definition clue. Try to solve it in as few guesses as possible!",
    visual: <HintVisual />,
  },
];

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleClose();
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setTransitioning(false);
    }, 200);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  const step = steps[currentStep];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`}
        style={{
          background: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Skip button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim, #555)",
              fontSize: 12,
              cursor: "pointer",
              padding: "2px 0",
            }}
          >
            Skip
          </button>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === currentStep ? "#f5c842" : "#333",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {/* Title */}
          <h2
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
              background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#aaa",
              marginBottom: 24,
              padding: "0 4px",
            }}
          >
            {step.text}
          </p>

          {/* Visual */}
          <div style={{ marginBottom: 28 }}>{step.visual}</div>
        </div>

        {/* Next / Let's Play button */}
        <button
          onClick={handleNext}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
            color: "#0a0a0a",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {currentStep === steps.length - 1 ? "Let's Play!" : "Next"}
        </button>
      </div>
    </div>
  );
}
