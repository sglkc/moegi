import cyrillicToTranslit from 'cyrillic-to-translit-js';
import { Romanization } from '../romanization';

const Cyrillic: Romanization = {
  name: 'Cyrillic',
  language: 'cyrillic',
  updateKeys: ['cyrillic_lang'],
  check: (text) => /[\u0430-\u044f]+/igu.test(text),
  convert: async (text, options) => cyrillicToTranslit({
    preset: options.cyrillic_lang as 'ru' | 'uk'
  })
    .transform(text),
}

export default Cyrillic;
