import { effect } from '@preact/signals'
import { DeepSignal, deepSignal } from 'deepsignal'

// Make options reactive and save to storage on every change
export const options: DeepSignal<MoegiOptions> = deepSignal<MoegiOptions>(moegiDefaultOptions)

let hasImported = false

// Top-level await prevents build
optionsStorage.getValue().then((storedOptions) => {
  Object.assign(options, storedOptions)
  setTimeout(() => hasImported = true, 1000)
})

// Save every changes to storage with debouncing
effect(() => {
  chrome.runtime.sendMessage(options)

  return debounce(() => {
    if (!hasImported) return

    optionsStorage.setValue(options)
    console.log('Saving options...')
  }, 1000)
})

// TODO: send effects to content scripts
effect(() => {
  // console.log({ ...options.fonts })
})
