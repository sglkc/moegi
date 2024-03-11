// @ts-ignore
import { romanize } from '@romanize/korean';
import { Romanization } from '../romanization';

const Korean: Romanization = {
  name: 'Korean',
  language: 'korean',
  updateKeys: [
    'romanization', 'romanization_lang', 'hangul_system'
  ],
  check: (text) => (
    /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g
    .test(text)
  ),
  convert: (text, options) => romanize(text, { system: options.hangul_system })
};

export default Korean;
