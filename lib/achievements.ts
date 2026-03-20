import type { GameStats } from "@/types";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    name: "First Win",
    description: "Win your first game",
    icon: "\u{1F3C6}",
  },
  {
    id: "perfect",
    name: "Perfect",
    description: "Solve on first guess",
    icon: "\u{1F48E}",
  },
  {
    id: "streak_5",
    name: "On Fire",
    description: "Reach a 5-day win streak",
    icon: "\u{1F525}",
  },
  {
    id: "streak_10",
    name: "Unstoppable",
    description: "Reach a 10-day win streak",
    icon: "\u{26A1}",
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Play 10 games",
    icon: "\u{1F396}\uFE0F",
  },
  {
    id: "century",
    name: "Century",
    description: "Play 100 games",
    icon: "\u{1F4AF}",
  },
  {
    id: "sharp_mind",
    name: "Sharp Mind",
    description: "Win 10 games",
    icon: "\u{1F9E0}",
  },
  {
    id: "half_century_wins",
    name: "Master",
    description: "Win 50 games",
    icon: "\u{1F451}",
  },
];

const ACHIEVEMENTS_KEY = "decagram-achievements";

/** Takes GameStats, returns array of achievement IDs that should be unlocked */
export function checkAchievements(stats: GameStats): string[] {
  const unlocked: string[] = [];

  if (stats.gamesWon >= 1) unlocked.push("first_win");
  if (stats.guessDistribution[0] >= 1) unlocked.push("perfect");
  if (stats.maxStreak >= 5) unlocked.push("streak_5");
  if (stats.maxStreak >= 10) unlocked.push("streak_10");
  if (stats.gamesPlayed >= 10) unlocked.push("veteran");
  if (stats.gamesPlayed >= 100) unlocked.push("century");
  if (stats.gamesWon >= 10) unlocked.push("sharp_mind");
  if (stats.gamesWon >= 50) unlocked.push("half_century_wins");

  return unlocked;
}

/** Load unlocked achievement IDs from localStorage */
export function loadUnlockedAchievements(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Save unlocked achievement IDs to localStorage */
export function saveUnlockedAchievements(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
}

/** Returns newly unlocked achievements (not previously saved) */
export function getNewlyUnlocked(stats: GameStats): Achievement[] {
  const currentlyUnlocked = checkAchievements(stats);
  const previouslySaved = loadUnlockedAchievements();
  const newIds = currentlyUnlocked.filter((id) => !previouslySaved.includes(id));

  if (newIds.length > 0) {
    const allUnlocked = Array.from(new Set([...previouslySaved, ...currentlyUnlocked]));
    saveUnlockedAchievements(allUnlocked);
  }

  return ACHIEVEMENTS.filter((a) => newIds.includes(a.id));
}
