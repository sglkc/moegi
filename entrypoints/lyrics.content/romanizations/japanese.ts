import Kuroshiro from '@sglkc/kuroshiro'
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji'
import type { RomanizationProvider } from '../romanization'

/**
 * Extension builds use chrome.runtime.getURL.
 * Under Vitest (Node), omit dictPath so kuromoji resolves package dict via fs.
 */
export function resolveJapaneseDictPath(): string | undefined {
  if (typeof process !== 'undefined' && process.env.VITEST) {
    // KuromojiAnalyzer defaults to node_modules/@sglkc/kuromoji/dict in Node
    return undefined
  }
  return chrome.runtime.getURL('/dict')
}

function createAnalyzer(): KuromojiAnalyzer {
  const dictPath = resolveJapaneseDictPath()
  return dictPath === undefined
    ? new KuromojiAnalyzer()
    : new KuromojiAnalyzer({ dictPath })
}

const kuroshiro = new Kuroshiro()
const kuromojiAnalyzer = createAnalyzer()

let initPromise: Promise<void> | null = null

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = kuroshiro.init(kuromojiAnalyzer).catch((error) => {
      // Allow retry on next convert if init fails once
      initPromise = null
      throw error
    })
  }
  return initPromise
}

const JapaneseRomanization: RomanizationProvider = {
  check: (text) => kuroshiro.Util.hasJapanese(text),
  convert: async (text, { japanese }) => {
    const newOptions: Parameters<typeof kuroshiro.convert>[1] = {
      to: japanese.to,
      mode: japanese.mode,
      delimiter_start: japanese.okuStart,
      delimiter_end: japanese.okuEnd,
      romajiSystem: japanese.system,
    }

    await ensureInitialized()
    return await kuroshiro.convert(text, newOptions)
  },
}

export default JapaneseRomanization
