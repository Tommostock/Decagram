/**
 * Tests every word in words-answer.json against the dictionary API
 * using the same logic as DefinitionPanel.tsx.
 * Outputs a JSON file listing words with no usable definition.
 *
 * Usage: node scripts/find-missing-definitions.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const words = JSON.parse(
  readFileSync(join(__dirname, "../data/words-answer.json"), "utf8")
);

// ── Mirror of the variant logic in DefinitionPanel.tsx ──────────────────────
function getWordVariants(word) {
  const w = word.toLowerCase();
  const seen = new Set([w]);
  const variants = [w];

  const add = (v) => {
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

function definitionRevealsTword(definition, targetWord, variants) {
  const defLower = definition.toLowerCase();
  const allForms = [targetWord.toLowerCase(), ...variants];
  for (const form of allForms) {
    if (form.length < 4) continue;
    if (new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(defLower)) {
      return true;
    }
  }
  return false;
}

async function hasDefinition(word) {
  const variants = getWordVariants(word);
  for (const variant of variants) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${variant}`
      );
      if (!res.ok) continue;
      const data = await res.json();

      for (const entry of data) {
        for (const meaning of entry.meanings) {
          for (const def of meaning.definitions) {
            if (!definitionRevealsTword(def.definition, word, variants)) {
              return { found: true, via: variant, def: def.definition };
            }
          }
        }
      }
    } catch {
      continue;
    }
  }
  return { found: false };
}

// ── Run in batches to avoid hammering the API ────────────────────────────────
const BATCH = 5;
const DELAY_MS = 400;

const failing = [];
const total = words.length;

for (let i = 0; i < total; i += BATCH) {
  const batch = words.slice(i, i + BATCH);
  const results = await Promise.all(batch.map((w) => hasDefinition(w)));

  results.forEach((r, j) => {
    const word = batch[j];
    if (!r.found) {
      failing.push(word);
      console.log(`✗ ${word}`);
    }
  });

  const pct = Math.min(i + BATCH, total);
  process.stdout.write(`\r  Progress: ${pct}/${total} (${failing.length} failing so far)  `);

  if (i + BATCH < total) {
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
}

console.log(`\n\nDone. ${failing.length} words with no usable definition:`);
console.log(failing);

writeFileSync(
  join(__dirname, "../data/missing-definitions.json"),
  JSON.stringify(failing.sort(), null, 2)
);
console.log("\nSaved to data/missing-definitions.json");
