"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { GameState, GamePhase, Guess, DailyStats } from "@/types";
import { VOWELS, CONSONANTS, REQUIRED_CONSONANTS, WORD_LENGTH } from "@/lib/constants";
import { getTodayKey, getDailyWord } from "@/lib/daily-word";
import {
  createInitialState,
  calculateRevealedPositions,
  makeGuess,
  updateKeyboardStatus,
} from "@/lib/game-engine";
import { isValidWord } from "@/lib/word-validator";
import { loadGameState, saveGameState, loadStats, saveStats } from "@/lib/storage";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { GoldenButton } from "@/components/ui/GoldenButton";
import { Toast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LetterPicker } from "./LetterPicker";
import { WordDisplay } from "./WordDisplay";
import { GuessInput } from "./GuessInput";
import { GuessHistory } from "./GuessHistory";
import { Keyboard } from "./Keyboard";
import { ResultModal } from "./ResultModal";
import { PauseMenu } from "./PauseMenu";
import { DefinitionPanel } from "./DefinitionPanel";

type Action =
  | { type: "RESTORE"; state: GameState }
  | { type: "SELECT_CONSONANT"; letter: string }
  | { type: "SELECT_VOWEL"; letter: string }
  | { type: "CONFIRM_LETTERS" }
  | { type: "FINISH_REVEAL" }
  | { type: "TYPE_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "SUBMIT_GUESS"; guess: Guess; newPhase: GamePhase }
  | { type: "CLEAR_INPUT" }
  | { type: "GIVE_UP" }
  | { type: "PLAY_AGAIN"; dailyWord: string };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESTORE":
      return action.state;

    case "SELECT_CONSONANT": {
      const { letter } = action;
      const already = state.selectedConsonants.includes(letter);
      if (already) {
        return {
          ...state,
          selectedConsonants: state.selectedConsonants.filter((l) => l !== letter),
        };
      }
      if (state.selectedConsonants.length >= REQUIRED_CONSONANTS) return state;
      return {
        ...state,
        selectedConsonants: [...state.selectedConsonants, letter],
      };
    }

    case "SELECT_VOWEL": {
      const { letter } = action;
      if (state.selectedVowel === letter) {
        return { ...state, selectedVowel: "" };
      }
      return { ...state, selectedVowel: letter };
    }

    case "CONFIRM_LETTERS": {
      const positions = calculateRevealedPositions(
        state.dailyWord,
        state.selectedConsonants,
        state.selectedVowel
      );
      return {
        ...state,
        phase: "REVEAL",
        revealedPositions: positions,
      };
    }

    case "FINISH_REVEAL":
      return { ...state, phase: "GUESSING" };

    case "TYPE_LETTER": {
      if (state.currentInput.length >= WORD_LENGTH) return state;
      return { ...state, currentInput: state.currentInput + action.letter };
    }

    case "DELETE_LETTER": {
      if (state.currentInput.length === 0) return state;
      return { ...state, currentInput: state.currentInput.slice(0, -1) };
    }

    case "SUBMIT_GUESS": {
      const newKeyboard = updateKeyboardStatus(
        state.keyboardStatus,
        action.guess.results
      );
      return {
        ...state,
        guesses: [...state.guesses, action.guess],
        currentInput: "",
        keyboardStatus: newKeyboard,
        phase: action.newPhase,
      };
    }

    case "CLEAR_INPUT":
      return { ...state, currentInput: "" };

    case "GIVE_UP":
      return { ...state, phase: "LOSE", currentInput: "" };

    case "PLAY_AGAIN":
      return {
        ...createInitialState(action.dailyWord, state.dateKey),
      };

    default:
      return state;
  }
}

