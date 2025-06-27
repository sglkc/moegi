export const RomanizationScripts = [
  'japanese',
  'korean',
  'cyrillic',
  'chinese',
  'any',
] as const

export interface FontOptions {
  enabled: boolean
  size: number
  spacing: number
  align: 'left' | 'center' | 'right'
  hideOriginal: boolean
}

export interface ColorOptions {
  enabled: boolean
  translation: string
  romanization: string
  active: string
  inactive: string
  passed: string
  background: string
}

export interface TranslationOptions {
  enabled: boolean
  size: number
  target: string // TODO: import language from google-translate-api-x?
}

export interface RomanizationOptions {
  enabled: boolean
  size: number
  chinese: {
    ruby: boolean
  }
  cyrillic: {
    lang: 'ru' | 'uk'
  }
  korean: {
    system: 'RR' | 'MR' | 'YL'
  }
  japanese: {
    to: 'romaji' | 'hiragana' | 'katakana'
    mode: 'normal' | 'spaced' | 'okurigana' | 'furigana'
    system: 'hepburn' | 'nippon' | 'passport'
    okuStart: string
    okuEnd: string
  }
}

export interface MoegiOptions {
  fonts: FontOptions
  colors: ColorOptions
  translation: TranslationOptions
  romanization: RomanizationOptions
}

export const moegiDefaultOptions: MoegiOptions = {
  fonts: {
    enabled: false,
    size: 1,
    spacing: 5,
    align: 'left',
    hideOriginal: false,
  },
  colors: {
    enabled: false,
    translation: '',
    romanization: '',
    active: '',
    inactive: '',
    passed: '',
    background: '',
  },
  translation: {
    enabled: false,
    size: 1,
    target: 'en',
  },
  romanization: {
    enabled: false,
    size: 1,
    chinese: {
      ruby: false,
    },
    cyrillic: {
      lang: 'ru',
    },
    korean: {
      system: 'RR',
    },
    japanese: {
      to: 'romaji',
      mode: 'spaced',
      system: 'hepburn',
      okuStart: '(',
      okuEnd: ')',
    },
  },
} as const
