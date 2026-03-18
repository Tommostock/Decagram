import answerWords from "@/data/words-answer.json";

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDailyWord(dateKey: string): string {
  const hash = hashString(dateKey);
  const index = hash % answerWords.length;
  return (answerWords as string[])[index].toUpperCase();
}
