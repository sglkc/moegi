import { getScript } from 'unicode-properties'
import { RomanizationScripts } from './options'

export interface ScriptSegment {
  text: string
  script: string
}

// Function to determine if two scripts should be merged
function scriptsMergeable(script1: string, script2: string) {
  if (script1 === script2) {
    return { merge: true, resultScript: script1 }
  }

  // Merge Han with Hiragana or Katakana for Japanese
  if (
    (script1 === "Han" && (script2 === "Hiragana" || script2 === "Katakana")) ||
    ((script1 === "Hiragana" || script1 === "Katakana") && script2 === "Han")
  ) {
    // Keep the Hiragana or Katakana script, not Han
    return { merge: true, resultScript: script1 === "Han" ? script2 : script1 }
  }

  // Merge Hiragana with Katakana
  if (
    (script1 === "Hiragana" && script2 === "Katakana") ||
    (script1 === "Katakana" && script2 === "Hiragana")
  ) {
    // Keep the first script
    return { merge: true, resultScript: script1 }
  }

  return { merge: false, resultScript: null }
}

// Function to merge neighboring entries by script
function mergeByScript(entries: { text: string }[]): ScriptSegment[] {
  const merged: ScriptSegment[] = []
  let currentText = ""
  let currentScript: string | null = null

  for (const entry of entries) {
    const text = entry.text
    const script = text.length > 0 ? getScript(text[0].charCodeAt(0)) : "Common"

    if (script === "Common") {
      // Add common characters to current segment if exists
      if (currentScript !== null) {
        currentText += text
      } else {
        // If no current segment, start accumulating
        currentText += text
      }
      continue
    }

    if (currentScript === null) {
      currentScript = script
      currentText += text
    } else {
      const mergeResult = scriptsMergeable(currentScript, script)
      if (mergeResult.merge) {
        // Merge with current segment
        currentText += text
        currentScript = mergeResult.resultScript
      } else {
        // Push current segment
        merged.push({ text: currentText, script: currentScript })
        // Start new segment
        currentText = text
        currentScript = script
      }
    }
  }

  if (currentText) {
    merged.push({
      text: currentText,
      script: currentScript || "Common",
    })
  }

  return merged
}

export function splitTextByScript(text: string): ScriptSegment[] {
  // Split to characters first
  const charEntries = Array.from(text).map((char) => ({ text: char }))

  // Merge by script using unicode-script library
  return mergeByScript(charEntries)
}

// Map Unicode script names to our romanization providers
export function getProviderForScript(script: string): RomanizationScripts | 'none' {
  switch (script) {
    case 'Hiragana':
    case 'Katakana':
      return 'japanese'
    case 'Hangul':
      return 'korean'
    case 'Han':
      return 'chinese'
    case 'Cyrillic':
      return 'cyrillic'
    case 'Latin':
    case 'Common':
      return 'none' // Don't romanize Latin or common characters
    default:
      return 'any'
  }
}
