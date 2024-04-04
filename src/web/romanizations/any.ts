import anyAscii from 'any-ascii';
import { Romanization } from '../romanization';

const AnyAscii: Romanization = {
  name: 'Any',
  language: 'any',
  updateKeys: [],
  check: (text) => (/([\p{L}\p{N}\s])+/u).test(text),
  convert: async (text, _options) => anyAscii(text),
}


export default AnyAscii;
