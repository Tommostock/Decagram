"use client";

import { CONSONANTS, VOWELS, REQUIRED_CONSONANTS, REQUIRED_VOWELS } from "@/lib/constants";
import { GoldenButton } from "@/components/ui/GoldenButton";

interface LetterPickerProps {
  selectedConsonants: string[];
  selectedVowel: string;
  onSelectConsonant: (letter: string) => void;
  onSelectVowel: (letter: string) => void;
  onConfirm: () => void;
}

export function LetterPicker({
  selectedConsonants,
  selectedVowel,
  onSelectConsonant,
  onSelectVowel,
  onConfirm,
}: LetterPickerProps) {
  const consonantsFull = selectedConsonants.length >= REQUIRED_CONSONANTS;
  const vowelsFull = selectedVowel !== "";
  const allSelected = consonantsFull && vowelsFull;

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Choose <span style={{ color: "var(--color-gold)", fontWeight: "600" }}>{REQUIRED_CONSONANTS} consonants</span> and{" "}
          <span style={{ color: "var(--color-gold)", fontWeight: "600" }}>{REQUIRED_VOWELS} vowel</span>
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          These letters will be revealed in the hidden word
        </p>
      </div>

      {/* Consonants */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
          Consonants ({selectedConsonants.length}/{REQUIRED_CONSONANTS})
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {CONSONANTS.map((letter) => {
            const isSelected = selectedConsonants.includes(letter);
            const isDisabled = !isSelected && consonantsFull;

            return (
              <div key={letter} className="relative inline-block">
                <button
                  onClick={() => onSelectConsonant(letter)}
                  disabled={isDisabled}
                  className={`glass-button w-10 h-10 sm:w-11 sm:h-11 rounded-lg text-sm font-bold transition-all duration-150 select-none hover:scale-110 relative
                    ${isDisabled ? "opacity-30 cursor-not-allowed" : "active:scale-90"}
                    ${isSelected ? "active animate-pulse-glow" : ""}
                  `}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, var(--color-gold) 0%, rgba(184, 134, 11, 0.8) 100%)"
                      : "var(--bg-subtle)",
                    color: isSelected ? "#0a0a0a" : "var(--text-primary)",
                    border: isSelected
                      ? "2px solid var(--color-gold)"
                      : "1px solid var(--border-light)",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {letter}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vowels */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
          Vowel ({selectedVowel ? "1" : "0"}/{REQUIRED_VOWELS})
        </p>
        <div className="flex justify-center gap-2">
          {VOWELS.map((letter) => {
            const isSelected = selectedVowel === letter;
            const isDisabled = !isSelected && vowelsFull;

            return (
              <div key={letter} className="relative inline-block">
                <button
                  onClick={() => onSelectVowel(letter)}
                  disabled={isDisabled}
                  className={`glass-button w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-lg font-bold transition-all duration-150 select-none hover:scale-110 relative
                    ${isDisabled ? "opacity-30 cursor-not-allowed" : "active:scale-90"}
                    ${isSelected ? "active animate-pulse-glow" : ""}
                  `}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, var(--color-gold) 0%, rgba(184, 134, 11, 0.8) 100%)"
                      : "var(--bg-subtle)",
                    color: isSelected ? "#0a0a0a" : "var(--text-primary)",
                    border: isSelected
                      ? "2px solid var(--color-gold)"
                      : "1px solid var(--border-light)",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {letter}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm button */}
      <div className="flex justify-center pt-2">
        <GoldenButton onClick={onConfirm} disabled={!allSelected} size="lg">
          Reveal Letters
        </GoldenButton>
      </div>
    </div>
  );
}
