import { TargetedEvent } from 'preact/compat'
import {
  MoegiOptionsKey,
  moegiOptions,
  moegiOptionsDefault
} from '@/services/options'

// Get saved user options
chrome.storage.sync.get('options').then((result) => {
  moegiOptions.value = Object.assign(
    {},
    moegiOptions.value,
    structuredClone(result.options)
  )
})

// Event handler for any input change in popup
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

  console.log
}

export async function resetStorageHandler() {
  await chrome.storage.sync.clear()
  await chrome.storage.sync.set({ options: moegiOptionsDefault })
}