export function GameBoard() {
  const dateKey = getTodayKey();

  // wordSeed is a random string persisted to localStorage so that:
  // - each new game / Play Again picks a fresh random word
  // - refreshing mid-game restores the same word (seed loaded from saved state)
  const [wordSeed, setWordSeed] = useState<string>(() => {
    if (typeof window === "undefined") return Math.random().toString(36).slice(2, 8);
    const saved = loadGameState();
    return saved?.wordSeed ?? Math.random().toString(36).slice(2, 8);
  });
  const activeWord = getDailyWord(`${dateKey}-${wordSeed}`);

  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => createInitialState(activeWord, dateKey)
  );

  const [stats, setStats] = useState<DailyStats>(() => loadStats());
  const [toast, setToast] = useState({ message: "", visible: false });
  const [shaking, setShaking] = useState(false);
  const [revealingGuessIdx, setRevealingGuessIdx] = useState<number | null>(null);
  const [isRevealingWord, setIsRevealingWord] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const submittingRef = useRef(false);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadGameState();
    // For testing: Allow replaying without date restriction
    // In production, change to: if (saved && saved.dateKey === dateKey) {
    if (saved) {
      const restoredState: GameState = {
        ...createInitialState(activeWord, dateKey),
        phase: saved.phase,
        selectedConsonants: saved.selectedConsonants,
        selectedVowel: saved.selectedVowel,
        guesses: saved.guesses,
        revealedPositions: calculateRevealedPositions(
          activeWord,
          saved.selectedConsonants,
          saved.selectedVowel
        ),
        keyboardStatus: {},
      };

      // Rebuild keyboard status from guesses
      let kb: Record<string, string> = {};
      for (const guess of saved.guesses) {
        kb = updateKeyboardStatus(
          kb as GameState["keyboardStatus"],
          guess.results
        ) as unknown as Record<string, string>;
      }
      restoredState.keyboardStatus = kb as GameState["keyboardStatus"];

      dispatch({ type: "RESTORE", state: restoredState });
    }
    setLoaded(true);
  }, [dateKey, activeWord]);

  // Persist state changes
  useEffect(() => {
    if (!loaded) return;
    saveGameState({
      dateKey: state.dateKey,
      phase: state.phase,
      selectedConsonants: state.selectedConsonants,
      selectedVowel: state.selectedVowel,
      guesses: state.guesses,
      wordSeed,
    });
  }, [state, loaded, wordSeed]);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  // Physical keyboard handler
  useEffect(() => {
    if (state.phase !== "GUESSING") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "DELETE_LETTER" });
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        dispatch({ type: "TYPE_LETTER", letter: e.key.toUpperCase() });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.phase, state.currentInput, state.guesses.length]);

  // Handle letter confirmation (transition from picker to reveal)
  const handleConfirmLetters = useCallback(() => {
    dispatch({ type: "CONFIRM_LETTERS" });
    setIsRevealingWord(true);

    // After reveal animation finishes, move to guessing
    const totalDelay = WORD_LENGTH * 150 + 600;
    setTimeout(() => {
      setIsRevealingWord(false);
      dispatch({ type: "FINISH_REVEAL" });
    }, totalDelay);
  }, []);

  // Handle guess submission
  const handleSubmitGuess = useCallback(() => {
    if (submittingRef.current) return;

    const input = state.currentInput;

    if (input.length !== WORD_LENGTH) {
      showToast(`Need ${WORD_LENGTH} letters`);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    if (!isValidWord(input)) {
      showToast("Not a valid word");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    submittingRef.current = true;
    const { guess, newPhase } = makeGuess(state, input);
    const guessIdx = state.guesses.length;

    dispatch({ type: "SUBMIT_GUESS", guess, newPhase });
    setRevealingGuessIdx(guessIdx);

    // Wait for reveal animation, then finalize
    const revealTime = WORD_LENGTH * 100 + 500;
    setTimeout(() => {
      setRevealingGuessIdx(null);

      if (newPhase === "WIN" || newPhase === "LOSE") {
        const newStats = { ...stats };
        newStats.gamesPlayed++;

        if (newPhase === "WIN") {
          newStats.gamesWon++;
          newStats.guessDistribution[guessIdx] =
            (newStats.guessDistribution[guessIdx] || 0) + 1;

          // Streak: check if last played was yesterday
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          const yesterdayKey = yesterday.toISOString().split("T")[0];
          if (newStats.lastPlayedDate === yesterdayKey) {
            newStats.currentStreak++;
          } else if (newStats.lastPlayedDate !== dateKey) {
            newStats.currentStreak = 1;
          }
          newStats.maxStreak = Math.max(
            newStats.maxStreak,
            newStats.currentStreak
          );
        } else {
          newStats.currentStreak = 0;
        }

        newStats.lastPlayedDate = dateKey;
        setStats(newStats);
        saveStats(newStats);
      }

      submittingRef.current = false;
    }, revealTime);
  }, [state, stats, dateKey, showToast]);

  // Keyboard callbacks for on-screen keyboard
  const handleKeyPress = useCallback(
    (key: string) => {
      if (state.phase !== "GUESSING") return;
      dispatch({ type: "TYPE_LETTER", letter: key });
    },
    [state.phase]
  );

  const handleBackspace = useCallback(() => {
    dispatch({ type: "DELETE_LETTER" });
  }, []);

  const handleEnter = useCallback(() => {
    handleSubmitGuess();
  }, [handleSubmitGuess]);

  // Play again handler - reset game to letter selection (same active word)
  const handlePlayAgain = useCallback(() => {
    const newSeed = Math.random().toString(36).slice(2, 8);
    setShowResultModal(true);
    setWordSeed(newSeed);
    const newWord = getDailyWord(`${dateKey}-${newSeed}`);
    dispatch({ type: "PLAY_AGAIN", dailyWord: newWord });
    saveGameState({
      dateKey,
      phase: "LETTER_SELECTION",
      selectedConsonants: [],
      selectedVowel: "",
      guesses: [],
      wordSeed: newSeed,
    });
  }, [dateKey]);

  // Pause menu handlers
  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleRevealAnswer = useCallback(() => {
    const newStats = { ...stats };
    newStats.gamesPlayed++;
    newStats.currentStreak = 0;
    newStats.lastPlayedDate = dateKey;
    setStats(newStats);
    saveStats(newStats);
    dispatch({ type: "GIVE_UP" });
    setIsPaused(false);
    setShowResultModal(true);
  }, [stats, dateKey]);

  const handleStartNewGame = useCallback(() => {
    const newSeed = Math.random().toString(36).slice(2, 8);
    setWordSeed(newSeed);
    const newWord = getDailyWord(`${dateKey}-${newSeed}`);
    dispatch({ type: "PLAY_AGAIN", dailyWord: newWord });
    saveGameState({
      dateKey,
      phase: "LETTER_SELECTION",
      selectedConsonants: [],
      selectedVowel: "",
      guesses: [],
      wordSeed: newSeed,
    });
    setIsPaused(false);
  }, [dateKey]);

  // Don't render until loaded (prevents flash of initial state)
  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: "#f5c842", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const isGameOver = state.phase === "WIN" || state.phase === "LOSE";

  const canPause = state.phase === "REVEAL" || state.phase === "GUESSING";

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col items-center gap-4 ${state.phase === "GUESSING" ? "pb-[250px] sm:pb-0" : ""}`}>
      {/* Pause menu overlay */}
      {isPaused && (
        <PauseMenu
          onResume={handleResume}
          onStartNewGame={handleStartNewGame}
          onRevealAnswer={handleRevealAnswer}
        />
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between mb-2 px-1">
        {/* Theme toggle — always visible */}
        <ThemeToggle />
        <div className="text-center">
          <h1
            className="text-3xl sm:text-4xl font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, #f5c842 0%, #d4a527 50%, #b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            DECAGRAM
          </h1>
          <p
            className="text-xs tracking-wider mt-0.5"
            style={{
              color: "var(--theme-secondary-text, #666)",
            }}
          >
            DAILY 10-LETTER PUZZLE
          </p>
          <p className="text-[10px] tracking-wider mt-1.5 flex items-center justify-center gap-1">
            <span style={{ color: "var(--theme-secondary-text, #888)" }}>Made by</span>
            <span
              style={{
                fontFamily: '"True Lies", cursive',
                color: "#D22223",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Spektator
            </span>
          </p>
        </div>
        {/* Pause button — only visible when game is active */}
        {canPause ? (
          <button
            onClick={() => setIsPaused(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
            aria-label="Pause"
          >
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="3.5" height="13" rx="1.5"
                fill="url(#goldGradPause)" stroke="none" />
              <rect x="8" y="0.5" width="3.5" height="13" rx="1.5"
                fill="url(#goldGradPause)" stroke="none" />
              <defs>
                <linearGradient id="goldGradPause" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#f5c842" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
              </defs>
            </svg>
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* Word display (visible during reveal and guessing phases) */}
      {(state.phase === "REVEAL" ||
        state.phase === "GUESSING" ||
        isGameOver) && (
        <GlassPanel className="w-full">
          <WordDisplay
            word={state.dailyWord}
            revealedPositions={state.revealedPositions}
            isRevealing={isRevealingWord}
            guesses={state.guesses}
          />
          {/* Selected letters info */}
          <div className="mt-3 flex justify-center gap-1.5">
            {[...state.selectedConsonants, state.selectedVowel]
              .filter(Boolean)
              .map((l) => (
                <span
                  key={l}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(245, 200, 66, 0.1)",
                    color: "#f5c842",
                    border: "1px solid rgba(245, 200, 66, 0.2)",
                  }}
                >
                  {l}
                </span>
              ))}
          </div>
        </GlassPanel>
      )}

      {/* Letter selection phase */}
      {state.phase === "LETTER_SELECTION" && (
        <GlassPanel className="w-full">
          <LetterPicker
            selectedConsonants={state.selectedConsonants}
            selectedVowel={state.selectedVowel}
            onSelectConsonant={(l) =>
              dispatch({ type: "SELECT_CONSONANT", letter: l })
            }
            onSelectVowel={(l) =>
              dispatch({ type: "SELECT_VOWEL", letter: l })
            }
            onConfirm={handleConfirmLetters}
          />
        </GlassPanel>
      )}

      {/* Guessing phase */}
      {state.phase === "GUESSING" && (
        <>
          {/* Guess history */}
          {state.guesses.length > 0 && (
            <div className="w-full">
              <p className="text-xs text-[#666] text-center mb-2">
                {state.guesses.length}/{state.maxGuesses} guesses used
              </p>
              <GuessHistory
                guesses={state.guesses}
                revealingIndex={revealingGuessIdx}
              />
            </div>
          )}

          {/* Current guess input */}
          <div className="w-full">
            <p className="text-xs text-[#888] text-center mb-2">
              Enter your {state.guesses.length + 1}
              {state.guesses.length === 0
                ? "st"
                : state.guesses.length === 1
                  ? "nd"
                  : "rd"}{" "}
              guess
            </p>
            <GuessInput currentInput={state.currentInput} shaking={shaking} />
          </div>

          {/* Hint toggle */}
          <div className="w-full">
            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 active:scale-95"
              style={{
                background: showHint ? "rgba(245, 200, 66, 0.12)" : "rgba(30, 30, 30, 0.5)",
                color: showHint ? "#f5c842" : "#888",
                border: showHint ? "1px solid rgba(245, 200, 66, 0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="4" r="0.75" fill="currentColor" />
              </svg>
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            {showHint && (
              <div className="mt-2">
                <DefinitionPanel word={state.dailyWord} />
              </div>
            )}
          </div>

          {/* Keyboard */}
          <div className="keyboard-dock sm:w-full sm:pt-1">
            <Keyboard
              onKeyPress={handleKeyPress}
              onEnter={handleEnter}
              onBackspace={handleBackspace}
              keyboardStatus={state.keyboardStatus}
              revealedLetters={[...state.selectedConsonants, state.selectedVowel]}
            />
          </div>
        </>
      )}

      {/* Reveal phase - show loading while animation plays */}
      {state.phase === "REVEAL" && (
        <p className="text-sm text-[#a0a0a0] animate-pulse">
          Revealing your letters...
        </p>
      )}

      {/* Game over result */}
      {isGameOver && (
        <>
          {/* Show final guesses */}
          <div className="w-full">
            <GuessHistory
              guesses={state.guesses}
              revealingIndex={null}
            />
          </div>

          {showResultModal && (
            <ResultModal
              won={state.phase === "WIN"}
              dailyWord={state.dailyWord}
              dateKey={state.dateKey}
              guesses={state.guesses}
              maxGuesses={state.maxGuesses}
              stats={stats}
              onPlayAgain={handlePlayAgain}
              onClose={() => setShowResultModal(false)}
            />
          )}
        </>
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </div>
  );
}
