"use client";

import { useState, useEffect } from "react";

interface DictDefinition {
  partOfSpeech: string;
  definition: string;
}

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

  if (w.endsWith("ly")) {
    add(w.slice(0, -2));
    if (w.endsWith("ily")) add(w.slice(0, -3) + "y");
  }
  if (w.endsWith("ing")) {
    const stem = w.slice(0, -3);
    add(stem);
    add(stem + "e");
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  if (w.endsWith("ed")) {
    const stem = w.slice(0, -2);
    add(stem);
    add(stem + "e");
    add(w.slice(0, -1));
    if (stem.length >= 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
  if (w.endsWith("es") && !w.endsWith("ies")) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  } else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("es")) {
    add(w.slice(0, -1));
  }
  if (w.endsWith("ation")) { add(w.slice(0, -5)); add(w.slice(0, -5) + "e"); }
  if (w.endsWith("tion") && !w.endsWith("ation")) { add(w.slice(0, -4)); add(w.slice(0, -3) + "e"); }
  if (w.endsWith("ance")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ence")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("able")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ible")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("al")) { add(w.slice(0, -2)); add(w.slice(0, -2) + "e"); }
  if (w.endsWith("ment")) { add(w.slice(0, -4)); add(w.slice(0, -4) + "e"); }
  if (w.endsWith("ness")) { add(w.slice(0, -4)); if (w.endsWith("iness")) add(w.slice(0, -5) + "y"); }

  return variants;
}

function definitionRevealsTword(definition: string, targetWord: string, variants: string[]): boolean {
  const defLower = definition.toLowerCase();
  const allForms = [targetWord.toLowerCase(), ...variants];
  for (const form of allForms) {
    if (form.length < 4) continue;
    if (new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(defLower)) {
      return true;
    }
  }
  return false;
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

  return (
    <div
      className="w-full rounded-xl p-3 space-y-2"
      style={{
        background: "rgba(15, 15, 15, 0.6)",
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
