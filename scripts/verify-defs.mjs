import { readFileSync } from "fs";

const answers = JSON.parse(readFileSync("./data/words-answer.json", "utf-8"));
const defs = JSON.parse(readFileSync("./data/word-definitions.json", "utf-8"));

// 1. Check coverage
const missing = answers.filter(w => !defs[w]);
console.log(`=== COVERAGE ===`);
console.log(`Answer words: ${answers.length}`);
console.log(`Definitions: ${Object.keys(defs).length}`);
console.log(`Missing: ${missing.length}`);
if (missing.length > 0) {
  console.log(`Missing words: ${missing.join(", ")}`);
}
console.log(`Coverage: ${((answers.length - missing.length) / answers.length * 100).toFixed(1)}%`);

// 2. Check for circular definitions (word appears in its own definition)
console.log(`\n=== CIRCULAR DEFINITIONS ===`);
let circularCount = 0;
for (const [word, entries] of Object.entries(defs)) {
  for (const entry of entries) {
    const def = entry.definition.toLowerCase();
    const target = word.toLowerCase();
    // Check exact word match (word boundary)
    const regex = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(def)) {
      console.log(`CIRCULAR: "${word}" -> "${entry.definition}"`);
      circularCount++;
    }
  }
}
console.log(`Circular definitions found: ${circularCount}`);

// 3. Check for definitions containing common derivations
console.log(`\n=== DERIVATION CHECK (stems in definitions) ===`);
let derivCount = 0;
for (const [word, entries] of Object.entries(defs)) {
  const w = word.toLowerCase();
  // Check common stems
  const stems = [w];
  if (w.endsWith("ing")) stems.push(w.slice(0, -3), w.slice(0, -3) + "e");
  if (w.endsWith("ed")) stems.push(w.slice(0, -2), w.slice(0, -2) + "e", w.slice(0, -1));
  if (w.endsWith("tion")) stems.push(w.slice(0, -4), w.slice(0, -4) + "e");
  if (w.endsWith("ness")) stems.push(w.slice(0, -4));
  if (w.endsWith("ment")) stems.push(w.slice(0, -4));
  if (w.endsWith("ly")) stems.push(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss")) stems.push(w.slice(0, -1));
  if (w.endsWith("es")) stems.push(w.slice(0, -2));
  if (w.endsWith("ies")) stems.push(w.slice(0, -3) + "y");

  for (const entry of entries) {
    const def = entry.definition.toLowerCase();
    for (const stem of stems) {
      if (stem.length >= 5) { // Only check stems of reasonable length
        const regex = new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
        if (regex.test(def)) {
          console.log(`STEM "${stem}" in "${word}": "${entry.definition.substring(0, 80)}..."`);
          derivCount++;
          break;
        }
      }
    }
  }
}
console.log(`Definitions with stem matches: ${derivCount}`);

// 4. Check for empty or too-short definitions
console.log(`\n=== QUALITY CHECK ===`);
let shortCount = 0;
for (const [word, entries] of Object.entries(defs)) {
  for (const entry of entries) {
    if (!entry.definition || entry.definition.length < 15) {
      console.log(`SHORT: "${word}" -> "${entry.definition}"`);
      shortCount++;
    }
  }
}
console.log(`Short definitions (<15 chars): ${shortCount}`);

// 5. Check for orphan definitions (not in answer list)
const answerSet = new Set(answers);
const orphans = Object.keys(defs).filter(w => !answerSet.has(w));
console.log(`\nOrphan definitions (not in answer list): ${orphans.length}`);
if (orphans.length > 0) console.log(`  ${orphans.join(", ")}`);

console.log(`\n=== SUMMARY ===`);
console.log(`Coverage: ${missing.length === 0 ? "PASS (100%)" : "FAIL"}`);
console.log(`Circulars: ${circularCount === 0 ? "PASS (0 found)" : "FAIL (" + circularCount + " found)"}`);
console.log(`Quality: ${shortCount === 0 ? "PASS" : "FAIL (" + shortCount + " short)"}`);
