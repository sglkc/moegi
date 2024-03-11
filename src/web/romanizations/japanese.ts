import Kuroshiro from '@sglkc/kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';
import { scriptElement } from '../init';
import { Romanization } from '../romanization';

const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer({
  dictPath: scriptElement.dataset.dictPath!
});

await kuroshiro.init(kuromojiAnalyzer);

const Japanese: Romanization = {
  name: 'Japanese',
  language: 'japanese',
  updateKeys: [
    'romanization', 'romanization_lang', 'to', 'mode', 'romajiSystem',
    'delimiter_end', 'delimiter_start'
  ],
  check: (text) => kuroshiro.Util.hasJapanese(text),
  convert: async (text, options) => await kuroshiro.convert(text, options),
}

export default Japanese;
