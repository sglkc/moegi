import { romanize } from '@romanize/korean'
import { RomanizationProvider } from '../romanization'

const KoreanRomanization: RomanizationProvider = {
  check: (text) => (
    /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g
    .test(text)
  ),
  convert: async (text, { korean }) =>
    // @ts-expect-error: I HATE ENUMS!
    romanize(text, { system: korean.system })
}

export default KoreanRomanization;
