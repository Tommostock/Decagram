/**
 * Word list generator for Decagram.
 * Fetches words from dwyl/english-words (public domain) and cross-references
 * with word frequency data to pick common, recognizable answer words.
 *
 * Run: npx tsx scripts/generate-wordlist.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const WORDS_URL =
  "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

// Norvig's word frequency list (from Google Web Corpus, freely available)
const FREQ_URL =
  "https://norvig.com/ngrams/count_1w.txt";

async function main() {
  console.log("Fetching word list...");
  const [wordsResp, freqResp] = await Promise.all([
    fetch(WORDS_URL),
    fetch(FREQ_URL),
  ]);

  const wordsText = await wordsResp.text();
  const freqText = await freqResp.text();

  // Parse all 10-letter words
  const allWords = wordsText
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === 10 && /^[a-z]+$/.test(w));

  const uniqueWords = [...new Set(allWords)].sort();
  console.log(`${uniqueWords.length} unique ten-letter dictionary words`);

  // Parse frequency data: "word\tcount" per line
  const freqMap = new Map<string, number>();
  for (const line of freqText.split(/\r?\n/)) {
    const parts = line.split("\t");
    if (parts.length === 2) {
      freqMap.set(parts[0].toLowerCase(), parseInt(parts[1], 10));
    }
  }
  console.log(`Frequency list: ${freqMap.size} entries`);

  // Cross-reference: 10-letter words that appear in frequency list
  const wordSet = new Set(uniqueWords);
  const scoredWords: { word: string; freq: number }[] = [];

  for (const word of uniqueWords) {
    const freq = freqMap.get(word);
    if (freq !== undefined && freq > 0) {
      scoredWords.push({ word, freq });
    }
  }

  // Sort by frequency (most common first)
  scoredWords.sort((a, b) => b.freq - a.freq);
  console.log(`Words with frequency data: ${scoredWords.length}`);
  console.log(`Top 20: ${scoredWords.slice(0, 20).map((s) => s.word).join(", ")}`);

  // Take top 2000 by frequency as answer words
  const answerWords = scoredWords
    .slice(0, 2000)
    .map((s) => s.word)
    .sort();

  console.log(`\nAnswer words: ${answerWords.length}`);
  console.log(`Valid guess words: ${uniqueWords.length}`);
  console.log(
    `Sample answers: ${answerWords.filter((w) =>
      ["basketball", "understand", "everything", "experience", "generation",
       "impossible", "restaurant", "appreciate", "government", "tournament"].includes(w)
    ).join(", ")}`
  );

  // Write files
  const dataDir = join(__dirname, "..", "data");
  mkdirSync(dataDir, { recursive: true });

  writeFileSync(
    join(dataDir, "words-answer.json"),
    JSON.stringify(answerWords, null, 0)
  );
  writeFileSync(
    join(dataDir, "words-valid.json"),
    JSON.stringify(uniqueWords, null, 0)
  );

  console.log("Word lists written to data/");
}

main().catch(console.error);
