import { effect, signal } from "@preact/signals"
import { TargetedEvent } from "preact/compat"

// Define options and its type and create a signal to manage state
export type Options = {
  active: boolean
  to: 'romaji' | 'hiragana' | 'katakana'
  mode: 'normal' | 'spaced' | 'okurigana' | 'furigana'
  romajiSystem: 'hepburn' | 'nippon' | 'passport'
  delimiter_start: string
  delimiter_end: string
  hideOriginal: boolean
}

export type OptionsKey = keyof Options

const defaultOptions: Options = {
  active: false,
  to: 'romaji',
  mode: 'spaced',
  romajiSystem: 'hepburn',
  delimiter_start: '(',
  delimiter_end: ')',
  hideOriginal: false,
}

export const options = signal<Options>(defaultOptions)

// On options change save to Chrome storage, use debounce function to prevent
// max write operation errors
let effectTimeout: number | undefined

effect(() => {
  // options.value must be included to trigger effect
  (options.value)
  clearTimeout(effectTimeout)

  effectTimeout = setTimeout(() => {
    effectTimeout = undefined
    chrome.storage.sync.set({ options: options.value })
  }, 250)
})

// Get saved user options
chrome.storage.sync.get('options').then((result) => {
  options.value = Object.assign(
    {},
    options.value,
    structuredClone(result.options)
  )
})

// Event handler for any input change in popup
type FormEvent = TargetedEvent<HTMLFormElement, Event> & Readonly<{
  target: Omit<HTMLInputElement & HTMLSelectElement, 'name'> & Readonly<{
    name: OptionsKey
  }>
}>

export function formInputHandler({ target }: FormEvent) {
  const { checked, name, value } = target
  const castValue = (target.type === 'checkbox') ? Boolean(checked) : value

  options.value = Object.assign(
    {},
    options.value,
    { [name]: castValue }
  )
}

export async function resetStorageHandler() {
  await chrome.storage.sync.clear()
  await chrome.storage.sync.set({ options: defaultOptions })
}
