import { effect } from '@preact/signals'
import { deepSignal } from 'deepsignal'

// Make options reactive and save to storage on every change
export const options = deepSignal(await optionsStorage.getValue())

// Save every changes to storage
effect(debounce(() => {
  optionsStorage.setValue(options)
  chrome.runtime.sendMessage(options)
}, 1000))

// TODO: send effects to content scripts
effect(() => {
  // console.log({ ...options.fonts })
})
