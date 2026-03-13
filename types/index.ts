export type GamePhase =
  | "INITIAL"
  | "LETTER_SELECTION"
  | "REVEAL"
  | "GUESSING"
  | "WIN"
  | "LOSE";

export type LetterStatus = "correct" | "present" | "absent" | "unknown";

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface Guess {
  word: string;
  results: LetterResult[];
}

export interface GameState {
  phase: GamePhase;
  dailyWord: string;
  dateKey: string;
  selectedConsonants: string[];
  selectedVowel: string;
  revealedPositions: number[];
  guesses: Guess[];
  currentInput: string;
  inputHistory: string[];
  selectedInputPosition: number | null;
  keyboardStatus: Record<string, LetterStatus>;
  maxGuesses: number;
}

export interface DailyStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number];
  lastPlayedDate: string;
}

export interface StoredGameState {
  dateKey: string;
  phase: GamePhase;
  selectedConsonants: string[];
  selectedVowel: string;
  guesses: Guess[];
  wordSeed?: string;
}
