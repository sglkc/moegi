import { TranslationLanguage } from '@/types'
import ChromeStorage from '@/utils/chrome-storage'
import { signal } from '@preact/signals'

// Define moegiOptions and its type and create a signal to manage state
export type MoegiOptions = {
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
