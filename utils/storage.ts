import { storage } from '#imports'
import { effect, signal } from '@preact/signals'
import { deepSignal } from 'deepsignal'
import { moegiDefaultOptions, MoegiOptions } from './options'
import { debounce } from './debounce'

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
  console.log('Saving options...')
}, 1000)

// Save every changes to storage with debouncing
effect(() => {
  if (!hasImported.value) return

  // TODO: debounce sending message here if possible
  chrome.runtime.sendMessage({
    data: { options },
    id: Math.round(Math.random() * 1000),
    sender: {
      id: chrome.runtime.id,
      origin: window.origin
    },
    timestamp: Date.now(),
    type: 'applyOptions'
  })

  // Background.sendMessage('applyOptions', currentOptions)
  saveOptions()
})
