import { readFileSync } from "fs";
const answers = JSON.parse(readFileSync("./data/words-answer.json", "utf-8"));
const defs = JSON.parse(readFileSync("./data/word-definitions.json", "utf-8"));
const missing = answers.filter(w => !defs[w]);
console.log(JSON.stringify(missing));
