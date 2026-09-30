import anyAscii from 'any-ascii'
import type { RomanizationProvider } from '../romanization'

const AnyRomanization: RomanizationProvider = {
  check: (text) => (/([\p{L}\p{N}\s])+/u).test(text),
  convert: async (text, _) => anyAscii(text),
}

export default AnyRomanization
