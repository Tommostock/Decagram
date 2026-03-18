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
import { LetterPicker } from "./LetterPicker";
import { WordDisplay } from "./WordDisplay";
import { GuessInput } from "./GuessInput";
import { GuessHistory } from "./GuessHistory";
import { Keyboard } from "./Keyboard";
import { ResultModal } from "./ResultModal";
import { PauseMenu } from "./PauseMenu";
import { DefinitionPanel } from "./DefinitionPanel";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { getNewlyUnlocked, loadUnlockedAchievements } from "@/lib/achievements";
import { useColorBlind } from "@/lib/color-blind-context";

type Action =
  | { type: "RESTORE"; state: GameState }
  | { type: "SELECT_CONSONANT"; letter: string }
  | { type: "SELECT_VOWEL"; letter: string }
  | { type: "CONFIRM_LETTERS" }
  | { type: "FINISH_REVEAL" }
  | { type: "TYPE_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "UNDO_INPUT" }
  | { type: "SELECT_INPUT_POSITION"; position: number }
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
      const history = [...state.inputHistory, state.currentInput].slice(-20);
      // If a position is selected, replace at that position
      if (state.selectedInputPosition !== null) {
        const chars = state.currentInput.split("");
        chars[state.selectedInputPosition] = action.letter;
        const newInput = chars.join("");
        return { ...state, currentInput: newInput, inputHistory: history, selectedInputPosition: null };
      }
      // Otherwise, append to end (normal behavior)
      if (state.currentInput.length >= WORD_LENGTH) return state;
      return { ...state, currentInput: state.currentInput + action.letter, inputHistory: history };
    }

    case "DELETE_LETTER": {
      if (state.currentInput.length === 0) return state;
      const history = [...state.inputHistory, state.currentInput].slice(-20);
      return { ...state, currentInput: state.currentInput.slice(0, -1), inputHistory: history, selectedInputPosition: null };
    }

    case "UNDO_INPUT": {
      if (state.inputHistory.length === 0) return state;
      const history = [...state.inputHistory];
      const previous = history.pop()!;
      return { ...state, currentInput: previous, inputHistory: history, selectedInputPosition: null };
    }

    case "SELECT_INPUT_POSITION": {
      return { ...state, selectedInputPosition: action.position };
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
        inputHistory: [],
        selectedInputPosition: null,
        keyboardStatus: newKeyboard,
        phase: action.newPhase,
      };
    }

    case "CLEAR_INPUT":
      return { ...state, currentInput: "", inputHistory: [], selectedInputPosition: null };

    case "GIVE_UP":
      return { ...state, phase: "LOSE", currentInput: "", inputHistory: [], selectedInputPosition: null };

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
  const [revealAllLetters, setRevealAllLetters] = useState(false);
  const [isRevealingAnswer, setIsRevealingAnswer] = useState(false);
  const [isRevealingNewCorrect, setIsRevealingNewCorrect] = useState(false);
  const [newCorrectPositions, setNewCorrectPositions] = useState<Set<number>>(new Set());
  const submittingRef = useRef(false);
  const { colorBlindMode, toggleColorBlindMode } = useColorBlind();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => loadUnlockedAchievements());

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

  // Show onboarding for first-time players
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenOnboarding = localStorage.getItem("decagram-onboarding-seen");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Physical keyboard handler
  useEffect(() => {
    if (state.phase !== "GUESSING") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) return;
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: "UNDO_INPUT" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "DELETE_LETTER" });
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
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

    // Find which positions are NEWLY correct (not already known)
    const previouslyCorrect = new Set<number>();
    for (const g of state.guesses) {
      g.results.forEach((r, idx) => {
        if (r.status === "correct") previouslyCorrect.add(idx);
      });
    }
    // Also include initially revealed positions
    for (const pos of state.revealedPositions) {
      previouslyCorrect.add(pos);
    }
    const freshCorrect = new Set<number>();
    guess.results.forEach((r, idx) => {
      if (r.status === "correct" && !previouslyCorrect.has(idx)) {
        freshCorrect.add(idx);
      }
    });

    // On WIN, suppress the result modal BEFORE dispatch so it never flashes
    if (newPhase === "WIN" && freshCorrect.size > 0) {
      setShowResultModal(false);
    }

    // Start word display animation simultaneously with guess row
    if (freshCorrect.size > 0) {
      setNewCorrectPositions(freshCorrect);
      setIsRevealingNewCorrect(true);
    }

    dispatch({ type: "SUBMIT_GUESS", guess, newPhase });
    setRevealingGuessIdx(guessIdx);

    // Wait for guess row reveal animation, then animate new correct letters in word display
    const revealTime = WORD_LENGTH * 100 + 500;
    setTimeout(() => {
      setRevealingGuessIdx(null);

      // Update stats
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

        // Check for newly unlocked achievements
        const newBadges = getNewlyUnlocked(newStats);
        if (newBadges.length > 0) {
          setUnlockedAchievements(loadUnlockedAchievements());
          for (const badge of newBadges) {
            setTimeout(() => {
              showToast(`${badge.icon} ${badge.name} unlocked!`);
            }, 500);
          }
        }
      }

      // Clear word display animation (it started simultaneously with guess row)
      if (freshCorrect.size > 0) {
        setIsRevealingNewCorrect(false);
        setNewCorrectPositions(new Set());
        if (newPhase === "WIN") {
          setTimeout(() => setShowResultModal(true), 500);
        }
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
    setShowHint(false);
    setRevealAllLetters(false);
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

    // Suppress result modal BEFORE dispatch so it doesn't flash
    setShowResultModal(false);
    dispatch({ type: "GIVE_UP" });
    setIsPaused(false);
    // Reveal all letters on the board with animation, then show the result modal
    setRevealAllLetters(true);
    setIsRevealingAnswer(true);
    // Last tile starts flipping at (WORD_LENGTH-1)*150, takes 375ms to flip,
    // then pause 1500ms so the user can read the full word before the modal
    const totalDelay = (WORD_LENGTH - 1) * 150 + 375 + 1500;
    setTimeout(() => {
      setIsRevealingAnswer(false);
      setShowResultModal(true);
    }, totalDelay);
  }, [stats, dateKey]);

  const handleStartNewGame = useCallback(() => {
    const newSeed = Math.random().toString(36).slice(2, 8);
    setShowResultModal(true);
    setShowHint(false);
    setRevealAllLetters(false);
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

  const canPause = state.phase === "REVEAL" || state.phase === "GUESSING" || (isGameOver && !showResultModal);

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col items-center gap-4 ${state.phase === "GUESSING" ? "pb-[190px] sm:pb-0" : ""}`}>
      {/* Pause menu overlay */}
      {isPaused && (
        <PauseMenu
          onResume={handleResume}
          onStartNewGame={handleStartNewGame}
          onRevealAnswer={handleRevealAnswer}
          isGameOver={isGameOver}
          colorBlindMode={colorBlindMode}
          onToggleColorBlind={toggleColorBlindMode}
          unlockedAchievements={unlockedAchievements}
        />
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-center mb-2 px-1 relative">
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
              color: "var(--text-muted)",
            }}
          >
            DAILY 10-LETTER PUZZLE
          </p>
          <p className="text-[10px] tracking-wider mt-1.5 flex items-center justify-center gap-1">
            <span style={{ color: "var(--text-dim)" }}>Made by</span>
            <a
              href="https://www.youtube.com/spektator"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: '"True Lies", cursive',
                color: "#D22223",
                fontSize: "12px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Spektator
            </a>
          </p>
        </div>
        {/* Pause button — only visible when game is active */}
        {canPause ? (
          <button
            onClick={() => setIsPaused(true)}
            className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90"
            style={{
              background: "var(--bg-header-btn)",
              border: "1px solid var(--border-light)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-header-btn-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-header-btn)";
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
        ) : null}
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
            revealAll={revealAllLetters}
            isRevealingAnswer={isRevealingAnswer}
            isRevealingNewCorrect={isRevealingNewCorrect}
            newCorrectPositions={newCorrectPositions}

            colorBlind={colorBlindMode}
          />
          {/* Selected letters info */}
          <div className="mt-3 flex justify-center gap-1.5">
            {[...state.selectedConsonants, state.selectedVowel]
              .filter(Boolean)
              .map((l) => {
                const isInWord = state.phase !== "LETTER_SELECTION" &&
                  state.revealedPositions.some(pos => state.dailyWord[pos]?.toUpperCase() === l.toUpperCase());
                const showDimmed = state.phase !== "LETTER_SELECTION" && state.phase !== "REVEAL" && !isInWord;
                return (
                  <span
                    key={l}
                    className="text-xs px-2 py-0.5 rounded transition-opacity duration-500"
                    style={{
                      background: showDimmed ? "rgba(100, 100, 100, 0.1)" : "rgba(245, 200, 66, 0.1)",
                      color: showDimmed ? "#666" : "#f5c842",
                      border: showDimmed ? "1px solid rgba(100, 100, 100, 0.2)" : "1px solid rgba(245, 200, 66, 0.2)",
                      opacity: showDimmed ? 0.5 : 1,
                      textDecoration: showDimmed ? "line-through" : "none",
                    }}
                  >
                    {l}
                  </span>
                );
              })}
          </div>
        </GlassPanel>
      )}

      {/* Letter selection phase */}
      {state.phase === "LETTER_SELECTION" && (
        <GlassPanel className="w-full phase-enter">
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
        <div className="contents phase-enter">
          {/* Guess history */}
          {state.guesses.length > 0 && (
            <div className="w-full">
              <p className="text-xs text-center mb-2" style={{ color: "var(--text-muted)" }}>
                {state.guesses.length}/{state.maxGuesses} guesses used
              </p>
              <GuessHistory
                guesses={state.guesses}
                revealingIndex={revealingGuessIdx}
                colorBlind={colorBlindMode}
              />
            </div>
          )}

          {/* Current guess input */}
          <div className="w-full">
            <p className="text-xs text-center mb-2" style={{ color: "var(--text-dim)" }}>
              Enter your {state.guesses.length + 1}
              {state.guesses.length === 0
                ? "st"
                : state.guesses.length === 1
                  ? "nd"
                  : "rd"}{" "}
              guess
            </p>
            <GuessInput
              currentInput={state.currentInput}
              shaking={shaking}
              onLetterClick={(pos) => dispatch({ type: "SELECT_INPUT_POSITION", position: pos })}
              selectedPosition={state.selectedInputPosition ?? undefined}
            />
          </div>

          {/* Hint toggle */}
          <div className="w-full">
            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 active:scale-95"
              style={{
                background: showHint ? "rgba(245, 200, 66, 0.12)" : "var(--bg-subtle)",
                color: showHint ? "#f5c842" : "var(--text-dim)",
                border: showHint ? "1px solid rgba(245, 200, 66, 0.3)" : "1px solid var(--border-light)",
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
              revealedLetters={[...state.selectedConsonants, state.selectedVowel].filter(
                l => state.revealedPositions.some(pos => state.dailyWord[pos]?.toUpperCase() === l.toUpperCase())
              )}
              missedLetters={[...state.selectedConsonants, state.selectedVowel].filter(
                l => l && !state.revealedPositions.some(pos => state.dailyWord[pos]?.toUpperCase() === l.toUpperCase())
              )}
              colorBlind={colorBlindMode}
            />
          </div>
        </div>
      )}

      {/* Game over result */}
      {isGameOver && (
        <div className="contents phase-enter-scale">
          {/* Show final guesses */}
          <div className="w-full">
            <GuessHistory
              guesses={state.guesses}
              revealingIndex={revealingGuessIdx}
              colorBlind={colorBlindMode}
            />
          </div>

          {showResultModal ? (
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
          ) : (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePlayAgain}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "linear-gradient(180deg, #f5c842, #b8860b)",
                  color: "#1a1a1a",
                }}
              >
                Play Again
              </button>
              <button
                onClick={() => setShowResultModal(true)}
                className="px-6 py-3 rounded-xl font-bold text-sm border transition-all"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#e8e8e8",
                  background: "rgba(40,40,40,0.8)",
                }}
              >
                View Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Onboarding tutorial for first-time players */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem("decagram-onboarding-seen", "true");
          }}
        />
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </div>
  );
}
