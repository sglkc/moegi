import { TranslationLanguage } from '@/types'
import ChromeStorage from '@/utils/chrome-storage'
import { signal } from '@preact/signals'

// Define moegiOptions and its type and create a signal to manage state
export type MoegiOptions = {
  styling: boolean
  lyrics_active: string
  lyrics_inactive: string
  lyrics_passed: string
  lyrics_background: string
  translation: boolean
  languageTarget: TranslationLanguage
  romanization: boolean
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
  lyrics_active: '#ffffffff',
  lyrics_inactive: '#000000ff',
  lyrics_passed: '#ffffffb3',
  lyrics_background: '#6495edff',
  translation: false,
  languageTarget: 'auto',
  romanization: false,
  to: 'romaji',
  mode: 'spaced',
  romajiSystem: 'hepburn',
  delimiter_start: '(',
  delimiter_end: ')',
  hideOriginal: false,
}

const syncStorage = new ChromeStorage('sync')
const savedOptions = await syncStorage.get<MoegiOptions>('options')
const currentOptions = Object.assign({}, moegiDefaultOptions, savedOptions)

export const moegiOptions = signal<MoegiOptions>(currentOptions)
