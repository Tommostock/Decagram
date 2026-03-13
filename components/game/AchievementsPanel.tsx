"use client";

import { ACHIEVEMENTS } from "@/lib/achievements";

interface AchievementsPanelProps {
  unlockedIds: string[];
}

export default function AchievementsPanel({ unlockedIds }: AchievementsPanelProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "4px 0",
      }}
    >
      {ACHIEVEMENTS.map((achievement) => {
        const isUnlocked = unlockedIds.includes(achievement.id);

        return (
          <div
            key={achievement.id}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "16px 12px",
              borderRadius: "12px",
              background: "rgba(20, 20, 20, 0.8)",
              border: isUnlocked
                ? "1px solid rgba(245, 200, 66, 0.3)"
                : "1px solid var(--border-glass)",
              opacity: isUnlocked ? 1 : 0.3,
              transition: "opacity 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                lineHeight: 1,
              }}
            >
              {isUnlocked ? achievement.icon : "\u{1F512}"}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "13px",
                color: isUnlocked ? "#e8e8e8" : "var(--text-dim)",
                textAlign: "center",
              }}
            >
              {achievement.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: isUnlocked ? "#e8e8e8" : "var(--text-dim)",
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {achievement.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
