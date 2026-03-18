"use client";

import { useEffect, useState } from "react";
import { getTimeUntilNextPuzzle } from "@/lib/daily-word";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextPuzzle());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeUntilNextPuzzle();
      if (remaining <= 0) {
        window.location.reload();
        return;
      }
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="text-center">
      <p className="text-xs text-[#a0a0a0] uppercase tracking-widest mb-1">
        Next word in
      </p>
      <p
        className="text-2xl font-bold tracking-wider"
        style={{ fontVariantNumeric: "tabular-nums", color: "#f5c842" }}
      >
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </p>
    </div>
  );
}
