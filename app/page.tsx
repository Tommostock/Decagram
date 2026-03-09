"use client";

import { GameBoard } from "@/components/game/GameBoard";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-4 py-6"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 1.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)",
      }}
    >
      <GameBoard />
    </main>
  );
}
