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
  target: Omit<HTMLInputElement, 'name'> & Readonly<{
    name: MoegiOptionsKey
  }>
}>

export function formInputHandler({ target }: FormEvent) {
  const { checked, name, type, value } = target
  const castValue = (type === 'checkbox') ? Boolean(checked)
    : (type === 'range') ? parseFloat(value)
    : value

  const newOptions = { [name]: castValue }

  moegiOptions.value = Object.assign(
    {},
    moegiOptions.value,
    newOptions
  )
}

export async function resetStorageHandler() {
  await syncStorage.remove('options')
  await syncStorage.set({ options: moegiDefaultOptions })
  moegiOptions.value = Object.assign({}, moegiDefaultOptions)
}
