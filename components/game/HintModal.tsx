"use client";

import { useState, useEffect } from "react";

interface HintModalProps {
  word: string;
  onClose: () => void;
}

interface DictDefinition {
  partOfSpeech: string;
  definition: string;
}

/**
 * Generates an ordered list of word forms to try against the dictionary API.
 * The exact word is tried first; progressively simpler base forms follow so
 * that inflected 10-letter words (gerunds, adverbs, plurals, etc.) can still
 * return a useful definition.
 */
function getWordVariants(word: string): string[] {
  const w = word.toLowerCase();
  const seen = new Set<string>([w]);
  const variants: string[] = [w];

  const add = (v: string) => {
    if (v.length >= 3 && !seen.has(v) && /^[a-z]+$/.test(v)) {
      seen.add(v);
      variants.push(v);
    }
  };

  // -LY adverbs → base adjective  (absolutely → absolute, adequately → adequate)
  if (w.endsWith("ly")) {
    add(w.slice(0, -2));
    if (w.endsWith("ily")) add(w.slice(0, -3) + "y"); // happily → happy
  }

  // -ING gerunds → base verb  (abandoning → abandon, activating → activate)
  if (w.endsWith("ing")) {
    const stem = w.slice(0, -3);
    add(stem);
    add(stem + "e");
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) {
      add(stem.slice(0, -1)); // committing → commit (doubled consonant)
    }
  }

  // -ED past participle / adjective  (accredited → accredit, calculated → calculate)
  if (w.endsWith("ed")) {
    const stem = w.slice(0, -2);
    add(stem);
    add(stem + "e");
    add(w.slice(0, -1));
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) {
      add(stem.slice(0, -1)); // submitted → submit
    }
  }

  // -IES plurals → -Y singular  (activities → activity, batteries → battery)
  if (w.endsWith("ies")) {
    add(w.slice(0, -3) + "y");
  }

  // -ES / -S plurals
  if (w.endsWith("es") && !w.endsWith("ies")) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  } else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("es")) {
    add(w.slice(0, -1)); // addictions → addiction
  }

  // -ATION nouns → base verb  (adaptation → adapt, accusation → accuse)
  if (w.endsWith("ation")) {
    add(w.slice(0, -5));
    add(w.slice(0, -5) + "e");
  }

  // -TION / -SION nouns  (absorption → absorb is tricky; try anyway)
  if (w.endsWith("tion") && !w.endsWith("ation")) {
    add(w.slice(0, -4));
    add(w.slice(0, -3) + "e");
  }

  // -ANCE / -ENCE nouns → base  (acceptance → accept, accordance → accord)
  if (w.endsWith("ance")) {
    add(w.slice(0, -4));
    add(w.slice(0, -4) + "e");
  }
  if (w.endsWith("ence")) {
    add(w.slice(0, -4));
    add(w.slice(0, -4) + "e");
  }

  // -ABLE / -IBLE adjectives → base verb  (acceptable → accept, achievable → achieve)
  if (w.endsWith("able")) {
    add(w.slice(0, -4));
    add(w.slice(0, -4) + "e");
  }
  if (w.endsWith("ible")) {
    add(w.slice(0, -4));
    add(w.slice(0, -4) + "e");
  }

  // -AL adjectives → base noun  (additional → addition, acoustical → acoustic)
  if (w.endsWith("al")) {
    add(w.slice(0, -2));
    add(w.slice(0, -2) + "e");
  }

  // -MENT nouns → base verb  (adjustment → adjust, achievement → achieve)
  if (w.endsWith("ment")) {
    add(w.slice(0, -4));
    add(w.slice(0, -4) + "e");
  }

  // -NESS nouns → base adjective  (awareness → aware, happiness → happy)
  if (w.endsWith("ness")) {
    add(w.slice(0, -4));
    if (w.endsWith("iness")) add(w.slice(0, -5) + "y");
  }

  return variants;
}

/**
 * Returns true if the definition text contains the target word or a close variant.
 * Used to filter out definitions that give away the answer.
 */
function definitionRevealsTword(definition: string, targetWord: string, variants: string[]): boolean {
  const defLower = definition.toLowerCase();
  const allForms = [targetWord.toLowerCase(), ...variants];
  for (const form of allForms) {
    if (form.length < 4) continue;
    // Match the form as a word-boundary prefix (catches plurals, -ed, -ing etc.)
    if (new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(defLower)) {
      return true;
    }
  }
  return false;
}

export function HintModal({ word, onClose }: HintModalProps) {
  const [definitions, setDefinitions] = useState<DictDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDefinition = async () => {
      const variants = getWordVariants(word);

      for (const variant of variants) {
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${variant}`
          );
          if (!res.ok) continue;
          const data = await res.json();

          const defs: DictDefinition[] = [];
          for (const entry of data) {
            for (const meaning of entry.meanings) {
              for (const def of meaning.definitions) {
                if (defs.length >= 3) break;
                // Skip definitions that contain the target word or its variants
                if (definitionRevealsTword(def.definition, word, variants)) continue;
                defs.push({
                  partOfSpeech: meaning.partOfSpeech,
                  definition: def.definition,
                });
              }
              if (defs.length >= 3) break;
            }
            if (defs.length >= 3) break;
          }

          if (defs.length > 0) {
            setDefinitions(defs);
            setLoading(false);
            return;
          }
        } catch {
          continue;
        }
      }

      setError(true);
      setLoading(false);
    };

    fetchDefinition();
  }, [word]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-white/[0.08] p-5 space-y-4 transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"
        }`}
        style={{
          background: "rgba(15, 15, 15, 0.97)",
          backdropFilter: "blur(24px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6" stroke="#f5c842" strokeWidth="1.5" />
              <path d="M7 6v4" stroke="#f5c842" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="7" cy="4" r="0.75" fill="#f5c842" />
            </svg>
            <p
              className="text-sm font-bold tracking-widest"
              style={{
                background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              HINT
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-md transition-all duration-150 active:scale-90"
            style={{
              color: "#666",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: "#f5c842", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-center py-4" style={{ color: "#888" }}>
            No definition found for this word.
          </p>
        )}

        {!loading && !error && definitions.length > 0 && (
          <div className="space-y-3">
            {definitions.map((def, i) => (
              <div key={i} className="space-y-0.5">
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: "#f5c842", opacity: 0.7 }}
                >
                  {def.partOfSpeech}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "#c0c0c0" }}>
                  {def.definition}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-center pt-1" style={{ color: "#444" }}>
          Tap anywhere outside to close
        </p>
      </div>
    </div>
  );
}
