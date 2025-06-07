import Kuroshiro from '@sglkc/kuroshiro'
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji'
import { RomanizationProvider } from '../romanization'

const dictPath = chrome.runtime.getURL('/dict')
const kuroshiro = new Kuroshiro()
const kuromojiAnalyzer = new KuromojiAnalyzer({ dictPath })

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

    // No variables to track init, top-level await not supported
    try {
      return await kuroshiro.convert(text, newOptions)
    } catch {
      await kuroshiro.init(kuromojiAnalyzer)
      return await kuroshiro.convert(text, newOptions)
    }
  },
}

export default JapaneseRomanization
