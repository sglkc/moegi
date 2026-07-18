import Kuroshiro from '@sglkc/kuroshiro'
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji'
import { RomanizationProvider } from '../romanization'

const dictPath = chrome.runtime.getURL('/dict')
const kuroshiro = new Kuroshiro()
const kuromojiAnalyzer = new KuromojiAnalyzer({ dictPath })

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
