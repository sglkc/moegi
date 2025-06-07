import cyrillicToTranslit from 'cyrillic-to-translit-js';
import { RomanizationProvider } from '../romanization';

const CyrillicRomanization: RomanizationProvider = {
  check: (text) => /[\u0430-\u044f]+/igu.test(text),
  convert: async (text, { cyrillic }) =>
    cyrillicToTranslit({ preset: cyrillic.lang }).transform(text),
}

export default CyrillicRomanization
