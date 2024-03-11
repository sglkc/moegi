import { html, pinyin } from 'pinyin-pro'
import { Romanization } from '../romanization';

const Chinese: Romanization = {
  name: 'Chinese',
  language: 'chinese',
  updateKeys: [],
  check: (text) =>
    /[\p{Unified_Ideograph}\u3006\u3007][\ufe00-\ufe0f\u{e0100}-\u{e01ef}]?/gmu
    .test(text),
  convert: async (text, options) => options.chinese_ruby
    ? html(text, {
      pinyinClass: '',
      resultClass: '',
      chineseClass: '',
      nonChineseClass: ''
    })
    : pinyin(text),
}


export default Chinese;
