import { effect } from '@preact/signals'
import { moegiOptions, MoegiOptions } from '@/services/options'
import ChromeStorage from '@/utils/chrome-storage'

const syncStorage = new ChromeStorage('sync')

// On popup opened
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'popup') return;

  let effectTimeout: ReturnType<typeof setTimeout> | undefined
  let lastOptions: MoegiOptions = moegiOptions.value

  // On message, save options using debounce function to prevent write errors
  port.onMessage.addListener(({ options }: { options: MoegiOptions }) => {
    effect(() => {
      if (JSON.stringify(options) === JSON.stringify(lastOptions)) return;

      // Store changed options in case user exited the popup before debouncing
      lastOptions = options
      clearTimeout(effectTimeout)

      effectTimeout = setTimeout(() => {
        effectTimeout = undefined
        syncStorage.set({ options })
      }, 250)
    })
  })

  // If popup closed, bypass debounce function and save current options
  port.onDisconnect.addListener(() => syncStorage.set({ options: lastOptions }))
})

// On storage change, compare options and send it to web
syncStorage.onChanged.addListener((changes) => {
  if (!changes.options) return;

  const { newValue, oldValue } = changes.options;

  if (!newValue) return;
  if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;

  window.postMessage({ type: 'moegiOptions', options: newValue })
})
