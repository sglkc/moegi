// Adding the query script and module is not a valid path, it's from crxjs
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
// @ts-ignore
import initUrl from '@/web/init?script&module'
import { effect } from '@preact/signals'
import { moegiOptions, MoegiOptions } from '@/services/options'
import syncStorage from '@/utils/sync-storage'

// Inject initial script to current page with saved options
const initElement = document.createElement('script');

initElement.src = chrome.runtime.getURL(initUrl)
initElement.type = 'module'
initElement.defer = true
initElement.async = true
initElement.dataset.moegiOptions = JSON.stringify(moegiOptions)
document.head.appendChild(initElement);

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'popup') return;

  let effectTimeout: ReturnType<typeof setTimeout> | undefined
  let lastOptions: MoegiOptions

  // On message, save options using debounce function to prevent write errors
  port.onMessage.addListener(({ options }: { options: MoegiOptions }) => {
    effect(() => {
      // options must be referenced in first level to trigger effect
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

  if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;

  window.postMessage({ type: 'moegiOptions', options: newValue })
})
