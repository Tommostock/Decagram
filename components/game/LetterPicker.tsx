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
        <p className="text-sm text-[#a0a0a0]">
          Choose <span className="text-[#f5c842] font-semibold">{REQUIRED_CONSONANTS} consonants</span> and{" "}
          <span className="text-[#f5c842] font-semibold">{REQUIRED_VOWELS} vowel</span>
        </p>
        <p className="text-xs text-[#666]">
          These letters will be revealed in the hidden word
        </p>
      </div>

      {/* Consonants */}
      <div>
        <p className="text-xs text-[#888] uppercase tracking-wider mb-2">
          Consonants ({selectedConsonants.length}/{REQUIRED_CONSONANTS})
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {CONSONANTS.map((letter) => {
            const isSelected = selectedConsonants.includes(letter);
            const isDisabled = !isSelected && consonantsFull;

            return (
              <button
                key={letter}
                onClick={() => onSelectConsonant(letter)}
                disabled={isDisabled}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg text-sm font-bold transition-all duration-150 select-none hover:scale-110
                  ${isDisabled ? "opacity-30 cursor-not-allowed" : "active:scale-90"}
                  ${isSelected ? "animate-pulse-glow" : ""}
                `}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)"
                    : "rgba(30, 30, 30, 0.8)",
                  color: isSelected ? "#0a0a0a" : "#e8e8e8",
                  border: isSelected
                    ? "2px solid #f5c842"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected
                    ? "0 0 12px rgba(245, 200, 66, 0.3)"
                    : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vowels */}
      <div>
        <p className="text-xs text-[#888] uppercase tracking-wider mb-2">
          Vowel ({selectedVowel ? "1" : "0"}/{REQUIRED_VOWELS})
        </p>
        <div className="flex justify-center gap-2">
          {VOWELS.map((letter) => {
            const isSelected = selectedVowel === letter;
            const isDisabled = !isSelected && vowelsFull;

            return (
              <button
                key={letter}
                onClick={() => onSelectVowel(letter)}
                disabled={isDisabled}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-lg font-bold transition-all duration-150 select-none hover:scale-110
                  ${isDisabled ? "opacity-30 cursor-not-allowed" : "active:scale-90"}
                  ${isSelected ? "animate-pulse-glow" : ""}
                `}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)"
                    : "rgba(30, 30, 30, 0.8)",
                  color: isSelected ? "#0a0a0a" : "#e8e8e8",
                  border: isSelected
                    ? "2px solid #f5c842"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected
                    ? "0 0 12px rgba(245, 200, 66, 0.3)"
                    : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {letter}
              </button>
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
