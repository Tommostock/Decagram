import validWords from "@/data/words-valid.json";
import answerWords from "@/data/words-answer.json";
import { WORD_LENGTH } from "./constants";

const validWordSet = new Set<string>([
  ...(validWords as string[]).map((w) => w.toUpperCase()),
  ...(answerWords as string[]).map((w) => w.toUpperCase()),
]);

export function isValidWord(word: string): boolean {
  if (word.length !== WORD_LENGTH) return false;
  return validWordSet.has(word.toUpperCase());
}
