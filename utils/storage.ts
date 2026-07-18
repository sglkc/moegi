import { storage } from '#imports'
import { effect, signal } from '@preact/signals'
import { deepSignal } from 'deepsignal'
import { debounce } from './debounce'
import { Background } from './messaging'
import { moegiDefaultOptions, MoegiOptions } from './options'

export const optionsStorage = storage.defineItem('sync:moegiOptions', {
  init: () => moegiDefaultOptions,
  migrations: {
    2: (options) => {
      delete options.romanization?.language
      return options
    }
  },
  fallback: moegiDefaultOptions,
  version: 2,
})

// Make options reactive and save to storage on every change
export const options = deepSignal<MoegiOptions>(moegiDefaultOptions)

const hasImported = signal(false)

// Top-level await prevents build
optionsStorage.getValue().then((storedOptions) => {
  Object.assign(options, storedOptions)
  hasImported.value = true
})

const saveOptions = debounce(() => {
  optionsStorage.setValue(options)
}, 1000)

const notifyOptions = debounce(() => {
  // Background computes the change set and forwards to content scripts
  void Background.sendMessage('applyOptions', {
    changes: [],
    options: JSON.parse(JSON.stringify(options)) as MoegiOptions,
  })
}, 300)

// Save every change to storage and notify content scripts (debounced)
effect(() => {
  if (!hasImported.value) return

  // Touch nested fields so deepsignal tracks them for this effect
  void options.fonts
  void options.colors
  void options.translation
  void options.romanization

  notifyOptions()
  saveOptions()
})

/** Reset all options to defaults and persist immediately. */
export async function resetOptionsToDefaults(): Promise<void> {
  const defaults = structuredClone(moegiDefaultOptions)
  Object.assign(options, defaults)
  await optionsStorage.setValue(defaults)
}
