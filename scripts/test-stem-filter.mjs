function getWordVariants(word) {
  const w = word.toLowerCase();
  const seen = new Set([w]);
  const variants = [w];
  const add = (v) => {
    if (v.length >= 3 && !seen.has(v) && /^[a-z]+$/.test(v)) { seen.add(v); variants.push(v); }
  };
  if (w.endsWith("ly")) { add(w.slice(0,-2)); if (w.endsWith("ily")) add(w.slice(0,-3)+"y"); }
  if (w.endsWith("ing")) { const s=w.slice(0,-3); add(s); add(s+"e"); if(s.length>=2&&s.at(-1)===s.at(-2)) add(s.slice(0,-1)); }
  if (w.endsWith("ed")) { const s=w.slice(0,-2); add(s); add(s+"e"); add(w.slice(0,-1)); if(s.length>=2&&s.at(-1)===s.at(-2)) add(s.slice(0,-1)); }
  if (w.endsWith("ies")) add(w.slice(0,-3)+"y");
  if (w.endsWith("es")&&!w.endsWith("ies")) { add(w.slice(0,-2)); add(w.slice(0,-1)); }
  else if (w.endsWith("s")&&!w.endsWith("ss")&&!w.endsWith("es")) add(w.slice(0,-1));
  if (w.endsWith("ation")) { add(w.slice(0,-5)); add(w.slice(0,-5)+"e"); }
  if (w.endsWith("tion")&&!w.endsWith("ation")) { add(w.slice(0,-4)); add(w.slice(0,-3)+"e"); }
  if (w.endsWith("ness")) add(w.slice(0,-4));
  if (w.endsWith("iness")) add(w.slice(0,-5)+"y");
  if (w.endsWith("ment")) { add(w.slice(0,-4)); add(w.slice(0,-4)+"e"); }
  if (w.endsWith("ance")) { add(w.slice(0,-4)); add(w.slice(0,-4)+"e"); }
  if (w.endsWith("ence")) { add(w.slice(0,-4)); add(w.slice(0,-4)+"e"); }
  return variants;
}

function definitionRevealsTword(definition, targetWord) {
  const target = targetWord.toLowerCase();
  if (target.length < 4) return false;
  const formsToBlock = getWordVariants(target).filter(f => f.length >= 4);
  return formsToBlock.some(form =>
    new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(definition)
  );
}

// Test cases: [word, definition, shouldBlock]
const tests = [
  ["RETRIEVING", "To retrieve something is to get it back", true],
  ["RETRIEVING", "The act of fetching something from a location", false],
  ["SCULPTURES", "A sculpture is a three-dimensional work of art", true],
  ["SCULPTURES", "Three-dimensional works of art created by carving or shaping", false],
  ["HAPPINESS",  "The state of being happy and content", true],
  ["HAPPINESS",  "A feeling of joy, pleasure, and contentment", false],
  ["COMMITTING", "The act of committing to a course of action", true],
  ["COMMITTING", "Pledging oneself fully to a decision or obligation", false],
  ["ABSOLUTELY", "In an absolute manner; totally", true],
  ["ABSOLUTELY", "Without any qualification or restriction; entirely", false],
  ["GENERATING", "The process of generating electricity using turbines", true],
  ["GENERATING", "The process of producing power using rotating machinery", false],
  ["ADMISSIONS", "Admission to a club requires approval from existing members", true],
  ["ADMISSIONS", "Acts of acknowledging or accepting someone into a group", false],
];

let passed = 0;
for (const [word, def, expected] of tests) {
  const result = definitionRevealsTword(def, word);
  const ok = result === expected;
  if (ok) passed++;
  const stems = getWordVariants(word.toLowerCase()).filter(f => f.length >= 4);
  console.log(`${ok ? "✓ PASS" : "✗ FAIL"} [${word}] blocked=${result} expected=${expected}`);
  if (!ok) console.log(`  Definition: "${def}"`);
  console.log(`  Stems: ${stems.join(", ")}`);
}
console.log(`\n${passed}/${tests.length} tests passed`);
