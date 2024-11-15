import { TranslationLanguage } from '@/types'
import ChromeStorage from '@/utils/chrome-storage'
import { signal } from '@preact/signals'

// Define moegiOptions and its type and create a signal to manage state
export type MoegiOptions = {
  styling: boolean
  lyrics_size: number
  lyrics_spacing: number
  lyrics_align: 'left' | 'center' | 'right'
  lyrics_translated: string
  lyrics_romanized: string
  lyrics_active: string
  lyrics_inactive: string
  lyrics_passed: string
  lyrics_background: string
  translation: boolean
  translation_size: number
  languageTarget: TranslationLanguage
  romanization: boolean
  romanization_lang: 'japanese' | 'korean' | 'cyrillic' | 'chinese' | 'any'
  romanization_size: number
  chinese_ruby: boolean
  cyrillic_lang: 'ru' | 'uk'
  hangul_system: 'RR' | 'MR' | 'YL'
  to: 'romaji' | 'hiragana' | 'katakana'
  mode: 'normal' | 'spaced' | 'okurigana' | 'furigana'
  romajiSystem: 'hepburn' | 'nippon' | 'passport'
  delimiter_start: string
  delimiter_end: string
  hideOriginal: boolean
}

export type MoegiOptionsKey = keyof MoegiOptions

export const moegiDefaultOptions: MoegiOptions = {
  styling: false,
  lyrics_size: 1,
  lyrics_spacing: 5,
  lyrics_align: 'left',
  lyrics_translated: '',
  lyrics_romanized: '',
  lyrics_active: '',
  lyrics_inactive: '',
  lyrics_passed: '',
  lyrics_background: '',
  translation: false,
  translation_size: 1,
  languageTarget: 'auto',
  romanization: false,
  romanization_lang: 'japanese',
  romanization_size: 1,
  chinese_ruby: false,
  cyrillic_lang: 'ru',
  hangul_system: 'RR',
  to: 'romaji',
  mode: 'spaced',
  romajiSystem: 'hepburn',
  delimiter_start: '(',
  delimiter_end: ')',
  hideOriginal: false,
} as const

const syncStorage = new ChromeStorage('sync')
const savedOptions = await syncStorage.get<MoegiOptions>('options')
const currentOptions = Object.assign({}, moegiDefaultOptions, savedOptions)

export const moegiOptions = signal<MoegiOptions>(currentOptions)
