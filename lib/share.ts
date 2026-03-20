import type { Guess } from "@/types";

export function generateShareText(
  guesses: Guess[],
  won: boolean,
  maxGuesses: number
): string {
  const result = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  const header = `Decagram ${result}`;

  const grid = guesses
    .map((guess) =>
      guess.results.map((r) => statusToEmoji(r.status)).join("")
    )
    .join("\n");

  return `${header}\n\n${grid}`;
}

function statusToEmoji(status: string): string {
  switch (status) {
    case "correct":
      return "\u{1F7E9}";
    case "present":
      return "\u{1F7E8}";
    case "absent":
      return "\u2B1B";
    default:
      return "\u2B1C";
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
