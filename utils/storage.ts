import { storage } from '#imports'
import { effect, signal } from '@preact/signals'
import { deepSignal } from 'deepsignal'
import { debounce } from './debounce'
import { Background } from './messaging'
import { mergeStoredOptions } from './merge-options'
import { moegiDefaultOptions, MoegiOptions } from './options'
import { resetOptionsToDefaults as applyReset } from './reset-options'

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

function snapshotOptions(): MoegiOptions {
  return JSON.parse(JSON.stringify(options)) as MoegiOptions
}

// Top-level await prevents build
optionsStorage.getValue().then((storedOptions) => {
  mergeStoredOptions(options, storedOptions)
  hasImported.value = true
})

// Persist less aggressively than live apply (sync quota + disk)
const saveOptions = debounce(() => {
  void optionsStorage.setValue(snapshotOptions()).catch((err) => {
    console.debug('optionsStorage.setValue failed', err)
  })
}, 400)

// Notify content path quickly so UI feels live
const notifyOptions = debounce(() => {
  void Background.sendMessage('applyOptions', {
    changes: [],
    options: snapshotOptions(),
  }).catch((err) => {
    // SW may be restarting; next change retries
    console.debug('notifyOptions applyOptions failed', err)
  })
}, 50)

// Save every change to storage and notify content scripts (debounced)
effect(() => {
  if (!hasImported.value) return

  // Deep-read so nested deepsignal mutations re-run this effect
  void JSON.stringify(options)

  notifyOptions()
  saveOptions()
})

/** Reset all options to defaults and persist immediately. */
export async function resetOptionsToDefaults(): Promise<void> {
  await applyReset(options, optionsStorage)
}
