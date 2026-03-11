"use client";

import { useState, useEffect } from "react";
import staticDefs from "@/data/word-definitions.json";

interface DictDefinition {
  partOfSpeech: string;
  definition: string;
}

// Generates candidate lookup forms from a 10-letter inflected/derived word.
// The API is tried in order — first match with a usable definition wins.
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

  // -ly / -ily adverbs
  if (w.endsWith("ly")) {
    add(w.slice(0, -2));
    if (w.endsWith("ily")) add(w.slice(0, -3) + "y");
  }
  // -ing present participles
  if (w.endsWith("ing")) {
    const stem = w.slice(0, -3);
    add(stem);
    add(stem + "e");
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  // -ed past tenses
  if (w.endsWith("ed")) {
    const stem = w.slice(0, -2);
    add(stem);
    add(stem + "e");
    add(w.slice(0, -1));
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  // plurals / third-person -s
  if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
  if (w.endsWith("es") && !w.endsWith("ies")) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  } else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("es")) {
    add(w.slice(0, -1));
  }
  // noun/verb suffixes
  if (w.endsWith("ation")) { add(w.slice(0, -5)); add(w.slice(0, -5) + "e"); }
  if (w.endsWith("tion") && !w.endsWith("ation")) { add(w.slice(0, -4)); add(w.slice(0, -3) + "e"); }
  if (w.endsWith("ance")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ence")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("able")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ible")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ment")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ness")) { add(w.slice(0, -4)); }
  if (w.endsWith("iness")) add(w.slice(0, -5) + "y");
  // -ical / -al adjectives
  if (w.endsWith("ical")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "y"); }
  else if (w.endsWith("al") && w.length > 5) { add(w.slice(0, -2)); add(w.slice(0, -2) + "e"); }
  // -ator agent nouns (alternator → alternate)
  if (w.endsWith("ator")) { add(w.slice(0, -2)); add(w.slice(0, -2) + "e"); }
  // -ive adjectives (aggressive → aggress, attractive → attract)
  if (w.endsWith("ive")) { add(w.slice(0, -3)); add(w.slice(0, -3) + "e"); }
  // -ism (alcoholism → alcohol)
  if (w.endsWith("ism")) add(w.slice(0, -3));
  // -ist (antagonist → antagonize)
  if (w.endsWith("ist")) { add(w.slice(0, -3)); add(w.slice(0, -3) + "ize"); }
  // -iser / -izer agent nouns (advertiser → advertise)
  if (w.endsWith("iser") || w.endsWith("izer")) { add(w.slice(0, -2)); add(w.slice(0, -2) + "e"); }
  // -ier comparative (carrier → carry)
  if (w.endsWith("ier") && w.length > 6) add(w.slice(0, -3) + "y");
  // -atory (celebratory → celebrate)
  if (w.endsWith("atory")) { add(w.slice(0, -5)); add(w.slice(0, -5) + "e"); }
  // -ory (ambulatory handled above; others like sensory → sense)
  else if (w.endsWith("ory") && w.length > 7) { add(w.slice(0, -3)); add(w.slice(0, -3) + "e"); }

  return variants;
}

// Only block the definition if it contains the EXACT target word.
// Allowing stem forms to appear is fine — seeing "retrieve" doesn't give away "RETRIEVING".
function definitionRevealsTword(definition: string, targetWord: string): boolean {
  const target = targetWord.toLowerCase();
  if (target.length < 4) return false;
  return new RegExp(
    `\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "i"
  ).test(definition);
}

interface DefinitionPanelProps {
  word: string;
}

export function DefinitionPanel({ word }: DefinitionPanelProps) {
  const [definitions, setDefinitions] = useState<DictDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setDefinitions([]);

    const fetchDefinition = async () => {
      const variants = getWordVariants(word);

      // Try the Free Dictionary API for each variant
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
                if (definitionRevealsTword(def.definition, word)) continue;
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

      // API had nothing usable — fall back to static definitions
      const staticEntry = (staticDefs as Record<string, DictDefinition[]>)[word.toLowerCase()];
      if (staticEntry && staticEntry.length > 0) {
        setDefinitions(staticEntry.slice(0, 3));
        setLoading(false);
        return;
      }

      setError(true);
      setLoading(false);
    };

    fetchDefinition();
  }, [word]);

  return (
    <div
      className="w-full rounded-xl p-3 space-y-2"
      style={{
        background: "var(--bg-glass)",
        border: "1px solid rgba(245, 200, 66, 0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6" stroke="#f5c842" strokeWidth="1.5" />
          <path d="M7 6v4" stroke="#f5c842" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="4" r="0.75" fill="#f5c842" />
        </svg>
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #f5c842 0%, #d4a527 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Definition
        </span>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-2">
          <div
            className="w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: "#f5c842", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-center py-1" style={{ color: "#666" }}>
          No definition available.
        </p>
      )}

      {!loading && !error && definitions.length > 0 && (
        <div className="space-y-2">
          {definitions.map((def, i) => (
            <div key={i} className="space-y-0.5">
              <span
                className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color: "#f5c842", opacity: 0.7 }}
              >
                {def.partOfSpeech}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "#b0b0b0" }}>
                {def.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
