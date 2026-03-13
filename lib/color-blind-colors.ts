export interface TileColors {
  correct: { bg: string; border: string; glow: string };
  present: { bg: string; border: string; glow: string };
  absent: { bg: string; border: string };
}

export function getTileColors(colorBlind: boolean): TileColors {
  if (colorBlind) {
    return {
      correct: { bg: "#2979ff", border: "#1565c0", glow: "rgba(41, 121, 255, 0.5)" },
      present: { bg: "#ff9100", border: "#e65100", glow: "rgba(255, 145, 0, 0.6)" },
      absent: { bg: "#374151", border: "#4b5563" },
    };
  }
  return {
    correct: { bg: "#22c55e", border: "#16a34a", glow: "rgba(34, 197, 94, 0.5)" },
    present: { bg: "#cc8d00", border: "#8b6009", glow: "rgba(204, 141, 0, 0.6)" },
    absent: { bg: "#374151", border: "#4b5563" },
  };
}

export function getKeyboardColors(colorBlind: boolean): { correct: string; present: string; absent: string } {
  if (colorBlind) {
    return { correct: "#2979ff", present: "#ff9100", absent: "#2a2a2a" };
  }
  return { correct: "#22c55e", present: "#cc8d00", absent: "#2a2a2a" };
}
