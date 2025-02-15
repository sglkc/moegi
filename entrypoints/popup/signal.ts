import { effect } from '@preact/signals'
import { deepSignal } from 'deepsignal'

// Make options reactive and save to storage on every change
export const options = deepSignal(await optionsStorage.getValue())

// Save every changes to storage
effect(() => {
  optionsStorage.setValue(options)
  chrome.runtime.sendMessage(options)
})

// TODO: send effects to content scripts
effect(() => {
  console.log({ ...options.fonts })
})
