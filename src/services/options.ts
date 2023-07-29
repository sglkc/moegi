import { effect, signal } from '@preact/signals'

// Define moegiOptions and its type and create a signal to manage state
export type MoegiOptions = {
  active: boolean
  to: 'romaji' | 'hiragana' | 'katakana'
  mode: 'normal' | 'spaced' | 'okurigana' | 'furigana'
  romajiSystem: 'hepburn' | 'nippon' | 'passport'
  delimiter_start: string
  delimiter_end: string
  hideOriginal: boolean
}

export type MoegiOptionsKey = keyof MoegiOptions

export const moegiOptionsDefault: MoegiOptions = {
  active: false,
  to: 'romaji',
  mode: 'spaced',
  romajiSystem: 'hepburn',
  delimiter_start: '(',
  delimiter_end: ')',
  hideOriginal: false,
}

export const moegiOptions = signal<MoegiOptions>(moegiOptionsDefault)

// On options change in popup, save to Chrome storage, use debounce function to
// prevent max write operation errors
let effectTimeout: ReturnType<typeof setTimeout> | undefined

effect(() => {
  // moegiOptions.value must be included to trigger effect
  (moegiOptions.value)
  clearTimeout(effectTimeout)

  effectTimeout = setTimeout(() => {
    effectTimeout = undefined
    chrome.storage.sync.set({ options: moegiOptions.value })
  }, 250)
})

