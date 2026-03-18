import answerWords from "@/data/words-answer.json";

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash | 0; // keep result as signed int32 on every iteration
  }
  return Math.abs(hash);
}

export function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDailyWord(dateKey: string): string {
  const words = answerWords as string[];
  if (words.length === 0) return "CATEGORIES"; // safety fallback if word list is empty
  const hash = hashString(dateKey);
  const index = hash % words.length;
  return words[index].toUpperCase();
}
