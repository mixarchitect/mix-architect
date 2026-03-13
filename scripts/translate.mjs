#!/usr/bin/env node
/**
 * Translation script for Mix Architect i18n
 * Uses Claude Opus to translate en.json into all target languages.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/translate.mjs
 *
 * Options:
 *   --lang=de        Translate only one language
 *   --dry-run        Print prompt without calling API
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, "..", "src", "i18n", "messages");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 16384;

// Target languages and their message file names
const TARGETS = [
  { file: "de", lang: "German", locale: "de-DE" },
  { file: "fr", lang: "French", locale: "fr-FR" },
  { file: "es", lang: "Spanish (Spain)", locale: "es-ES" },
  { file: "es-MX", lang: "Spanish (Mexico)", locale: "es-MX" },
  { file: "pt-BR", lang: "Brazilian Portuguese", locale: "pt-BR" },
  { file: "sv", lang: "Swedish", locale: "sv-SE" },
  { file: "hi", lang: "Hindi", locale: "hi-IN" },
  { file: "ja", lang: "Japanese", locale: "ja-JP" },
  { file: "ko", lang: "Korean", locale: "ko-KR" },
  { file: "zh", lang: "Simplified Chinese", locale: "zh-CN" },
];

function buildPrompt(enJson, lang, locale) {
  return `You are a professional translator for a music production SaaS app called "Mix Architect". Translate the following JSON from English to ${lang} (${locale}).

RULES:
1. Return ONLY the translated JSON object. No markdown, no code fences, no explanation.
2. Preserve ALL JSON keys exactly as-is (keys are never translated).
3. Preserve ALL ICU message syntax placeholders like {title}, {count}, {count, plural, one {# release} other {# releases}} etc. Translate the text around/inside them but keep the variable names and ICU syntax intact.
4. Keep brand names untranslated: "Mix Architect", "Pro", "Dolby Atmos", "DistroKid", "TuneCore", "Interscope", "Spotify", "Apple Music", "YouTube", "Tidal".
5. Keep technical terms that are universally understood: "EP", "UPC", "EAN", "ISRC", "WAV", "FLAC", "MP3".
6. For ${lang}, use the natural, idiomatic phrasing a native speaker in ${locale} would expect in a modern software UI. Use the appropriate formality level (e.g., "vous" for French, "Sie" or informal as fits a creative tool).
7. Keep the same JSON structure and nesting.
8. Do NOT add or remove any keys.
9. Do NOT use em-dashes. Use commas or periods instead.
10. For currency display strings like "$14/month", adapt the format naturally but keep the dollar amount (it's a USD price).
11. Translate ALL-CAPS section headers (like "PAYMENT", "DISTRIBUTION", "CLIENT INFO") to the equivalent ALL-CAPS in the target language.

Here is the English source JSON:

${enJson}`;
}

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty response from API");
  return text;
}

function extractJson(text) {
  // Strip markdown fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

function validateKeys(source, translated, path = "") {
  const sourceKeys = Object.keys(source).sort();
  const translatedKeys = Object.keys(translated).sort();

  const missing = sourceKeys.filter((k) => !translatedKeys.includes(k));
  const extra = translatedKeys.filter((k) => !sourceKeys.includes(k));

  const issues = [];
  if (missing.length) issues.push(`Missing keys at ${path || "root"}: ${missing.join(", ")}`);
  if (extra.length) issues.push(`Extra keys at ${path || "root"}: ${extra.join(", ")}`);

  for (const key of sourceKeys) {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (typeof translated[key] === "object" && translated[key] !== null) {
        issues.push(...validateKeys(source[key], translated[key], `${path}.${key}`));
      } else if (translated[key] !== undefined) {
        issues.push(`Type mismatch at ${path}.${key}: expected object, got ${typeof translated[key]}`);
      }
    }
  }

  return issues;
}

async function translateOne(enSource, enJson, target, dryRun) {
  const prompt = buildPrompt(enJson, target.lang, target.locale);

  if (dryRun) {
    console.log(`\n--- ${target.lang} (${target.file}) ---`);
    console.log(`Prompt length: ${prompt.length} chars`);
    return;
  }

  console.log(`  Translating to ${target.lang} (${target.file})...`);
  const startTime = Date.now();

  const rawResponse = await callClaude(prompt);
  const translated = extractJson(rawResponse);

  // Validate structure
  const issues = validateKeys(enSource, translated);
  if (issues.length) {
    console.warn(`  ⚠ Validation issues for ${target.file}:`);
    issues.forEach((i) => console.warn(`    - ${i}`));
  }

  // Write file
  const outPath = join(MESSAGES_DIR, `${target.file}.json`);
  await writeFile(outPath, JSON.stringify(translated, null, 2) + "\n", "utf-8");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  ✓ ${target.file}.json written (${elapsed}s)`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const langFlag = args.find((a) => a.startsWith("--lang="));
  const singleLang = langFlag ? langFlag.split("=")[1] : null;

  if (!API_KEY && !dryRun) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required.");
    console.error("Usage: ANTHROPIC_API_KEY=sk-... node scripts/translate.mjs");
    process.exit(1);
  }

  // Read source
  const enJson = await readFile(join(MESSAGES_DIR, "en.json"), "utf-8");
  const enSource = JSON.parse(enJson);

  await mkdir(MESSAGES_DIR, { recursive: true });

  const targets = singleLang
    ? TARGETS.filter((t) => t.file === singleLang)
    : TARGETS;

  if (targets.length === 0) {
    console.error(`Unknown language: ${singleLang}`);
    console.error(`Available: ${TARGETS.map((t) => t.file).join(", ")}`);
    process.exit(1);
  }

  console.log(`Translating en.json → ${targets.map((t) => t.file).join(", ")}`);
  console.log(`Model: ${MODEL}`);
  if (dryRun) console.log("(dry run)");

  // Run translations sequentially to avoid rate limits
  for (const target of targets) {
    try {
      await translateOne(enSource, enJson, target, dryRun);
    } catch (err) {
      console.error(`  ✗ Failed for ${target.file}: ${err.message}`);
      if (err.message.includes("429")) {
        console.log("  Rate limited. Waiting 60s...");
        await new Promise((r) => setTimeout(r, 60000));
        // Retry once
        try {
          await translateOne(enSource, enJson, target, dryRun);
        } catch (retryErr) {
          console.error(`  ✗ Retry failed for ${target.file}: ${retryErr.message}`);
        }
      }
    }
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
