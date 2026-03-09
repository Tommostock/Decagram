import type { Guess } from "@/types";

export function generateShareText(
  dateKey: string,
  guesses: Guess[],
  won: boolean,
  maxGuesses: number
): string {
  const result = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  const header = `Decagram ${dateKey} ${result}`;

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
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}
