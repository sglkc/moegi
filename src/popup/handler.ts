import { TargetedEvent } from 'preact/compat'
import {
  MoegiOptionsKey,
  moegiOptions,
  moegiDefaultOptions
} from '@/services/options'
import { effect } from '@preact/signals'
import ChromeStorage from '@/utils/chrome-storage'

const syncStorage = new ChromeStorage('sync')

// Get current active tab to connect to content script, and send message for
// every time options changed
chrome.tabs
  .query({ active: true, currentWindow: true })
  .then(([tab]) => {
    const port = chrome.tabs.connect(tab.id as number, { name: 'popup' })

    effect(() => port.postMessage({ options: moegiOptions.value }))
  })

// Event handler for input changes in popup
type FormEvent = TargetedEvent<HTMLFormElement, Event> & Readonly<{
  target: Omit<HTMLInputElement & HTMLSelectElement, 'name'> & Readonly<{
    name: MoegiOptionsKey
  }>
}>

export function formInputHandler({ target }: FormEvent) {
  const { checked, name, value } = target
  const castValue = (target.type === 'checkbox') ? Boolean(checked) : value

  moegiOptions.value = Object.assign(
    {},
    moegiOptions.value,
    { [name]: castValue }
  )
}

export async function resetStorageHandler() {
  await syncStorage.remove('options')
  await syncStorage.set({ options: moegiDefaultOptions })
}
